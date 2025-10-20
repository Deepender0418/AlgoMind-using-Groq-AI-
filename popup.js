document.addEventListener('DOMContentLoaded', function() {
  const problemInfo = document.getElementById('problem-info');
  const problemTitle = document.getElementById('problem-title');
  const getHintBtn = document.getElementById('get-hint');
  const resetHintsBtn = document.getElementById('reset-hints');
  const hintContainer = document.getElementById('hint-container');
  const hintLevel = document.getElementById('hint-level');
  const hintContent = document.getElementById('hint-content');
  const nextHintBtn = document.getElementById('next-hint');
  const showTutorialBtn = document.getElementById('show-tutorial');
  const tutorialContainer = document.getElementById('tutorial-container');
  const tutorialContent = document.getElementById('tutorial-content');
  const settingsLink = document.getElementById('settings-link');

  let currentHintLevel = 0;
  let currentProblem = '';

  // Get current problem from content script
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "getProblem"}, function(response) {
      if (response && response.problem) {
        currentProblem = response.problem;
        problemTitle.textContent = response.problem;
        problemInfo.classList.remove('hidden');
        
        // Check if we have existing hints for this problem
        chrome.storage.local.get(['hintLevels', 'currentHints'], function(data) {
          if (data.hintLevels && data.hintLevels[currentProblem]) {
            currentHintLevel = data.hintLevels[currentProblem];
            if (currentHintLevel > 0) {
              showHint(data.currentHints[currentProblem]);
            }
          }
        });
      } else {
        problemTitle.textContent = 'No problem detected on this page';
      }
    });
  });

  // Get hint button click
  getHintBtn.addEventListener('click', function() {
    if (!currentProblem) {
      alert('No problem detected on this page');
      return;
    }
    
    getHint(1);
  });

  // Next hint button click
  nextHintBtn.addEventListener('click', function() {
    if (currentHintLevel < 3) {
      getHint(currentHintLevel + 1);
    }
  });

  // Show tutorial button click
  showTutorialBtn.addEventListener('click', function() {
    showTutorial();
  });

  // Reset hints button click
  resetHintsBtn.addEventListener('click', function() {
    chrome.storage.local.get(['hintLevels'], function(data) {
      const hintLevels = data.hintLevels || {};
      delete hintLevels[currentProblem];
      
      chrome.storage.local.set({hintLevels: hintLevels}, function() {
        currentHintLevel = 0;
        hintContainer.classList.add('hidden');
        tutorialContainer.classList.add('hidden');
        alert('Hints reset for this problem');
      });
    });
  });

  // Settings link click
  settingsLink.addEventListener('click', function(e) {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });

  // Function to get hint from Groq API
  function getHint(level) {
    // Show loading state
    hintContent.textContent = 'Loading hint...';
    hintContainer.classList.remove('hidden');
    hintLevel.textContent = level;
    
    // Get API key from storage
    chrome.storage.sync.get(['groqApiKey'], function(data) {
      if (!data.groqApiKey) {
        hintContent.textContent = 'Please set your Groq API key in the settings';
        chrome.runtime.openOptionsPage();
        return;
      }
      
      // Prepare the prompt based on hint level
      let prompt = '';
      switch(level) {
        case 1:
          prompt = `Provide a subtle hint for the following coding problem without giving away the solution. Focus on the general approach or strategy: ${currentProblem}`;
          break;
        case 2:
          prompt = `Provide a more direct hint for the following coding problem without giving the full solution. Suggest a specific data structure or algorithm that might be useful: ${currentProblem}`;
          break;
        case 3:
          prompt = `Provide a strong hint for the following coding problem that gives a nudge in the right direction but still doesn't reveal the complete solution. Mention key steps or considerations: ${currentProblem}`;
          break;
      }
      
      // Call Groq API
      fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.groqApiKey}`
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful coding assistant that provides hints for programming problems. You should guide the user toward the solution without giving it away directly. Your hints should be progressive, starting with subtle suggestions and becoming more direct in later stages.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.choices && data.choices[0]) {
          const hint = data.choices[0].message.content;
          hintContent.textContent = hint;
          currentHintLevel = level;
          
          // Save hint to storage
          chrome.storage.local.get(['hintLevels', 'currentHints'], function(storageData) {
            const hintLevels = storageData.hintLevels || {};
            const currentHints = storageData.currentHints || {};
            
            hintLevels[currentProblem] = level;
            currentHints[currentProblem] = hint;
            
            chrome.storage.local.set({
              hintLevels: hintLevels,
              currentHints: currentHints
            });
          });
          
          // Show/hide buttons based on hint level
          if (level < 3) {
            nextHintBtn.classList.remove('hidden');
            showTutorialBtn.classList.add('hidden');
          } else {
            nextHintBtn.classList.add('hidden');
            showTutorialBtn.classList.remove('hidden');
          }
        } else {
          hintContent.textContent = 'Error getting hint. Please try again.';
        }
      })
      .catch(error => {
        console.error('Error:', error);
        hintContent.textContent = 'Error getting hint. Please check your API key and try again.';
      });
    });
  }

  // Function to show existing hint
  function showHint(hint) {
    hintContent.textContent = hint;
    hintContainer.classList.remove('hidden');
    hintLevel.textContent = currentHintLevel;
    
    if (currentHintLevel < 3) {
      nextHintBtn.classList.remove('hidden');
      showTutorialBtn.classList.add('hidden');
    } else {
      nextHintBtn.classList.add('hidden');
      showTutorialBtn.classList.remove('hidden');
    }
  }

  // Function to show tutorial
  function showTutorial() {
    // Search for tutorial on YouTube
    const searchQuery = encodeURIComponent(`${currentProblem} tutorial`);
    const youtubeUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
    
    tutorialContent.innerHTML = `
      <p>We've searched YouTube for tutorials related to this problem:</p>
      <a href="${youtubeUrl}" target="_blank">Open YouTube Search Results</a>
    `;
    
    tutorialContainer.classList.remove('hidden');
  }
});