chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "lookupVerse",
      title: "Lookup Bible Verse",
      contexts: ["selection"]
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "lookupVerse" && info.selectionText && tab?.id) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: fetchBibleVerse,
        args: [info.selectionText]
      });
    }
  });
  
  async function fetchBibleVerse(verse) {
    try {
      const response = await fetch(`https://bible-api.com/${encodeURIComponent(verse)}`);
      if (!response.ok) throw new Error("Failed to fetch verse");
      
      const data = await response.json();
  
      if (data.responseText) {
        alert(`"${verse}": ${data.responseText}`);
      } else {
        alert("Could not fetch the verse. Please check the reference.");
      }
    } catch (error) {
      console.error("Error fetching verse:", error);
      alert("An error occurred while fetching the verse.");
    }
  }
  