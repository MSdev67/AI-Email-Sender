const express = require('express');
const { OpenAI } = require('openai');
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/generate-email', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt?.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional email assistant. Generate emails with a clear subject line and professional body."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    const subjectLine = content.match(/Subject:\s*(.*)/i);
    
    const subject = subjectLine ? subjectLine[1] : 'Generated Email';
    const body = subjectLine ? content.replace(/Subject:.*\n/i, '') : content;

    res.json({ subject, body });
    
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: 'Failed to generate email' });
  }
});

module.exports = router;