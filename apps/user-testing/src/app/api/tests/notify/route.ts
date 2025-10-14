import { NextRequest, NextResponse } from 'next/server';
import { generateEmailHTML, generateEmailText } from '@/lib/email-notifications';
import { EmailNotification } from '@/types/test-config';

export async function POST(request: NextRequest) {
  try {
    const notification: EmailNotification = await request.json();

    if (!notification.to || !notification.testResults || notification.testResults.length === 0) {
      return NextResponse.json(
        { error: 'Invalid notification data' },
        { status: 400 }
      );
    }

    // Generate email content
    const htmlContent = generateEmailHTML(notification);
    const textContent = generateEmailText(notification);

    // In production, integrate with your email service (SendGrid, AWS SES, Resend, etc.)
    // For now, we'll log the email and return success
    
    console.log('='.repeat(80));
    console.log('EMAIL NOTIFICATION');
    console.log('='.repeat(80));
    console.log(`To: ${notification.to}`);
    console.log(`Subject: ${notification.subject}`);
    console.log('\n--- TEXT VERSION ---\n');
    console.log(textContent);
    console.log('\n--- HTML VERSION (truncated) ---\n');
    console.log(htmlContent.substring(0, 500) + '...');
    console.log('='.repeat(80));

    // TODO: Integrate with actual email service
    // Example with Resend:
    /*
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'tests@yourdomain.com',
      to: notification.to.split(',').map(e => e.trim()),
      subject: notification.subject,
      html: htmlContent,
      text: textContent,
    });
    */

    // Example with SendGrid:
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send({
      to: notification.to.split(',').map(e => e.trim()),
      from: 'tests@yourdomain.com',
      subject: notification.subject,
      text: textContent,
      html: htmlContent,
    });
    */

    return NextResponse.json({ 
      success: true, 
      message: 'Email notification sent',
      preview: {
        to: notification.to,
        subject: notification.subject,
      }
    });
  } catch (error) {
    console.error('Email notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send email notification' },
      { status: 500 }
    );
  }
}

