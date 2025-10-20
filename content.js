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
    const titleElement = document.querySelector('[data-cy="question-title"]');
    if (titleElement) {
      problem = titleElement.textContent || '';
    }
    
    // Alternative selectors for LeetCode
    if (!problem) {
      const altTitle = document.querySelector('.css-v3d350');
      if (altTitle) {
        problem = altTitle.textContent || '';
      }
    }
  }
  
  // GeeksforGeeks
  else if (url.includes('geeksforgeeks.org')) {
    const titleElement = document.querySelector('.problem-statement h1');
    if (titleElement) {
      problem = titleElement.textContent || '';
    }
  }
  
  // HackerRank
  else if (url.includes('hackerrank.com')) {
    const titleElement = document.querySelector('.ui-icon-label.page-label');
    if (titleElement) {
      problem = titleElement.textContent || '';
    }
  }
  
  // Codeforces
  else if (url.includes('codeforces.com')) {
    const titleElement = document.querySelector('.problem-statement .title');
    if (titleElement) {
      problem = titleElement.textContent || '';
    }
  }
  
  // Generic fallback - try to find any h1 that might contain the problem title
  if (!problem) {
    const h1Elements = document.querySelectorAll('h1');
    for (let h1 of h1Elements) {
      const text = h1.textContent.trim();
      if (text && text.length < 100) { // Reasonable title length
        problem = text;
        break;
      }
    }
  }
  
  return problem || 'Unknown Problem';
}