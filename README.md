## Singleton Tabs - A Web Extension to reduce tab count

A browser extension that helps you manage tab clutter by ensuring only one tab exists for specified domains.

### Features

- Specify which domains should be limited to a single tab
- Automatically closes duplicate tabs and focuses the existing tab
- Persists domain settings across browser sessions
- Simple popup interface to add/remove domains

### How it works

1. Click the extension icon in your browser toolbar
2. Add domains you want to limit to single tabs (e.g., "gmail.com")
3. When you try to open a new tab with a matching domain:
   - If a tab with that domain already exists, the new tab will close
   - You'll be automatically redirected to the existing tab
   - If no tab exists, the new tab will remain open
  

### Installation

1. Install the extension from the browser store
2. Click the extension icon to open the popup
3. Start adding domains you want to manage

### Development

This extension is built with:
- WXT (Web Extension Tools)
- React for the popup interface
- TypeScript
- Browser Storage API for persistence

To develop locally:
```bash
npm install
npm run dev
```

To build for production:
```bash
wxt build
```
