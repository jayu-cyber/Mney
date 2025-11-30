import { Resend } from "resend";

export async function sendEmail({ to, subject, react }) {
  const apiKey = process.env.RESEND_API_KEY || "";
  console.log('Initializing Resend with API key length:', apiKey.length);
  
  const resend = new Resend(apiKey);

  try {
    console.log('Attempting to send email to:', to);
    const data = await resend.emails.send({
      from: "Finance App <onboarding@resend.dev>",
      to,
      subject,
      react,
    });
    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email. Error details:", {
      message: error.message,
      stack: error.stack,
      response: error.response
    });
    return { success: false, error: error.message };
  }
}