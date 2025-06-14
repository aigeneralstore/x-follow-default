// Background script for X.com Follow Tab Default extension
console.log('X-Follow-Default background script loaded');

// Listen for navigation events to X.com or Twitter.com
chrome.webNavigation.onCompleted.addListener(function(details) {
  // Check if this is the main frame (not an iframe)
  if (details.frameId === 0) {
    console.log('X-Follow-Default: Navigation completed to:', details.url);
    
    // Check if we're on the homepage
    const url = details.url.toLowerCase();
    if (url.match(/^https:\/\/(www\.)?(x|twitter)\.com\/?(\?.*)?$/) ||
        url.match(/^https:\/\/(www\.)?(x|twitter)\.com\/home\/?$/)) {
      
      console.log('X-Follow-Default: Detected homepage navigation, injecting script');
      
      // Execute the content script again to ensure it runs after navigation
      chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        function: injectFollowTabClick
      });
    }
  }
}, {
  url: [
    { hostEquals: 'x.com' },
    { hostEquals: 'www.x.com' },
    { hostEquals: 'twitter.com' },
    { hostEquals: 'www.twitter.com' }
  ]
});

// Function to inject into the page to find and click the Follow tab
function injectFollowTabClick() {
  console.log('X-Follow-Default: Background script injected function to click Follow tab');
  
  // Wait to ensure the page is fully loaded
  setTimeout(() => {
    // Try multiple approaches to find and click the "Follow" tab
    
    // Approach 1: Find tab by role and text content
    const tabLists = document.querySelectorAll('[role="tablist"]');
    for (const tabList of tabLists) {
      const tabs = tabList.querySelectorAll('[role="tab"]');
      for (const tab of tabs) {
        if (tab.textContent && (
            tab.textContent.toLowerCase().includes('follow') ||
            tab.textContent.toLowerCase().includes('following')
          ) && !tab.getAttribute('aria-selected')) {
          console.log('X-Follow-Default: Background found Follow tab, clicking');
          tab.click();
          return;
        }
      }
    }
    
    // Approach 2: Find by navigation link with href
    const followingLinks = document.querySelectorAll('a[href="/following"]');
    if (followingLinks.length > 0) {
      console.log('X-Follow-Default: Background found Following link, clicking');
      followingLinks[0].click();
      return;
    }
    
    // Approach 3: Find any nav links with "follow" text
    const allLinks = document.querySelectorAll('a');
    for (const link of allLinks) {
      if (link.textContent && 
          link.textContent.toLowerCase().match(/\bfollow(ing)?\b/) && 
          !link.textContent.toLowerCase().includes('followers')) {
        console.log('X-Follow-Default: Background found link with Follow text, clicking');
        link.click();
        return;
      }
    }
    
    console.log('X-Follow-Default: Background script could not find Follow tab');
  }, 1500); // Delay execution to ensure the page is loaded
}
