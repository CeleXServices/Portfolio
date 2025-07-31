const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1400082613569458277/L96v8qTi390yMKVHQ92wz56Fl5LfVCiVZatvpqPH5Bxfoi73-ndJZQuU-yXu3QvibwfT';

document.getElementById('contactForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const submitBtn = document.getElementById('submitBtn');
  const submitText = document.getElementById('submitText');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');
  
  submitBtn.disabled = true;
  submitText.classList.add('hidden');
  loadingSpinner.classList.remove('hidden');
  
  successMessage.classList.add('hidden');
  errorMessage.classList.add('hidden');
  
  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());
  
  const embed = {
    embeds: [{
      title: "🚀 New Contact Form Submission",
      color: 0x00D2FF,
      timestamp: new Date().toISOString(),
      fields: [
        {
          name: "👤 Name",
          value: `${data.name} ${data.surname}`,
          inline: true
        },
        {
          name: "📧 Email",
          value: data.email,
          inline: true
        },
        {
          name: "📋 Subject",
          value: data.subject || "Not specified",
          inline: true
        }
      ]
    }]
  };

  if (data.discord) {
    embed.embeds[0].fields.push({
      name: "🎮 Discord",
      value: data.discord,
      inline: true
    });
  }

  if (data.telegram) {
    embed.embeds[0].fields.push({
      name: "💬 Telegram",
      value: data.telegram,
      inline: true
    });
  }

  if (data.company) {
    embed.embeds[0].fields.push({
      name: "🏢 Company",
      value: data.company,
      inline: true
    });
  }

  if (data.budget) {
    embed.embeds[0].fields.push({
      name: "💰 Budget",
      value: data.budget,
      inline: true
    });
  }

  embed.embeds[0].fields.push({
    name: "💬 Message",
    value: data.message.length > 1024 ? data.message.substring(0, 1021) + "..." : data.message,
    inline: false
  });

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(embed)
    });

    if (response.ok) {
      successMessage.classList.remove('hidden');
      this.reset();
      
      successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      throw new Error('Failed to send message');
    }
  } catch (error) {
    console.error('Error:', error);
    errorMessage.classList.remove('hidden');
    document.getElementById('errorText').textContent = 'Failed to send message. Please try again or contact me directly.';
    
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } finally {
    submitBtn.disabled = false;
    submitText.classList.remove('hidden');
    loadingSpinner.classList.add('hidden');
  }
});