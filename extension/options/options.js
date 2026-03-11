// options/options.js

async function loadOptions() {
  const data = await chrome.storage.sync.get("saveHistory");
  document.getElementById("save-history").checked = data.saveHistory !== false;
}

async function loadFixLog() {
  const all = await chrome.storage.local.get(null);
  const logEl = document.getElementById("fix-log-list");
  const entries = Object.entries(all).filter(([k]) => k.startsWith("fixLog:"));

  if (entries.length === 0) {
    logEl.textContent = "No history yet.";
    return;
  }

  logEl.innerHTML = entries
    .map(([key, val]) => {
      const host = key.replace("fixLog:", "");
      return `<div><strong>${host}</strong> — ${val.count} fix${val.count !== 1 ? "es" : ""} · ${new Date(val.timestamp).toLocaleDateString()}</div>`;
    })
    .join("");
}

document.getElementById("save-btn").addEventListener("click", async () => {
  await chrome.storage.sync.set({
    saveHistory: document.getElementById("save-history").checked,
  });
  const msg = document.getElementById("saved-msg");
  msg.style.display = "inline";
  setTimeout(() => (msg.style.display = "none"), 2000);
});

document.getElementById("clear-log").addEventListener("click", async () => {
  const all = await chrome.storage.local.get(null);
  const keys = Object.keys(all).filter((k) => k.startsWith("fixLog:"));
  await chrome.storage.local.remove(keys);
  loadFixLog();
});

loadOptions();
loadFixLog();
