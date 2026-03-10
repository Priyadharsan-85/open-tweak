const RULE_LABELS = {
  "missing-alt":        "Images missing alt text",
  "missing-label":      "Unlabelled form inputs",
  "missing-lang":       "Missing page language",
  "vague-link":         "Non-descriptive links",
  "no-focus-indicator": "Missing focus indicators",
  "missing-skip-link":  "No skip-to-content link",
  "small-font":         "Text below minimum size",
};

async function loadFixSummary() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return;

  let host = "";
  try { host = new URL(tab.url).hostname; } catch { return; }

  document.getElementById("site-name").textContent = host.replace("www.", "");

  const data = await chrome.storage.local.get(`fixLog:${host}`);
  const log = data[`fixLog:${host}`];

  const countEl  = document.getElementById("fix-count");
  const listEl   = document.getElementById("fix-list");
  const countTag = document.getElementById("breakdown-count");

  listEl.innerHTML = "";

  if (!log || log.count === 0) {
    countEl.textContent = "0";
    countEl.classList.add("zero");
    const li = document.createElement("li");
    li.className = "no-issues";
    li.textContent = "✓ No accessibility issues found";
    listEl.appendChild(li);
    countTag.textContent = "";
    return;
  }

  countEl.textContent = log.count;
  if (log.count >= 5) countEl.classList.add("high");
  countTag.textContent = `${Object.keys(log.fixes).length} types`;

  Object.entries(log.fixes).forEach(([rule, count], i) => {
    const li = document.createElement("li");
    li.className = "fix-item";
    li.style.animationDelay = `${i * 0.04}s`;
    li.style.animation = "fadeUp 0.25s ease both";

    const label = document.createElement("span");
    label.textContent = RULE_LABELS[rule] || rule;
    label.style.flex = "1";

    const tag = document.createElement("span");
    tag.className = "fix-count-tag";
    tag.textContent = `×${count}`;

    li.appendChild(label);
    li.appendChild(tag);
    listEl.appendChild(li);
  });
}

async function loadProfile() {
  const data = await chrome.storage.sync.get("profile");
  const active = data.profile || "none";
  document.querySelectorAll(".profile-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.profile === active);
  });
}

document.getElementById("profile-grid").addEventListener("click", async (e) => {
  const btn = e.target.closest(".profile-btn");
  if (!btn) return;
  await chrome.storage.sync.set({ profile: btn.dataset.profile });
  document.querySelectorAll(".profile-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) chrome.tabs.reload(tab.id);
});

async function loadDisableToggle() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return;
  const host = new URL(tab.url).hostname;
  const data = await chrome.storage.sync.get("siteDisabled");
  const disabled = data.siteDisabled?.[host] || false;
  document.getElementById("disable-toggle").checked = disabled;
  if (disabled) {
    document.getElementById("status-pill").classList.add("paused");
    document.getElementById("status-text").textContent = "Paused";
  }
}

document.getElementById("disable-toggle").addEventListener("change", async (e) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return;
  const host = new URL(tab.url).hostname;
  const data = await chrome.storage.sync.get("siteDisabled");
  const siteDisabled = data.siteDisabled || {};
  siteDisabled[host] = e.target.checked;
  await chrome.storage.sync.set({ siteDisabled });
  const pill = document.getElementById("status-pill");
  const statusText = document.getElementById("status-text");
  if (e.target.checked) {
    pill.classList.add("paused");
    statusText.textContent = "Paused";
  } else {
    pill.classList.remove("paused");
    statusText.textContent = "Active";
  }
  chrome.tabs.reload(tab.id);
});

loadFixSummary();
loadProfile();
loadDisableToggle();