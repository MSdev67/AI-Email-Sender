const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
    console.log('Testing email configuration...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not Set');
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        // Verify connection
        await transporter.verify();
        console.log('✅ SMTP connection successful');
        
        // Send test email
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to yourself
            subject: 'Test Email from AI Sender',
            text: 'If you receive this, email configuration is working!'
        });
        
        console.log('✅ Test email sent:', info.messageId);
    } catch (error) {
        console.error('❌ Email test failed:', error);
    }
}

testEmail();