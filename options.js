document.addEventListener('DOMContentLoaded', function() {
  const apiKeyInput = document.getElementById('api-key');
  const saveButton = document.getElementById('save');
  const statusDiv = document.getElementById('status');

  // Load saved API key
  chrome.storage.sync.get(['groqApiKey'], function(data) {
    if (data.groqApiKey) {
      apiKeyInput.value = data.groqApiKey;
    }
  });

  // Save API key
  saveButton.addEventListener('click', function() {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      showStatus('Please enter your Groq API key', 'error');
      return;
    }
    
    chrome.storage.sync.set({groqApiKey: apiKey}, function() {
      showStatus('Settings saved successfully!', 'success');
    });
  });

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + type;
    
    setTimeout(function() {
      statusDiv.style.display = 'none';
    }, 3000);
  }
});