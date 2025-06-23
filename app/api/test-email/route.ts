import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();
    
    console.log('🧪 Test email API called with:', { email, name });
    
    // Call the actual email API
    const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-welcome-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        name,
        registrationId: 'TEST-' + Date.now(),
      }),
    });

    const responseData = await emailResponse.json();
    
    if (emailResponse.ok) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test email sent successfully!',
        data: responseData 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to send test email',
        error: responseData 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error sending test email',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
