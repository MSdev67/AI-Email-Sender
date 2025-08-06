const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Create reusable transporter object
const transporter = nodemailer.createTransport(
  process.env.EMAIL_USER && process.env.EMAIL_PASS
    ? {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      }
    : {
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: 'test@ethereal.email',
          pass: 'testpassword'
        }
      }
);

// Verify connection
transporter.verify((error) => {
  if (error) {
    console.error('SMTP Error:', error);
  } else {
    console.log('SMTP Server Ready');
  }
});

router.post('/send', async (req, res) => {
  try {
    const { recipients, subject, body } = req.body;

    // Validate input
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'At least one recipient required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validRecipients = recipients.filter(email => emailRegex.test(email));
    
    if (validRecipients.length === 0) {
      return res.status(400).json({ error: 'No valid email addresses' });
    }

    // Send email
    const info = await transporter.sendMail({
      from: `"AI Email Sender" <${process.env.EMAIL_USER || 'noreply@example.com'}>`,
      to: validRecipients.join(', '),
      subject: subject,
      html: `<div style="font-family: Arial, sans-serif">${body.replace(/\n/g, '<br>')}</div>`,
      text: body
    });

    console.log('Email sent:', info.messageId);
    
    res.json({
      success: true,
      message: 'Email sent successfully',
      previewUrl: nodemailer.getTestMessageUrl(info)
    });

  } catch (error) {
    console.error('Send Error:', error);
    res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message
    });
  }
});

module.exports = router;