// Function to click on the "Follow" tab
function clickFollowTab() {
  console.log('X-Follow-Default: Attempting to find Follow tab');
  
  // Approach 1: Find specific X.com tab navigation elements
  try {
    // This looks for the For You/Following tabs in X's home view
    const tabElements = document.querySelectorAll('[role="tablist"] [role="tab"]');
    console.log(`X-Follow-Default: Found ${tabElements.length} tab elements`);
    
    for (const tab of tabElements) {
      if (tab.textContent && (
          tab.textContent.toLowerCase().includes('follow') || 
          tab.textContent.toLowerCase().includes('following')
        )) {
        console.log('X-Follow-Default: Found Follow/Following tab in tablist');
        tab.click();
        return true;
      }
    }
  } catch (e) {
    console.log('X-Follow-Default: Error in approach 1', e);
  }
  
  // Approach 2: Find by aria attributes which X uses extensively
  try {
    const ariaElements = document.querySelectorAll('[aria-label="Following"], [aria-label="Follow"], [aria-selected][role="tab"]');
    
    if (ariaElements.length > 0) {
      for (const el of ariaElements) {
        if (el.textContent && el.textContent.toLowerCase().match(/follow/)) {
          console.log('X-Follow-Default: Found Follow tab by aria attributes');
          el.click();
          return true;
        }
      }
    }
  } catch (e) {
    console.log('X-Follow-Default: Error in approach 2', e);
  }
  
  // Approach 3: Deep search for any elements that look like nav items with "follow" text
  try {
    // Look for ANY clickable element with text containing "follow"
    const allElements = document.querySelectorAll('a, button, div[role="button"], span[role="button"]');
    for (const element of allElements) {
      if (element.textContent && 
          element.textContent.toLowerCase().match(/\bfollow(ing)?\b/) && 
          !element.textContent.toLowerCase().includes('followers')) {
        console.log('X-Follow-Default: Found element with Follow text', element);
        element.click();
        return true;
      }
    }
  } catch (e) {
    console.log('X-Follow-Default: Error in approach 3', e);
  }
  
  // Approach 4: Look specifically for nav links since X often uses these
  try {
    const navLinks = Array.from(document.querySelectorAll('nav a, a[href="/home"], a[href="/for-you"], a[href="/following"]'));
    for (const link of navLinks) {
      if (link.textContent && (
          link.textContent.toLowerCase().includes('follow') || 
          link.getAttribute('href') === '/following'
        )) {
        console.log('X-Follow-Default: Found Follow tab in navigation links');
        link.click();
        return true;
      }
    }
  } catch (e) {
    console.log('X-Follow-Default: Error in approach 4', e);
  }
  
  console.log('X-Follow-Default: Could not find Follow tab with any method');
  return false;
}

// Function to check if we're on the home page of x.com or twitter.com
function isHomePage() {
  const url = window.location.href.toLowerCase();
  return (
    url === 'https://x.com/' || 
    url === 'https://www.x.com/' || 
    url === 'https://twitter.com/' || 
    url === 'https://www.twitter.com/' ||
    url.match(/^https:\/\/(www\.)?(x|twitter)\.com\/?(?:\?.*)?$/) ||
    url.match(/^https:\/\/(www\.)?(x|twitter)\.com\/home\/?$/)
  );
}

// Intelligent waiting for element function
function waitForElement(selector, maxWaitTime = 10000) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Set timeout to avoid waiting forever
    setTimeout(() => {
      observer.disconnect();
      reject('Timed out waiting for element');
    }, maxWaitTime);
  });
}

// More robust attempt to find and click the tab
async function attemptTabSwitch(maxAttempts = 20, interval = 700) {
  console.log('X-Follow-Default: Starting tab switch attempt');
  let attempts = 0;
  
  // First try immediately
  if (clickFollowTab()) return;
  
  // Then try with a proper interval to give the page time to fully render
  const checkInterval = setInterval(() => {
    attempts++;
    console.log(`X-Follow-Default: Attempt ${attempts} of ${maxAttempts}`);
    
    if (clickFollowTab() || attempts >= maxAttempts) {
      clearInterval(checkInterval);
      console.log(`X-Follow-Default: ${attempts >= maxAttempts ? 'Gave up' : 'Succeeded'} after ${attempts} attempts`);
    }
  }, interval);
}

// Initial execution
console.log('X-Follow-Default: Extension loaded');

if (isHomePage()) {
  console.log('X-Follow-Default: Detected home page on initial load');
  // Wait a bit longer initially for the page to load before starting attempts
  setTimeout(() => attemptTabSwitch(), 1500);
}

// Watch for navigation changes (X.com is a single-page app)
let lastUrl = location.href;

// Override History API methods
const originalPushState = history.pushState;
history.pushState = function() {
  originalPushState.apply(this, arguments);
  if (isHomePage()) {
    console.log('X-Follow-Default: pushState navigation to home detected');
    setTimeout(() => attemptTabSwitch(), 1000);
  }
};

const originalReplaceState = history.replaceState;
history.replaceState = function() {
  originalReplaceState.apply(this, arguments);
  if (isHomePage()) {
    console.log('X-Follow-Default: replaceState navigation to home detected');
    setTimeout(() => attemptTabSwitch(), 1000);
  }
};

// Watch for popstate events
window.addEventListener('popstate', () => {
  if (isHomePage()) {
    console.log('X-Follow-Default: popstate navigation to home detected');
    setTimeout(() => attemptTabSwitch(), 1000);
  }
});

// Backup: watch for DOM changes that might indicate navigation
const observer = new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    if (isHomePage()) {
      console.log('X-Follow-Default: URL changed to homepage via DOM mutation');
      setTimeout(() => attemptTabSwitch(), 1000);
    }
  }
});

observer.observe(document, { 
  subtree: true, 
  childList: true,
  attributes: true,
  attributeFilter: ['href'] 
});
