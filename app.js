// ============================================
// WriteDiary.online — Main Application JS
// Complete Functionality: Diary, Mood, Prompts, UI
// ============================================

// --- GLOBAL STATE ---
let currentEntryId = null;
let entries = [];
let currentMood = "😊";
let currentTags = [];
let searchTerm = "";
let promptLibrary = {
  gratitude: [
    "What are three things that happened today that you're genuinely grateful for — no matter how small they seem?",
    "Write a thank-you note to someone who has positively impacted your life recently.",
    "What is something in your daily routine that you often take for granted? Appreciate it deeply.",
    "Describe a simple pleasure you experienced today (a warm cup of tea, a smile from a stranger)."
  ],
  reflection: [
    "What was the highlight of your day? What made it special?",
    "Describe a challenge you faced recently and what you learned from it.",
    "How did you take care of yourself today? What could you do more of?",
    "What emotion dominated your day, and what triggered it?"
  ],
  creative: [
    "If your day were a movie scene, describe the setting, characters, and plot twist.",
    "Write a short poem about the first thing you saw this morning.",
    "Imagine you have a magic diary that writes back. What would it say to you today?",
    "Describe your dream adventure using all five senses."
  ],
  growth: [
    "What is one habit you want to build, and what small step can you take tomorrow?",
    "Write about a skill you're currently developing. How do you feel about your progress?",
    "What mistake taught you the most valuable lesson?",
    "Who inspires you, and what specific quality of theirs would you like to cultivate?"
  ],
  mindfulness: [
    "Take 5 deep breaths. Write about how your body feels right now.",
    "Name 5 things you can see, 4 you can feel, 3 you can hear, 2 you can smell, 1 you can taste right now.",
    "What thoughts are occupying your mind? Observe them without judgment.",
    "Sit quietly for one minute, then describe the journey of your breath."
  ],
  memories: [
    "Describe your happiest childhood memory in vivid detail.",
    "What's a smell that instantly transports you to another time?",
    "Recall a conversation that changed your perspective.",
    "Write about a place you loved that no longer exists (or you can't visit anymore)."
  ]
};
let currentPromptCat = "gratitude";
let currentPromptText = promptLibrary.gratitude[0];

// Sample mood data for calendar (static demo + real time)
let moodCalendarData = {
  "2025-05-01": "😊", "2025-05-02": "😌", "2025-05-03": "😊", "2025-05-04": "🔥", "2025-05-05": "🤔",
  "2025-05-06": "😊", "2025-05-07": "😌", "2025-05-08": "😊", "2025-05-09": "😢", "2025-05-10": "😊",
  "2025-05-11": "🔥", "2025-05-12": "😊", "2025-05-13": "😌", "2025-05-14": "😊", "2025-05-15": "🤔",
  "2025-05-16": "😊", "2025-05-17": "😢", "2025-05-18": "😊", "2025-05-19": "😌", "2025-05-20": "🔥"
};

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  loadEntriesFromStorage();
  setupEventListeners();
  renderEntryList();
  setTodayDate();
  updateWordCount();
  initMoodCalendar();
  setupIntersectionObserver();
  setupMobileNav();
  setDemoDate();
  
  // If new user, add sample entries
  if (entries.length === 0) {
    addSampleEntries();
  }
});

// --- LOCAL STORAGE ---
function loadEntriesFromStorage() {
  const stored = localStorage.getItem("writediary_entries");
  if (stored) {
    entries = JSON.parse(stored);
  } else {
    entries = [];
  }
}

function saveEntriesToStorage() {
  localStorage.setItem("writediary_entries", JSON.stringify(entries));
}

function addSampleEntries() {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const sample1 = {
    id: Date.now() + 1,
    title: "My First Diary Entry ✨",
    content: "This is my very first entry on WriteDiary.online! I'm excited to start journaling every day. The interface is beautiful and easy to use.",
    date: today,
    mood: "😊",
    tags: ["first", "excited"],
    createdAt: Date.now()
  };
  const sample2 = {
    id: Date.now() + 2,
    title: "Reflecting on Today",
    content: "Had a productive day. Finally finished that project I've been working on. Feeling accomplished and grateful.",
    date: yesterday,
    mood: "😌",
    tags: ["work", "grateful"],
    createdAt: Date.now() - 86400000
  };
  entries = [sample1, sample2];
  saveEntriesToStorage();
  renderEntryList();
  if (currentEntryId === null) openEntry(sample1.id);
}

// --- UI Helpers ---
function setTodayDate() {
  const todaySpan = document.getElementById("today-date");
  if (todaySpan) {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    todaySpan.innerText = today.toLocaleDateString(undefined, options);
  }
  const dateInput = document.getElementById("entry-date");
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
}

function setDemoDate() {
  const demoDate = document.querySelector(".dm-date");
  if (demoDate) {
    const today = new Date();
    const formatted = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    demoDate.innerHTML = `📅 ${formatted}`;
  }
}

function updateWordCount() {
  const editor = document.getElementById("diary-editor");
  if (editor) {
    const text = editor.innerText || "";
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const wordSpan = document.getElementById("word-count");
    if (wordSpan) wordSpan.innerText = `${words} words`;
  }
}

// --- RENDER ENTRY LIST (Sidebar) ---
function renderEntryList() {
  const container = document.getElementById("entry-list");
  if (!container) return;
  
  let filtered = entries;
  if (searchTerm.trim() !== "") {
    const term = searchTerm.toLowerCase();
    filtered = entries.filter(entry => 
      entry.title.toLowerCase().includes(term) || 
      entry.content.toLowerCase().includes(term) ||
      entry.tags.some(tag => tag.toLowerCase().includes(term))
    );
  }
  
  // Sort by date descending (newest first)
  filtered.sort((a,b) => new Date(b.date) - new Date(a.date));
  
  if (filtered.length === 0) {
    container.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text-l);">No entries found. Write your first diary entry! ✨</div>`;
    return;
  }
  
  container.innerHTML = filtered.map(entry => `
    <div class="entry-item ${currentEntryId === entry.id ? 'active' : ''}" onclick="openEntry(${entry.id})">
      <div class="ei-title">${escapeHtml(entry.title || "Untitled")}</div>
      <div class="ei-meta">${entry.mood || ""} · ${formatDate(entry.date)}</div>
      <div class="ei-preview">${escapeHtml(entry.content.substring(0, 60))}${entry.content.length > 60 ? '...' : ''}</div>
    </div>
  `).join('');
}

function formatDate(dateStr) {
  if (!dateStr) return "No date";
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// --- OPEN ENTRY ---
function openEntry(id) {
  const entry = entries.find(e => e.id === id);
  if (!entry) return;
  
  currentEntryId = id;
  document.getElementById("entry-title").value = entry.title || "";
  document.getElementById("diary-editor").innerHTML = entry.content || "";
  document.getElementById("entry-date").value = entry.date || new Date().toISOString().split('T')[0];
  currentMood = entry.mood || "😊";
  currentTags = [...(entry.tags || [])];
  
  // Update mood buttons
  document.querySelectorAll(".mood-btn").forEach(btn => {
    btn.classList.remove("active");
    if (btn.getAttribute("data-mood") === currentMood) btn.classList.add("active");
  });
  
  renderTags();
  updateWordCount();
  renderEntryList(); // re-render to highlight active
}

function newEntry() {
  currentEntryId = null;
  document.getElementById("entry-title").value = "";
  document.getElementById("diary-editor").innerHTML = "";
  document.getElementById("entry-date").value = new Date().toISOString().split('T')[0];
  currentMood = "😊";
  currentTags = [];
  document.querySelectorAll(".mood-btn").forEach(btn => btn.classList.remove("active"));
  const defaultMoodBtn = document.querySelector(".mood-btn[data-mood='😊']");
  if (defaultMoodBtn) defaultMoodBtn.classList.add("active");
  renderTags();
  updateWordCount();
  renderEntryList();
  showToast("New blank entry created. Start writing!");
}

function saveEntry() {
  const title = document.getElementById("entry-title").value.trim();
  const content = document.getElementById("diary-editor").innerHTML.trim();
  const date = document.getElementById("entry-date").value;
  
  if (!title && content === "") {
    showToast("Please add a title or some content before saving.", 2000);
    return;
  }
  
  const now = Date.now();
  if (currentEntryId) {
    // Update existing
    const index = entries.findIndex(e => e.id === currentEntryId);
    if (index !== -1) {
      entries[index] = {
        ...entries[index],
        title: title || "Untitled",
        content: content,
        date: date,
        mood: currentMood,
        tags: currentTags,
        updatedAt: now
      };
      showToast("Entry saved! 📝");
    }
  } else {
    // Create new
    const newId = now;
    const newEntry = {
      id: newId,
      title: title || "Untitled",
      content: content,
      date: date,
      mood: currentMood,
      tags: currentTags,
      createdAt: now,
      updatedAt: now
    };
    entries.unshift(newEntry);
    currentEntryId = newId;
    showToast("New entry saved! ✨");
  }
  
  saveEntriesToStorage();
  renderEntryList();
  updateMoodCalendarFromEntries(); // update mood calendar dynamically
}

function deleteEntry() {
  if (!currentEntryId) {
    showToast("No entry selected to delete.", 1500);
    return;
  }
  if (confirm("Are you sure you want to delete this diary entry? This action cannot be undone.")) {
    entries = entries.filter(e => e.id !== currentEntryId);
    saveEntriesToStorage();
    currentEntryId = null;
    newEntry(); // clear editor
    renderEntryList();
    updateMoodCalendarFromEntries();
    showToast("Entry deleted.");
  }
}

// --- TAGS MANAGEMENT ---
function renderTags() {
  const container = document.getElementById("tags-container");
  if (!container) return;
  container.innerHTML = currentTags.map(tag => `
    <span class="tag-item">
      #${escapeHtml(tag)}
      <button onclick="removeTag('${escapeHtml(tag)}')">✕</button>
    </span>
  `).join('');
}

function addTag(event) {
  if (event.key === 'Enter') {
    const input = document.getElementById("tag-input");
    let newTag = input.value.trim().toLowerCase();
    if (newTag && !currentTags.includes(newTag)) {
      currentTags.push(newTag);
      renderTags();
      input.value = "";
    } else if (newTag && currentTags.includes(newTag)) {
      showToast("Tag already exists!", 1000);
    }
    event.preventDefault();
  }
}

function removeTag(tag) {
  currentTags = currentTags.filter(t => t !== tag);
  renderTags();
}

// --- MOOD SETTER ---
function setMood(btn) {
  document.querySelectorAll(".mood-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  currentMood = btn.getAttribute("data-mood");
}

// --- RICH TEXT EDITOR FORMATTING ---
function fmt(command) {
  document.execCommand(command, false, null);
  updateWordCount();
}

function insertHeading() {
  const selection = window.getSelection();
  if (selection.rangeCount) {
    const range = selection.getRangeAt(0);
    const h1 = document.createElement("h1");
    h1.style.fontFamily = "var(--font-h)";
    h1.style.fontSize = "1.8rem";
    h1.style.margin = "10px 0";
    h1.innerText = selection.toString() || "Heading";
    range.deleteContents();
    range.insertNode(h1);
    range.collapse(false);
  }
  updateWordCount();
}

function changeFont(fontFamily) {
  document.execCommand("fontName", false, fontFamily);
  updateWordCount();
}

function changeColor(color) {
  document.execCommand("foreColor", false, color);
  updateWordCount();
}

function insertQuote() {
  const editor = document.getElementById("diary-editor");
  const quoteBlock = document.createElement("div");
  quoteBlock.style.borderLeft = "4px solid var(--purple)";
  quoteBlock.style.paddingLeft = "16px";
  quoteBlock.style.margin = "12px 0";
  quoteBlock.style.fontStyle = "italic";
  quoteBlock.style.color = "var(--text-m)";
  quoteBlock.innerText = "Insert your meaningful quote or thought here...";
  editor.appendChild(quoteBlock);
  updateWordCount();
}

// --- SEARCH ---
function searchEntries() {
  const input = document.getElementById("search-input");
  searchTerm = input.value;
  renderEntryList();
}

// --- MOOD CALENDAR ---
function initMoodCalendar() {
  updateMoodCalendarFromEntries();
}

function updateMoodCalendarFromEntries() {
  const calendarMap = {};
  entries.forEach(entry => {
    if (entry.date && entry.mood) {
      calendarMap[entry.date] = entry.mood;
    }
  });
  // Merge with existing static data for demo completeness
  const merged = { ...moodCalendarData, ...calendarMap };
  renderMoodCalendarGrid(merged);
}

function renderMoodCalendarGrid(moodMap) {
  const grid = document.getElementById("mood-calendar-grid");
  if (!grid) return;
  
  // May 2025 calendar (static header, but dynamic moods)
  const daysInMay = 31;
  const firstDayOfMay = 4; // Thursday (2025-05-01)
  grid.innerHTML = "";
  
  // Day labels
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  dayLabels.forEach(day => {
    const dayLabel = document.createElement("div");
    dayLabel.style.fontSize = "0.7rem";
    dayLabel.style.fontWeight = "700";
    dayLabel.style.textAlign = "center";
    dayLabel.style.color = "var(--purple)";
    dayLabel.innerText = day;
    grid.appendChild(dayLabel);
  });
  
  // Empty cells before May 1
  for (let i = 0; i < firstDayOfMay; i++) {
    const empty = document.createElement("div");
    empty.classList.add("mc-day");
    empty.style.background = "transparent";
    grid.appendChild(empty);
  }
  
  // Fill days
  for (let day = 1; day <= daysInMay; day++) {
    const dateStr = `2025-05-${String(day).padStart(2,'0')}`;
    const mood = moodMap[dateStr] || "😊";
    let bgColor = "#F0EEFF";
    if (mood === "😊") bgColor = "#C8E6C9";
    else if (mood === "😌") bgColor = "#BBDEFB";
    else if (mood === "🔥") bgColor = "#FFE0B2";
    else if (mood === "🤔") bgColor = "#E1BEE7";
    else if (mood === "😢") bgColor = "#FFCDD2";
    
    const cell = document.createElement("div");
    cell.classList.add("mc-day");
    cell.style.background = bgColor;
    cell.style.fontSize = "0.9rem";
    cell.innerHTML = `${day}<br><span style="font-size:0.8rem">${mood}</span>`;
    grid.appendChild(cell);
  }
}

// --- PROMPTS ---
function showPromptCat(btn, cat) {
  document.querySelectorAll(".pcat-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  currentPromptCat = cat;
  const prompts = promptLibrary[cat];
  currentPromptText = prompts[Math.floor(Math.random() * prompts.length)];
  document.getElementById("prompt-cat").innerText = getCatName(cat);
  document.getElementById("prompt-text").innerText = currentPromptText;
}

function getCatName(cat) {
  const names = { gratitude:"🙏 Gratitude", reflection:"🌅 Reflection", creative:"🎨 Creative", growth:"🌱 Growth", mindfulness:"🧘 Mindfulness", memories:"📸 Memories" };
  return names[cat] || "✨ Prompt";
}

function nextPrompt() {
  const prompts = promptLibrary[currentPromptCat];
  let newPrompt = prompts[Math.floor(Math.random() * prompts.length)];
  while (newPrompt === currentPromptText && prompts.length > 1) {
    newPrompt = prompts[Math.floor(Math.random() * prompts.length)];
  }
  currentPromptText = newPrompt;
  document.getElementById("prompt-text").innerText = currentPromptText;
}

function usePrompt() {
  const editor = document.getElementById("diary-editor");
  if (editor) {
    const promptHtml = `<div style="background:#F0EEFF; padding:12px; border-radius:12px; margin-bottom:16px; border-left:4px solid var(--purple);"><strong>✨ Today's Prompt:</strong><br>${escapeHtml(currentPromptText)}</div><br>`;
    editor.innerHTML = promptHtml + editor.innerHTML;
    updateWordCount();
    showToast("Prompt added to your entry!");
  } else {
    showToast("Open the diary editor first!", 1500);
  }
}

// --- FEATURE TABS ---
function showFTab(btn, tabId) {
  document.querySelectorAll(".ftab").forEach(t => t.classList.remove("active"));
  btn.classList.add("active");
  document.querySelectorAll(".ftab-content").forEach(cont => cont.classList.remove("active"));
  document.getElementById(`ftab-${tabId}`).classList.add("active");
}

// --- FAQ TOGGLE ---
function toggleFaq(btn) {
  btn.classList.toggle("open");
  const answer = btn.nextElementSibling;
  answer.classList.toggle("open");
}

// --- MODAL & APP OPENING ---
function openApp() {
  const modal = document.getElementById("app-modal");
  if (modal) modal.style.display = "flex";
}

function closeModal() {
  const modal = document.getElementById("app-modal");
  if (modal) modal.style.display = "none";
}

// --- SMOOTH SCROLL ---
function scrollToFeatures() {
  document.getElementById("features").scrollIntoView({ behavior: "smooth" });
}

// --- TOAST NOTIFICATION ---
function showToast(message, duration = 2500) {
  const existingToast = document.querySelector(".toast");
  if (existingToast) existingToast.remove();
  
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerText = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, duration);
}

// --- INTERSECTION OBSERVER (Animations) ---
function setupIntersectionObserver() {
  const elements = document.querySelectorAll("[data-anim]");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  elements.forEach(el => observer.observe(el));
}

// --- MOBILE NAVIGATION ---
function setupMobileNav() {
  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.querySelector(".mobile-menu");
  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
    });
  }
}

// --- GLOBAL EVENT LISTENERS ---
function setupEventListeners() {
  const editor = document.getElementById("diary-editor");
  if (editor) {
    editor.addEventListener("input", updateWordCount);
    editor.addEventListener("keyup", updateWordCount);
  }
  
  const titleInput = document.getElementById("entry-title");
  if (titleInput) {
    titleInput.addEventListener("input", () => {});
  }
  
  // Close modal on backdrop click
  const modal = document.getElementById("app-modal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }
}

// Expose functions globally for inline onclick handlers
window.openApp = openApp;
window.closeModal = closeModal;
window.scrollToFeatures = scrollToFeatures;
window.newEntry = newEntry;
window.saveEntry = saveEntry;
window.deleteEntry = deleteEntry;
window.openEntry = openEntry;
window.searchEntries = searchEntries;
window.setMood = setMood;
window.fmt = fmt;
window.insertHeading = insertHeading;
window.changeFont = changeFont;
window.changeColor = changeColor;
window.insertQuote = insertQuote;
window.addTag = addTag;
window.removeTag = removeTag;
window.showFTab = showFTab;
window.toggleFaq = toggleFaq;
window.showPromptCat = showPromptCat;
window.nextPrompt = nextPrompt;
window.usePrompt = usePrompt;
