# X.com Follow Tab Default

A simple Chrome extension that automatically switches to the "Follow" tab whenever you open X.com (formerly Twitter).

## Features

- Automatically switches from the "For You" tab to the "Follow" tab when you open X.com
- Works on both x.com and twitter.com domains
- Handles single-page app navigation (when you navigate away and back to the home page)

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" by toggling the switch in the top right corner
4. Click "Load unpacked" and select the directory containing this extension
5. The extension should now be installed and active

## How It Works

This extension uses content scripts that run when you visit X.com. It:

1. Detects when you're on the X.com home page
2. Searches for the "Follow" tab using multiple detection methods
3. Automatically clicks on the "Follow" tab when found
4. Continues to monitor for URL changes to handle single-page app navigation

## Troubleshooting

If the extension stops working after X.com updates their website (which happens frequently):

1. Check the browser console for any error messages from the extension
2. The extension may need to be updated with new selectors to find the "Follow" tab

## License

MIT
