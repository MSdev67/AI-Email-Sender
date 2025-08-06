class EmailSender {
  constructor() {
    this.apiBase = '/api';
    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.elements = {
      recipients: document.getElementById('recipients'),
      prompt: document.getElementById('prompt'),
      generateBtn: document.getElementById('generateBtn'),
      emailPreview: document.getElementById('emailPreview'),
      emailSubject: document.getElementById('emailSubject'),
      emailBody: document.getElementById('emailBody'),
      sendBtn: document.getElementById('sendBtn'),
      regenerateBtn: document.getElementById('regenerateBtn'),
      status: document.getElementById('status')
    };
  }

  bindEvents() {
    this.elements.generateBtn.addEventListener('click', () => this.generateEmail());
    this.elements.sendBtn.addEventListener('click', () => this.sendEmail());
    this.elements.regenerateBtn.addEventListener('click', () => this.generateEmail());
    
    this.elements.prompt.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') this.generateEmail();
    });
  }

  showStatus(message, type = 'info', duration = 5000) {
    const status = this.elements.status;
    status.textContent = message;
    status.className = `status ${type}`;
    status.classList.remove('hidden');
    
    if (duration) {
      setTimeout(() => {
        status.classList.add('hidden');
      }, duration);
    }
  }

  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  parseRecipients(text) {
    return text.split(/[,;\n]/)
      .map(email => email.trim())
      .filter(email => this.validateEmail(email));
  }

  async generateEmail() {
    const prompt = this.elements.prompt.value.trim();
    if (!prompt) {
      this.showStatus('Please enter a prompt', 'error');
      return;
    }

    this.elements.generateBtn.disabled = true;
    this.elements.generateBtn.textContent = 'Generating...';

    try {
      const response = await fetch(`${this.apiBase}/ai/generate-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();

      if (response.ok) {
        this.elements.emailSubject.value = data.subject;
        this.elements.emailBody.value = data.body;
        this.elements.emailPreview.classList.remove('hidden');
        this.showStatus('Email generated successfully', 'success');
      } else {
        throw new Error(data.error || 'Failed to generate email');
      }
    } catch (error) {
      this.showStatus(error.message, 'error');
      console.error('Generation error:', error);
    } finally {
      this.elements.generateBtn.disabled = false;
      this.elements.generateBtn.textContent = 'Generate Email';
    }
  }

  async sendEmail() {
    const recipients = this.parseRecipients(this.elements.recipients.value);
    const subject = this.elements.emailSubject.value.trim();
    const body = this.elements.emailBody.value.trim();

    if (recipients.length === 0) {
      this.showStatus('Please enter valid email addresses', 'error');
      return;
    }

    if (!subject || !body) {
      this.showStatus('Please complete all email fields', 'error');
      return;
    }

    if (!confirm(`Send this email to ${recipients.join(', ')}?`)) {
      return;
    }

    this.elements.sendBtn.disabled = true;
    this.elements.sendBtn.textContent = 'Sending...';

    try {
      const response = await fetch(`${this.apiBase}/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipients, subject, body })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.showStatus('Email sent successfully!', 'success', 10000);
        
        if (data.previewUrl) {
          setTimeout(() => {
            if (confirm('View email preview?')) {
              window.open(data.previewUrl, '_blank');
            }
          }, 1000);
        }
        
        // Reset form after successful send
        setTimeout(() => {
          this.elements.recipients.value = '';
          this.elements.prompt.value = '';
          this.elements.emailPreview.classList.add('hidden');
        }, 3000);
      } else {
        throw new Error(data.error || 'Failed to send email');
      }
    } catch (error) {
      this.showStatus(error.message, 'error');
      console.error('Send error:', error);
    } finally {
      this.elements.sendBtn.disabled = false;
      this.elements.sendBtn.textContent = 'Send Email';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new EmailSender();
});