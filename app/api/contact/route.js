import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { name, email, message } = await request.json();

    // Validate inputs
    if (!name || !email || !message) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Send email to your inbox
    const response = await resend.emails.send({
      from: "contact@mney.com",
      to: "jayuhatte3848@gmail.com",
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">New Contact Form Submission</h1>
          </div>
          <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px;">
            <p style="margin: 0 0 15px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 0 0 15px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p style="margin: 0 0 15px 0;"><strong>Message:</strong></p>
            <p style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #ec4899; margin: 0;">
              ${message.replace(/\n/g, "<br>")}
            </p>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">
              Reply directly to this email to contact ${name}.
            </p>
          </div>
        </div>
      `,
    });

    // Also send confirmation email to the user
    await resend.emails.send({
      from: "contact@mney.com",
      to: email,
      subject: "We received your message - Mney",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Message Received!</h1>
          </div>
          <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px;">
            <p>Hi ${name},</p>
            <p>Thank you for reaching out to Mney! We've received your message and will get back to you as soon as possible.</p>
            <p><strong>Your message:</strong></p>
            <p style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #ec4899; margin: 0;">
              ${message.replace(/\n/g, "<br>")}
            </p>
            <p style="margin-top: 20px;">Best regards,<br><strong>Mney Team</strong></p>
          </div>
        </div>
      `,
    });

    return Response.json(
      { success: true, message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return Response.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
