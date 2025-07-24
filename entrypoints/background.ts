export default defineBackground(() => {
  console.log('Hello bacground!', { id: browser.runtime.id });


  let singleTabDomains: string[] = [];

  // Initialize domains from storage
  browser.storage.local.get('domains').then((result) => {
    singleTabDomains = result.domains || [];
  });

  // Helper to get domain from URL
  function getDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  }

  // Check if URL matches any of our domains
  function matchesDomain(url: string): boolean {
    const domain = getDomain(url);
    return singleTabDomains.some(d => domain.includes(d));
  }

  // Store tab IDs for single-tab domains
  const tabMap = new Map<string, number>();

  // Add tab removal listener
  browser.tabs.onRemoved.addListener((tabId) => {
    for (const [domain, existingTabId] of tabMap.entries()) {
      if (existingTabId === tabId) {
        tabMap.delete(domain);
      }
    }
  });

  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.url && matchesDomain(changeInfo.url)) {
      const domain = getDomain(changeInfo.url);
      const existingTabId = tabMap.get(domain);

      if (existingTabId && existingTabId !== tabId) {
        try {
          const existingTab = await browser.tabs.get(existingTabId);
          if (existingTab) {
            await browser.tabs.remove(tabId);
            await browser.tabs.update(existingTabId, { active: true });
          } else {
            tabMap.set(domain, tabId);
          }
        } catch {
          tabMap.set(domain, tabId);
        }
      } else {
        tabMap.set(domain, tabId);
      }
    }
  });

  // Listen for messages from popup
  browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'UPDATE_DOMAINS') {
      singleTabDomains = message.domains;
      // Store in local storage
      browser.storage.local.set({ domains: message.domains });
    }
    if (message.type === 'GET_DOMAINS') {
      return browser.storage.local.get('domains').then(result => result.domains || []);
    }
  });
});

