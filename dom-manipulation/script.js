// --------- Data ----------
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Wisdom" },
  { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Perseverance" }
];

const LS_KEY = "quotes";
const SS_LAST_QUOTE_KEY = "lastQuote";

// --------- Storage Helpers ----------
function saveQuotes() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(quotes));
  } catch (e) {
    console.error("Failed to save quotes to localStorage:", e);
  }
}

function loadQuotes() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // basic validation: must be objects with text + category (strings)
      const valid = parsed.every(
        q => q && typeof q === "object" && typeof q.text === "string" && typeof q.category === "string"
      );
      if (valid) quotes = parsed;
    }
  } catch (e) {
    console.warn("Ignoring malformed quotes in localStorage.");
  }
}

// --------- UI Builders ----------
function createAddQuoteForm() {
  const formContainer = document.getElementById("formContainer");

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.id = "addQuoteBtn";
  addBtn.textContent = "Add Quote";

  formContainer.appendChild(textInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addBtn);

  addBtn.addEventListener("click", addQuote);
}

// --------- Core Features ----------
function showRandomQuote() {
  if (quotes.length === 0) {
    document.getElementById("quoteDisplay").innerHTML = "<em>No quotes available.</em>";
    return;
  }

  const idx = Math.floor(Math.random() * quotes.length);
  const quote = quotes[idx];
  renderQuote(quote);

  // Save last viewed quote in sessionStorage
  try {
    sessionStorage.setItem(SS_LAST_QUOTE_KEY, JSON.stringify(quote));
  } catch (e) {
    console.warn("Could not save last quote to sessionStorage.");
  }
}

function renderQuote(quote) {
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = `<p>"${quote.text}"</p><small>— ${quote.category}</small>`;
}

function addQuote() {
  const newText = document.getElementById("newQuoteText").value.trim();
  const newCategory = document.getElementById("newQuoteCategory").value.trim();

  if (!newText || !newCategory) {
    alert("Please enter both quote text and category.");
    return;
  }

  quotes.push({ text: newText, category: newCategory });
  saveQuotes();

  // Clear inputs
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added successfully!");
}

// --------- JSON Import / Export ----------
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes-export.json";
  document.body.appendChild(a);
  a.click();

  URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// Required signature per spec
function importFromJsonFile(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);

      if (!Array.isArray(imported)) throw new Error("Invalid JSON: expected an array of quotes.");

      // Validate and normalize
      const cleaned = imported
        .filter(q => q && typeof q === "object")
        .map(q => ({
          text: String(q.text ?? "").trim(),
          category: String(q.category ?? "").trim()
        }))
        .filter(q => q.text && q.category);

      if (cleaned.length === 0) throw new Error("No valid quotes found in file.");

      quotes.push(...cleaned);
      saveQuotes();
      alert(`Quotes imported successfully! (${cleaned.length} added)`);

      // Optionally show one of the new quotes
      showRandomQuote();
    } catch (err) {
      alert("Failed to import quotes: " + err.message);
    } finally {
      // reset file input so same file can be selected again if needed
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

// --------- Session helper (optional demo) ----------
function showLastViewedQuote() {
  try {
    const raw = sessionStorage.getItem(SS_LAST_QUOTE_KEY);
    if (!raw) {
      alert("No last viewed quote in this session yet.");
      return;
    }
    const last = JSON.parse(raw);
    if (last && typeof last.text === "string" && typeof last.category === "string") {
      renderQuote(last);
    } else {
      alert("Stored last quote is invalid.");
    }
  } catch {
    alert("Could not read last viewed quote.");
  }
}

// --------- Bootstrap ----------
(function init() {
  // Load any saved quotes first
  loadQuotes();

  // Build UI and wire events
  createAddQuoteForm();

  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("exportJson").addEventListener("click", exportToJsonFile);
  document.getElementById("showLast").addEventListener("click", showLastViewedQuote);

  // Start with last viewed quote if available, else random
  try {
    const last = sessionStorage.getItem(SS_LAST_QUOTE_KEY);
    last ? renderQuote(JSON.parse(last)) : showRandomQuote();
  } catch {
    showRandomQuote();
  }
})();
