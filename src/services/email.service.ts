import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendReminderEmail = async (email: string, eventTitle: string, eventDate: Date, location: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Eventful <onboarding@resend.dev>',
      to: [email],
      subject: `Reminder: ${eventTitle} is coming up!`,
      html: `
        <h1>Event Reminder: ${eventTitle}</h1>
        <p>This is a friendly reminder that your event is happening soon!</p>
        <ul>
          <li><strong>Date:</strong> ${eventDate.toDateString()}</li>
          <li><strong>Time:</strong> ${eventDate.toTimeString()}</li>
          <li><strong>Location:</strong> ${location}</li>
        </ul>
        <p>We look forward to seeing you there!</p>
        <p>- The Eventful Team</p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error('Failed to send email');
    }
    return data;
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
};

// ?? NEW: Purchase Confirmation with QR Code
export const sendPurchaseConfirmationEmail = async (email: string, eventTitle: string, qrCodeBase64: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Eventful <onboarding@resend.dev>',
      to: [email],
      subject: `??? Your Ticket for ${eventTitle} is Ready!`,
      html: `
        <h1>Payment Successful!</h1>
        <p>Thank you for purchasing a ticket for <strong>${eventTitle}</strong>.</p>
        <p>Please present the QR code below at the event entrance to be scanned:</p>
        <br />
        <!-- Embed the Base64 QR code directly into the email -->
        <img src="${qrCodeBase64}" alt="Event Ticket QR Code" style="width: 200px; height: 200px; display: block; margin: 0 auto;" />
        <br />
        <p style="font-size: 12px; color: #888;">Please do not share this QR code with anyone else. It is uniquely tied to your ticket.</p>
        <p>We look forward to seeing you at the event!</p>
        <p>- The Eventful Team</p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error('Failed to send confirmation email');
    }
    return data;
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
};
