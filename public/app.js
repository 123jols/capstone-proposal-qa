const chatEl = document.getElementById("chat");
const formEl = document.getElementById("composer");
const inputEl = document.getElementById("question");
const sendBtn = document.getElementById("send");
const suggestionsEl = document.getElementById("suggestions");
const offlineBanner = document.getElementById("offline-banner");

const STORAGE_KEY = "capstone-qa-history";
const MAX_STORED_MESSAGES = 40;
const STALL_TIMEOUT_MS = 25000;

/** @type {{role: "user" | "assistant", content: string}[]} */
const history = [];

restoreHistory();
updateOnlineStatus();
window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);

formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const question = inputEl.value.trim();
  if (!question) return;
  inputEl.value = "";
  autoResize();
  ask(question);
});

inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    formEl.requestSubmit();
  }
});

inputEl.addEventListener("input", autoResize);

suggestionsEl.addEventListener("click", (e) => {
  const target = e.target;
  if (target instanceof HTMLElement && target.classList.contains("chip")) {
    ask(target.textContent);
  }
});

function autoResize() {
  inputEl.style.height = "auto";
  inputEl.style.height = Math.min(inputEl.scrollHeight, 160) + "px";
}

function updateOnlineStatus() {
  offlineBanner.hidden = navigator.onLine;
}

function renderEmptyState() {
  chatEl.innerHTML = `<div class="empty-state">Ask about your Main Proposal (Smart Student Wallet) or the two Backups — research questions, background, methodology, courses, or how to defend a specific choice.</div>`;
}

function addMessage(role, text) {
  const emptyState = chatEl.querySelector(".empty-state");
  if (emptyState) emptyState.remove();

  const el = document.createElement("div");
  el.className = `msg ${role}`;
  el.textContent = text;
  chatEl.appendChild(el);
  chatEl.scrollTop = chatEl.scrollHeight;
  return el;
}

function renderMarkdown(el, text) {
  const html = marked.parse(text, { breaks: true });
  el.innerHTML = DOMPurify.sanitize(html);
}

function loadStoredHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string",
    );
  } catch {
    return [];
  }
}

function persistHistory() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(history.slice(-MAX_STORED_MESSAGES)),
    );
  } catch {
    // storage full or unavailable (e.g. private browsing) — safe to skip
  }
}

function restoreHistory() {
  const restored = loadStoredHistory();

  if (!restored.length) {
    renderEmptyState();
    return;
  }

  history.push(...restored);
  for (const m of restored) {
    if (m.role === "user") {
      addMessage("user", m.content);
    } else {
      renderMarkdown(addMessage("ai", ""), m.content);
    }
  }
}

function appendRetryButton(el, question, priorHistory) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "retry-btn";
  btn.textContent = "↻ Retry";
  btn.addEventListener("click", () => answerInto(el, question, priorHistory, 0));
  el.appendChild(btn);
}

async function ask(question) {
  addMessage("user", question);
  history.push({ role: "user", content: question });
  persistHistory();

  const aiEl = addMessage("ai pending", "");
  await answerInto(aiEl, question, history.slice(0, -1), 0);
}

async function answerInto(aiEl, question, priorHistory, attempt) {
  sendBtn.disabled = true;
  aiEl.classList.remove("error");
  aiEl.classList.add("pending");
  aiEl.textContent = "";

  if (!navigator.onLine) {
    aiEl.classList.remove("pending");
    aiEl.classList.add("error");
    aiEl.textContent = "You're offline — connect to the internet and retry.";
    appendRetryButton(aiEl, question, priorHistory);
    sendBtn.disabled = false;
    inputEl.focus();
    return;
  }

  const controller = new AbortController();
  let stallTimer;
  const resetStallTimer = () => {
    clearTimeout(stallTimer);
    stallTimer = setTimeout(() => controller.abort(), STALL_TIMEOUT_MS);
  };

  let fullText = "";

  try {
    resetStallTimer();
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, history: priorHistory }),
      signal: controller.signal,
    });

    if (!response.ok || !response.body) {
      throw new Error(`Request failed (${response.status})`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      resetStallTimer();
      const { done, value } = await reader.read();
      if (done) break;
      fullText += decoder.decode(value, { stream: true });
      renderMarkdown(aiEl, fullText);
      chatEl.scrollTop = chatEl.scrollHeight;
    }

    clearTimeout(stallTimer);
    aiEl.classList.remove("pending");
    history.push({ role: "assistant", content: fullText });
    persistHistory();
  } catch (err) {
    clearTimeout(stallTimer);
    aiEl.classList.remove("pending");

    if (fullText) {
      // We already streamed a partial answer — keep it, flag the drop.
      renderMarkdown(aiEl, fullText);
      aiEl.classList.add("error");
      const note = document.createElement("div");
      note.className = "retry-note";
      note.textContent = "⚠ Connection dropped mid-answer.";
      aiEl.appendChild(note);
      appendRetryButton(aiEl, question, priorHistory);
      history.push({ role: "assistant", content: fullText });
      persistHistory();
    } else if (attempt === 0 && err.name !== "AbortError") {
      // Likely a flaky-connection blip — retry once, silently.
      setTimeout(() => answerInto(aiEl, question, priorHistory, 1), 1200);
      return;
    } else {
      aiEl.classList.add("error");
      aiEl.textContent =
        err.name === "AbortError"
          ? "This is taking too long — your connection may be slow or unstable."
          : `Something went wrong: ${err.message || err}`;
      appendRetryButton(aiEl, question, priorHistory);
    }
  } finally {
    sendBtn.disabled = false;
    inputEl.focus();
  }
}
