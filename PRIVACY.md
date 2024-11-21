# Privacy Policy for UICloner Extension

Last Updated: November 2024

## Overview

UICloner is committed to protecting your privacy. This Privacy Policy explains how we handle information when you use our browser extension.

## Information Collection and Use

### What We DO Collect and Store Locally:
- **LLM API Configuration**: Your API key, endpoint URL, and model name are stored locally in your browser using `browser.storage.local`

### What We DO NOT Collect:
- We do not collect any personal information
- We do not track your browsing history
- We do not collect analytics or usage data
- We do not use cookies

## Data Storage

All data is stored locally in your browser using the browser's built-in storage API. This means:
- Your data never leaves your device (except for API calls to your configured LLM service)
- Your data is not accessible to us or any third parties
- Your data persists only in your browser and can be cleared at any time

## Data Transmission

The only data transmission that occurs is:
1. When you use the UI cloning feature, the selected UI component is sent directly to your configured LLM API endpoint (e.g., OpenAI or Anthropic)
2. This transmission only happens when you explicitly initiate a cloning action
3. The transmission is done using your own API key and credentials

## Third-Party Services

UICloner does not include any third-party analytics, tracking, or advertising services. The only third-party interaction is with the LLM service (like OpenAI or Anthropic) that you explicitly configure.

## Website Access

UICloner requires access to webpage content (`<all_urls>` permission) to:
- Create the selection overlay when you activate the cloning tool
- Capture the UI component you select
- This access is only activated when you explicitly click the extension icon or use the keyboard shortcut (Alt+Shift+S)

## User Control

You have full control over your data:
- You can remove your API configuration at any time through the extension settings
- You can clear all stored data by clearing your browser's extension storage
- You can uninstall the extension to remove all stored data

## Changes to This Policy

We may update this Privacy Policy from time to time. We will notify users of any material changes by updating the "Last Updated" date at the top of this Privacy Policy.

## Contact

If you have any questions about this Privacy Policy, please create an issue on our GitHub repository:
https://github.com/AndySpider/uicloner-extension/issues

## Open Source

UICloner is open source software. You can review our code and privacy practices on GitHub:
https://github.com/AndySpider/uicloner-extension 