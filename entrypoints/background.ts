export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  let singleTabDomains: string[] = [];

  browser.storage.local.get('domains').then((result) => {
    singleTabDomains = result.domains || [];
  });

  function getDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  }

  function matchesDomain(url: string): boolean {
    const domain = getDomain(url);
    return singleTabDomains.some(d => domain.includes(d));
  }

  const tabMap = new Map<string, number>();

  browser.tabs.onRemoved.addListener((tabId) => {
    for (const [key, existingTabId] of tabMap.entries()) {
      if (existingTabId === tabId) {
        tabMap.delete(key);
      }
    }
  });

  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.url && matchesDomain(changeInfo.url)) {
      const domain = getDomain(changeInfo.url);
      const windowId = tab.windowId;
      const mapKey = `${windowId}-${domain}`;
      const existingTabId = tabMap.get(mapKey);

      if (existingTabId && existingTabId !== tabId) {
        try {
          const existingTab = await browser.tabs.get(existingTabId);
          if (existingTab && existingTab.windowId === windowId) {
            await browser.tabs.remove(tabId);
            await browser.tabs.update(existingTabId, { active: true });
          } else {
            tabMap.set(mapKey, tabId);
          }
        } catch {
          tabMap.set(mapKey, tabId);
        }
      } else {
        tabMap.set(mapKey, tabId);
      }
    }
  });

  browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'UPDATE_DOMAINS') {
      singleTabDomains = message.domains;
      browser.storage.local.set({ domains: message.domains });
    }
    if (message.type === 'GET_DOMAINS') {
      return browser.storage.local.get('domains').then(result => result.domains || []);
    }
  });
});

