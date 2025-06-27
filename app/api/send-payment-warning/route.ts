import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { to, name, registrationId, amount, dueDate } = await request.json();

    if (!to || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: to, name' },
        { status: 400 }
      );
    }

    const paymentWarningEmailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Reminder - NCC Robotics Workshop 2025</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
            color: #ffffff;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #000000;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(255, 193, 7, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #FFC107 0%, #FFD54F 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: rotate 20s linear infinite;
        }
        @keyframes rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .header-content {
            position: relative;
            z-index: 2;
        }
        .logo {
            font-size: 32px;
            font-weight: 900;
            color: #000000;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .subtitle {
            font-size: 16px;
            color: #000000;
            font-weight: 600;
            opacity: 0.8;
        }
        .warning-banner {
            background: linear-gradient(135deg, #FF5722 0%, #FF7043 100%);
            padding: 20px 30px;
            text-align: center;
            border-bottom: 3px solid #FFC107;
        }
        .warning-icon {
            font-size: 48px;
            margin-bottom: 10px;
            display: block;
        }
        .warning-title {
            font-size: 24px;
            font-weight: 900;
            color: #ffffff;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .content {
            padding: 40px 30px;
            background: #111111;
        }
        .greeting {
            font-size: 20px;
            font-weight: 700;
            color: #FFC107;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            line-height: 1.6;
            color: #cccccc;
            margin-bottom: 30px;
        }
        .payment-details {
            background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
            border: 2px solid #FFC107;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            position: relative;
            overflow: hidden;
        }
        .payment-details::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #FFC107, #FFD54F, #FFC107);
        }
        .payment-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #333;
        }
        .payment-row:last-child {
            border-bottom: none;
            font-weight: 700;
            font-size: 18px;
            color: #FFC107;
        }
        .payment-label {
            color: #999;
            font-weight: 500;
        }
        .payment-value {
            color: #ffffff;
            font-weight: 600;
        }
        .urgent-notice {
            background: linear-gradient(135deg, #D32F2F 0%, #F44336 100%);
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
            border: 2px solid #FF5722;
        }
        .urgent-text {
            font-size: 16px;
            font-weight: 700;
            color: #ffffff;
            margin: 0;
        }
        .cta-section {
            text-align: center;
            margin: 40px 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #FFC107 0%, #FFD54F 100%);
            color: #000000;
            text-decoration: none;
            padding: 18px 40px;
            border-radius: 50px;
            font-weight: 900;
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 8px 25px rgba(255, 193, 7, 0.3);
            transition: all 0.3s ease;
            border: 3px solid #FFC107;
        }
        .payment-methods {
            background: #0a0a0a;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            border: 1px solid #333;
        }
        .method-title {
            font-size: 18px;
            font-weight: 700;
            color: #FFC107;
            margin-bottom: 15px;
            text-align: center;
        }
        .method-item {
            background: #1a1a1a;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
            border-left: 4px solid #FFC107;
        }
        .method-name {
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 5px;
        }
        .method-details {
            color: #ccc;
            font-size: 14px;
        }
        .footer {
            background: #0a0a0a;
            padding: 30px;
            text-align: center;
            border-top: 2px solid #FFC107;
        }
        .footer-text {
            color: #888;
            font-size: 14px;
            line-height: 1.5;
            margin-bottom: 15px;
        }
        .contact-info {
            color: #FFC107;
            font-weight: 600;
        }
        .robot-emoji {
            font-size: 24px;
            margin: 0 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="header-content">
                <div class="logo">
                    🤖 NCC Robotics Workshop 2025
                </div>
                <div class="subtitle">
                    Payment Reminder Notice
                </div>
            </div>
        </div>

        <!-- Warning Banner -->
        <div class="warning-banner">
            <span class="warning-icon">⚠️</span>
            <h1 class="warning-title">Payment Pending</h1>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">
                Hello ${name}! 👋
            </div>

            <div class="message">
                We hope this email finds you well! We're excited to have you registered for the <strong>NCC Robotics Workshop 2025</strong>, but we notice that your payment is still pending.
            </div>

            <!-- Payment Details -->
            <div class="payment-details">
                <div class="payment-row">
                    <span class="payment-label">Registration ID:</span>
                    <span class="payment-value">${registrationId || 'NCR2025-XXXX'}</span>
                </div>
                <div class="payment-row">
                    <span class="payment-label">Event:</span>
                    <span class="payment-value">NCC Robotics Workshop 2025</span>
                </div>
                <div class="payment-row">
                    <span class="payment-label">Payment Due Date:</span>
                    <span class="payment-value">${dueDate || 'ASAP'}</span>
                </div>
                <div class="payment-row">
                    <span class="payment-label">Amount Due:</span>
                    <span class="payment-value">৳${amount || '100'}</span>
                </div>
            </div>

            <!-- Urgent Notice -->
            <div class="urgent-notice">
                <p class="urgent-text">
                    ⏰ Please complete your payment as soon as possible to secure your spot!
                </p>
            </div>

            <div class="message">
                To avoid any issues with your registration and to ensure your participation in this amazing robotics workshop, please complete your payment at your earliest convenience.
            </div>

            <!-- CTA Button -->
            <div class="cta-section">
                <a href="http://localhost:3000/user" class="cta-button">
                    💳 Complete Payment Now
                </a>
            </div>

            <!-- Payment Methods -->
            <div class="payment-methods">
                <div class="method-title">💰 Available Payment Methods</div>
                
                <div class="method-item">
                    <div class="method-name">🏦 Bank Transfer (Recommended)</div>
                    <div class="method-details">
                        Account: [Bank Account Details]<br>
                        Reference: Your Registration ID
                    </div>
                </div>

                <div class="method-item">
                    <div class="method-name">📱 Mobile Banking</div>
                    <div class="method-details">
                        bKash/Nagad/Rocket<br>
                        Send money and keep the transaction ID
                    </div>
                </div>

                <div class="method-item">
                    <div class="method-name">💳 Card Payment</div>
                    <div class="method-details">
                        Online payment through our secure portal<br>
                        Visa, MasterCard, and local cards accepted
                    </div>
                </div>
            </div>

            <div class="message">
                <strong>Important Notes:</strong>
                <ul style="color: #ccc; line-height: 1.8;">
                    <li>After payment, please upload your payment screenshot in your user dashboard</li>
                    <li>Include your Registration ID in the payment reference</li>
                    <li>Payment verification may take 24-48 hours</li>
                    <li>Contact us immediately if you face any payment issues</li>
                </ul>
            </div>

            <div class="message">
                We can't wait to see you at the workshop where you'll learn about cutting-edge robotics technology, build amazing projects, and connect with fellow robotics enthusiasts! 🚀
            </div>

            <div class="message">
                Thank you for your understanding and prompt action!
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-text">
                <strong>NCC Robotics Workshop 2025</strong><br>
                Organized by: [Organization Name]<br>
                Date: [Workshop Date] | Venue: [Workshop Venue]
            </div>
            
            <div class="contact-info">
                📧 Email: support@nccrobotics.online | 📞 Phone: +880-XXXX-XXXX
            </div>
            
            <div class="footer-text" style="margin-top: 20px;">
                This is an automated payment reminder. If you have already completed your payment, please disregard this email.
            </div>
        </div>
    </div>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'NCC Robotics Workshop <onboarding@resend.dev>',
      to: [to],
      subject: `⚠️ Payment Reminder - NCC Robotics Workshop 2025 | Registration: ${registrationId || 'NCR2025'}`,
      html: paymentWarningEmailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send payment warning email', details: error },
        { status: 500 }
      );
    }

    console.log('Payment warning email sent successfully:', data);
    return NextResponse.json({ 
      success: true, 
      data,
      message: `Payment warning email sent to ${name} (${to})` 
    });

  } catch (error) {
    console.error('Payment warning email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
