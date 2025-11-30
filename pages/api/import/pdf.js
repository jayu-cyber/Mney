
const { IncomingForm } = require('formidable');
const fs = require('fs');
const pdfParse = require('pdf-parse');

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get auth from request - use getAuth for Pages API routes
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
    let file = files.file;
    if (Array.isArray(file)) file = file[0];
    if (!file || !file.filepath) {
      res.status(400).json({ error: 'No file uploaded or file path missing' });
      return;
    }
    
    // Get accountId from form fields
    const accountId = Array.isArray(fields.accountId) ? fields.accountId[0] : fields.accountId;
    if (!accountId) {
      res.status(400).json({ error: 'Account ID is required' });
      return;
    }
    
    try {
      // Import db and get user
      const { db } = await import('@/lib/prisma');
      
      const user = await db.user.findUnique({
        where: { clerkUserId: userId },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const account = await db.account.findUnique({
        where: {
          id: accountId,
          userId: user.id,
        },
      });

      if (!account) {
        res.status(404).json({ error: 'Account not found or unauthorized' });
        return;
      }
      const pdfBuffer = fs.readFileSync(file.filepath);
      const pdfData = await pdfParse(pdfBuffer);
      const text = pdfData.text;
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      // Debug: print first 50 lines to server log for regex tuning
      console.log('PDF Extracted Text (first 1000 chars):', text.substring(0, 1000));
      console.log('PDF Extracted Lines (first 50):', lines.slice(0, 50));
      
      const transactions = [];
      
      // Try multiple patterns to match different PDF formats
      for (let i = 0; i < lines.length; i++) {
        const currentLine = lines[i];
        
        // Pattern 1: Date on one line, transaction on line i+2
        // Match date like 'Nov 15, 2025' or '15 Nov 2025' or '2025-11-15'
        const datePatterns = [
          /^[A-Za-z]{3} \d{1,2}, \d{4}$/, // Nov 15, 2025
          /^\d{1,2} [A-Za-z]{3} \d{4}$/, // 15 Nov 2025
          /^\d{4}-\d{2}-\d{2}$/, // 2025-11-15
          /^\d{1,2}\/\d{1,2}\/\d{4}$/, // 11/15/2025
        ];
        
        let matchedDate = null;
        for (const pattern of datePatterns) {
          if (pattern.test(currentLine)) {
            matchedDate = currentLine;
            break;
          }
        }
        
        if (matchedDate) {
          // Look for transaction details in nearby lines
          // Check current line, next line, and line after next
          for (let j = i; j < Math.min(i + 5, lines.length); j++) {
            const checkLine = lines[j];
            
            // Match DEBIT₹31Paid to ... or CREDIT₹200Received from ...
            // Also try variations like DEBIT ₹31, DEBIT: ₹31, etc.
            const transactionPatterns = [
              /^(DEBIT|CREDIT)[\s:]*₹?([\d,.]+)(.+)$/i,
              /^(DEBIT|CREDIT)[\s:]*([\d,.]+)\s*₹(.+)$/i,
              /^(.+?)[\s:]*₹?([\d,.]+)\s*(DEBIT|CREDIT)$/i,
            ];
            
            for (const pattern of transactionPatterns) {
              const match = checkLine.match(pattern);
              if (match) {
                let type, amount, description;
                
                if (match[1] === 'DEBIT' || match[1] === 'CREDIT') {
                  type = match[1].toUpperCase();
                  amount = parseFloat(match[2].replace(/,/g, ''));
                  description = match[3]?.trim() || 'Transaction';
                } else {
                  // Pattern where description comes first
                  description = match[1]?.trim() || 'Transaction';
                  amount = parseFloat(match[2].replace(/,/g, ''));
                  type = match[3]?.toUpperCase() || (amount < 0 ? 'DEBIT' : 'CREDIT');
                }
                
                if (!isNaN(amount) && amount !== 0) {
                  const transactionType = type === 'DEBIT' ? 'EXPENSE' : 'INCOME';
                  transactions.push({
                    date: matchedDate,
                    description: description || 'Transaction',
                    amount: Math.abs(amount),
                    type: transactionType,
                  });
                  break; // Found transaction, move to next date
                }
              }
            }
          }
        }
      }
      
      console.log(`Found ${transactions.length} transactions in PDF`);
      
      if (transactions.length === 0) {
        res.status(400).json({ error: 'No transactions found in PDF. Please check the PDF format.' });
        return;
      }
      
      let successCount = 0;
      const errors = [];
      let currentBalance = account.balance.toNumber();
      
      // Create transactions directly in database
      for (const tx of transactions) {
        try {
          // Validate and parse data
          const amountNum = Number(tx.amount);
          if (Number.isNaN(amountNum) || amountNum === 0) {
            errors.push(`Invalid amount: ${tx.amount}`);
            continue;
          }

          const dateObj = tx.date ? new Date(tx.date) : new Date();
          if (isNaN(dateObj.getTime())) {
            errors.push(`Invalid date: ${tx.date}`);
            continue;
          }

          // Calculate balance change
          const balanceChange = tx.type === "EXPENSE" ? -amountNum : amountNum;
          const newBalance = currentBalance + balanceChange;

          // Create transaction in database
          await db.$transaction(async (dbTx) => {
            await dbTx.transaction.create({
              data: {
                type: tx.type,
                amount: amountNum,
                description: tx.description || null,
                date: dateObj,
                accountId: accountId,
                userId: user.id,
                isRecurring: false,
                recurringInterval: null,
                nextRecurrence: null,
              },
            });

            await dbTx.account.update({
              where: { id: accountId },
              data: { balance: newBalance },
            });
          });

          currentBalance = newBalance;
          successCount++;
        } catch (error) {
          errors.push(`Failed to create transaction: ${error.message}`);
          console.error('Transaction creation error:', error);
        }
      }
      
      if (successCount === 0) {
        res.status(500).json({ 
          error: 'Failed to import any transactions', 
          details: errors 
        });
        return;
      }
      
      res.status(200).json({ 
        success: true, 
        count: successCount,
        total: transactions.length,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (e) {
      console.error('PDF import error:', e);
      res.status(500).json({ error: e.message || 'Failed to process PDF file' });
    }
  });
}
