const { IncomingForm } = require('formidable');
const fs = require('fs');
const Tesseract = require('tesseract.js');

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get auth from request
  let userId = null;
  try {
    const { getAuth } = await import('@clerk/nextjs/server');
    const authResult = await getAuth(req);
    userId = authResult?.userId;
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const form = new IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).json({ error: 'File upload error' });
      return;
    }

    let file = files.image;
    if (Array.isArray(file)) file = file[0];
    if (!file || !file.filepath) {
      res.status(400).json({ error: 'No image uploaded' });
      return;
    }

    try {
      // Read image file
      const imageBuffer = fs.readFileSync(file.filepath);
      
      // Use Tesseract.js for OCR
      const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng', {
        logger: (m) => console.log(m), // Optional: log progress
      });

      console.log('Extracted text from receipt:', text);

      // Parse the extracted text to find transaction details
      const parsedData = parseReceiptText(text);

      // Clean up temp file
      fs.unlinkSync(file.filepath);

      res.status(200).json({
        success: true,
        data: parsedData,
        rawText: text, // For debugging
      });
    } catch (error) {
      console.error('Receipt scan error:', error);
      // Clean up temp file on error
      if (file && file.filepath && fs.existsSync(file.filepath)) {
        fs.unlinkSync(file.filepath);
      }
      res.status(500).json({ error: error.message || 'Failed to scan receipt' });
    }
  });
}

/**
 * Parse receipt text to extract transaction details
 * Uses pattern matching to find: date, amount, merchant/description
 */
function parseReceiptText(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let amount = null;
  let date = null;
  let description = null;
  let merchant = null;

  // Extract amount (look for currency symbols and numbers)
  // Try multiple patterns, prioritize "TOTAL" or "AMOUNT" keywords
  const amountPatterns = [
    /(?:total|grand\s+total|amount\s+due|payable|paid)\s*:?\s*[₹Rs\.]?\s*([\d,]+\.?\d*)/i,
    /[₹Rs\.]\s*([\d,]+\.?\d*)/g,
    /(?:total|amount)\s*([\d,]+\.?\d*)/i,
    /([\d,]+\.?\d*)\s*(?:₹|Rs\.?|INR)/i,
  ];

  // Find all potential amounts and take the largest (usually the total)
  const allAmounts = [];
  for (const pattern of amountPatterns) {
    const matches = [...text.matchAll(new RegExp(pattern.source, 'gi'))];
    matches.forEach(match => {
      const value = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(value) && value > 0 && value < 10000000) { // Reasonable limit
        allAmounts.push(value);
      }
    });
  }

  if (allAmounts.length > 0) {
    // Take the largest amount (usually the total)
    amount = Math.max(...allAmounts);
  }

  // Extract date (look for common date formats)
  const datePatterns = [
    /(?:date|dated?|on)\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
    /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/i,
    /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/, // YYYY-MM-DD format
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        let dateStr = match[1];
        // Normalize date format
        if (dateStr.includes('/') || dateStr.includes('-')) {
          const parts = dateStr.split(/[\/\-]/);
          if (parts.length === 3) {
            // Try different date formats
            let parsedDate;
            if (parts[0].length === 4) {
              // YYYY-MM-DD
              parsedDate = new Date(dateStr);
            } else {
              // DD-MM-YYYY or MM-DD-YYYY
              parsedDate = new Date(parts[2] + '-' + parts[1] + '-' + parts[0]);
            }
            if (!isNaN(parsedDate.getTime()) && parsedDate.getFullYear() > 2000 && parsedDate.getFullYear() <= new Date().getFullYear() + 1) {
              date = parsedDate.toISOString().split('T')[0];
              break;
            }
          }
        } else {
          const parsedDate = new Date(dateStr);
          if (!isNaN(parsedDate.getTime()) && parsedDate.getFullYear() > 2000) {
            date = parsedDate.toISOString().split('T')[0];
            break;
          }
        }
      } catch (e) {
        // Continue to next pattern
      }
    }
  }

  // Extract merchant/description (usually first few lines or after "from", "at", etc.)
  const merchantPatterns = [
    /(?:from|at|merchant|store|vendor)\s*:?\s*(.+?)(?:\n|$)/i,
    /^([A-Z][A-Z\s&]+(?:STORE|SHOP|RESTAURANT|MALL|MARKET|CAFE|HOTEL|SUPERMARKET))/i,
    /^([A-Z][A-Za-z\s&]{3,30})/,
  ];

  for (const pattern of merchantPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      if (candidate.length > 3 && candidate.length < 100 && !candidate.match(/^\d+$/)) {
        merchant = candidate;
        break;
      }
    }
  }

  // If no merchant found, use first meaningful line
  if (!merchant) {
    for (const line of lines.slice(0, 8)) {
      if (line.length > 5 && 
          line.length < 100 &&
          !line.match(/^\d+/) && 
          !line.match(/date|total|amount|paid|receipt|invoice/i) &&
          !line.match(/^[₹Rs\.\d\s,]+$/)) {
        merchant = line.substring(0, 100);
        break;
      }
    }
  }

  description = merchant || 'Receipt Transaction';

  return {
    amount: amount,
    date: date || new Date().toISOString().split('T')[0],
    description: description,
    type: 'EXPENSE', // Receipts are usually expenses
  };
}

