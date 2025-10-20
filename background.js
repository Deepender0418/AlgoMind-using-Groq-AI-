// Background script for AlgoMind extension

// Set up default storage values
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.set({
    hintLevels: {},
    currentHints: {}
  });
  
  // Open options page on install
  chrome.runtime.openOptionsPage();
});