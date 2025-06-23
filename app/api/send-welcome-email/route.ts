import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Email API called');
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('FROM_EMAIL:', process.env.FROM_EMAIL);
    
    const { email, name, registrationId } = await request.json();
    console.log('📧 Email request data:', { email, name, registrationId });

    if (!email || !name) {
      console.log('❌ Missing email or name');
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );    }    const data = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'NCC Robotics <mdjobayerarafat@gmail.com>',
      to: [email], // Send to the user's actual email address
      subject: '🤖 Welcome to NCC Robotics Workshop 2025! Registration Confirmed',      text: `
        Welcome to NCC Robotics Workshop 2025!
        
        Dear ${name},
        
        Congratulations! You have successfully registered for the NCC Robotics Workshop 2025.
        
        Registration Details:
        - Name: ${name}
        - Email: ${email}
        - Registration ID: ${registrationId || 'NCR-' + Date.now()}
        - Workshop Date: June 30, 2025
        - Status: CONFIRMED
        
        What's Next?
        - Save the Date: June 30, 2025 - Workshop Day
        - Check Your Email: We'll send updates and important information
        - Prepare for Fun: No prior experience needed - just bring your enthusiasm!
        - Tell Your Friends: Registration is still open until June 29
        
        Need Help?
        Farhan Kabir Sifat (Segment Head)
        Email: ncc.robotics.segment@gmail.com
        Phone: +880 1718-360044
        
        We typically respond within 24 hours.
        
        Best regards,
        NCC Robotics Team
        NITER COMPUTER CLUB (NCC)
        Dhaka, Bangladesh
      `,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to NCC Robotics Workshop 2025</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              background-color: #000000;
              font-family: 'Arial', sans-serif;
              color: #ffffff;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
              border: 2px solid #fbbf24;
            }
            .header {
              background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
              padding: 30px 20px;
              text-align: center;
              color: #000000;
            }            .logo {
              width: 60px;
              height: 60px;
              background-color: #000000;
              border-radius: 50%;
              margin: 0 auto 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }
            .logo img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              border-radius: 50%;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 2px;
            }
            .header p {
              margin: 10px 0 0;
              font-size: 16px;
              font-weight: 600;
              opacity: 0.8;
            }
            .content {
              padding: 40px 30px;
            }
            .welcome-section {
              text-align: center;
              margin-bottom: 40px;
            }
            .welcome-section h2 {
              color: #fbbf24;
              font-size: 24px;
              margin: 0 0 15px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .welcome-section p {
              font-size: 16px;
              line-height: 1.6;
              color: #e5e7eb;
              margin: 0;
            }
            .details-section {
              background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
              border: 1px solid #fbbf24;
              border-radius: 12px;
              padding: 30px;
              margin: 30px 0;
            }
            .details-section h3 {
              color: #fbbf24;
              font-size: 20px;
              margin: 0 0 20px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .detail-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 12px 0;
              border-bottom: 1px solid #374151;
            }
            .detail-item:last-child {
              border-bottom: none;
            }
            .detail-label {
              font-weight: bold;
              color: #9ca3af;
              text-transform: uppercase;
              font-size: 14px;
              letter-spacing: 0.5px;
            }
            .detail-value {
              color: #ffffff;
              font-weight: bold;
              font-size: 16px;
            }
            .highlight-box {
              background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
              color: #000000;
              padding: 20px;
              border-radius: 8px;
              margin: 25px 0;
              text-align: center;
            }
            .highlight-box h4 {
              margin: 0 0 10px;
              font-size: 18px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .highlight-box p {
              margin: 0;
              font-size: 14px;
              font-weight: 600;
            }
            .next-steps {
              background: #1f2937;
              border-left: 4px solid #fbbf24;
              padding: 20px;
              margin: 30px 0;
            }
            .next-steps h4 {
              color: #fbbf24;
              margin: 0 0 15px;
              font-size: 18px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .next-steps ul {
              margin: 0;
              padding-left: 20px;
              color: #e5e7eb;
            }
            .next-steps li {
              margin: 8px 0;
              line-height: 1.5;
            }
            .contact-section {
              background: #1f2937;
              border-radius: 8px;
              padding: 25px;
              margin: 30px 0;
              text-align: center;
            }
            .contact-section h4 {
              color: #fbbf24;
              margin: 0 0 15px;
              font-size: 18px;
              text-transform: uppercase;
            }
            .contact-info {
              color: #e5e7eb;
              font-size: 14px;
              line-height: 1.6;
            }
            .contact-info strong {
              color: #ffffff;
            }
            .footer {
              background: #1f2937;
              padding: 25px;
              text-align: center;
              border-top: 2px solid #fbbf24;
            }
            .footer p {
              margin: 0;
              color: #9ca3af;
              font-size: 12px;
            }
            .footer .footer-title {
              color: #fbbf24;
              font-weight: bold;
              font-size: 16px;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 10px;
            }
            @media (max-width: 600px) {
              .container {
                margin: 0 10px;
              }
              .content {
                padding: 20px 15px;
              }
              .details-section {
                padding: 20px;
              }
              .header h1 {
                font-size: 24px;
              }
              .detail-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 5px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">            <div class="header">
              <div class="logo">
                <img src="${process.env.EMAIL_LOGO_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/logo.jpeg" alt="NCC Robotics Logo" />
              </div>
              <h1>NCC Robotics</h1>
              <p>Workshop 2025</p>
            </div>
            
            <div class="content">
              <div class="welcome-section">
                <h2>🎉 Registration Confirmed!</h2>
                <p>
                  Dear <strong>${name}</strong>,<br><br>
                  Congratulations! You have successfully registered for the NCC Robotics Workshop 2025. 
                  We're thrilled to have you join us for this exciting journey into the world of robotics and innovation.
                </p>
              </div>

              <div class="details-section">
                <h3>📋 Registration Details</h3>
                <div class="detail-item">
                  <span class="detail-label">Name</span>
                  <span class="detail-value">${name}</span>
                </div>                <div class="detail-item">
                  <span class="detail-label">Email</span>
                  <span class="detail-value">${email}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Registration ID</span>
                  <span class="detail-value">${registrationId || 'NCR-' + Date.now()}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Workshop Date</span>
                  <span class="detail-value">June 30, 2025</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Status</span>
                  <span class="detail-value">✅ CONFIRMED</span>
                </div>
              </div>

              <div class="highlight-box">
                <h4>🤖 FREE Workshop + Certificate</h4>
                <p>All materials, equipment, and refreshments provided • Digital completion certificate included</p>
              </div>

              <div class="next-steps">
                <h4>🚀 What's Next?</h4>
                <ul>
                  <li><strong>Save the Date:</strong> June 30, 2025 - Workshop Day</li>
                  <li><strong>Check Your Email:</strong> We'll send updates and important information</li>
                  <li><strong>Prepare for Fun:</strong> No prior experience needed - just bring your enthusiasm!</li>
                  <li><strong>Tell Your Friends:</strong> Registration is still open until June 29</li>
                  <li><strong>Follow Us:</strong> Stay updated on our social media channels</li>
                </ul>
              </div>

              <div class="contact-section">
                <h4>📞 Need Help?</h4>
                <div class="contact-info">
                  <strong>Farhan Kabir Sifat</strong> (Segment Head)<br>
                  📧 Email: <strong>ncc.robotics.segment@gmail.com</strong><br>
                  📱 Phone: <strong>+880 1718-360044</strong><br><br>
                  <em>We typically respond within 24 hours</em>
                </div>
              </div>
            </div>

            <div class="footer">
              <p class="footer-title">NCC Robotics Workshop 2025</p>
              <p>National Institute of Technology (NIT) • Dhaka, Bangladesh</p>
              <p>© 2025 NCCROBOTICS WORKSHOP. ALL RIGHTS RESERVED.</p>
            </div>
          </div>
        </body>
        </html>
      `,    });    console.log('✅ Email sent successfully:', data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('❌ Error sending email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to send email', details: errorMessage },
      { status: 500 }
    );
  }
}
