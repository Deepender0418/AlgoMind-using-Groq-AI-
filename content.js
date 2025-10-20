// Content script to extract problem information from coding platforms

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "getProblem") {
    const problem = extractProblem();
    sendResponse({problem: problem});
  }
  return true;
});

// Function to extract problem from different platforms
function extractProblem() {
  const url = window.location.href;
  let problem = '';

  // LeetCode
  if (url.includes('leetcode.com')) {
    const titleElement = document.querySelector('[data-cy="question_title"]') || document.querySelector('[data-cy="question-title"]');
    if (titleElement) {
      problem = titleElement.textContent.trim() || '';
    }
  }

  // GeeksforGeeks
  else if (url.includes('geeksforgeeks.org')) {
    const titleElement = document.querySelector('.problem-statement h1') || document.querySelector('#problemTitle') || document.querySelector('.problem-header');
    if (titleElement) {
      problem = titleElement.textContent.trim() || '';
    }
  }

  // HackerRank
  else if (url.includes('hackerrank.com')) {
    const titleElement = document.querySelector('.challenge-headline') || document.querySelector('.ui-icon-label.page-label') || document.querySelector('#problem-title');
    if (titleElement) {
      problem = titleElement.textContent.trim() || '';
    }
  }

  // Codeforces
  else if (url.includes('codeforces.com')) {
    const titleElement = document.querySelector('.problem-statement .title') || document.querySelector('.problem-statement h1');
    if (titleElement) {
      problem = titleElement.textContent.trim() || '';
    }
  }

  // Coderbyte
  else if (url.includes('coderbyte.com')) {
    const titleElement = document.querySelector('.challenge-title') || document.querySelector('h1');
    if (titleElement) {
      problem = titleElement.textContent.trim() || '';
    }
  }

  // Codewars
  else if (url.includes('codewars.com')) {
    const titleElement = document.querySelector('.ml-2') || document.querySelector('.kata-info h4') || document.querySelector('.challenge-title');
    if (titleElement) {
      problem = titleElement.textContent.trim() || '';
    }
  }

  // Generic fallback - try to find page title without site name
  if (!problem || problem === 'Unknown Problem') {
    const pageTitle = document.title;
    const separatorIndex = pageTitle.indexOf(' - ') || pageTitle.indexOf(' | ') || pageTitle.indexOf(' · ');
    if (separatorIndex > 0) {
      problem = pageTitle.substring(0, separatorIndex).trim();
    } else {
      problem = pageTitle.trim();
    }
    // Validate length
    if (problem.length > 100 || !problem) problem = 'Unknown Problem';
  }

  return problem || 'Unknown Problem';
}
