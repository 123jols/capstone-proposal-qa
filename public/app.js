const chatEl = document.getElementById("chat");
const formEl = document.getElementById("composer");
const inputEl = document.getElementById("question");
const sendBtn = document.getElementById("send");
const suggestionsEl = document.getElementById("suggestions");
const offlineBanner = document.getElementById("offline-banner");
const newChatBtn = document.getElementById("new-chat");
const clearHistoryBtn = document.getElementById("clear-history");

const STORAGE_KEY = "capstone-qa-history";
const MAX_STORED_MESSAGES = 40;
const STALL_TIMEOUT_MS = 25000;
const OPENING_QUESTIONS = {
  main: "Give me a quick overview of the Main Proposal, Smart Student Wallet.",
  smartgate: "Give me a quick overview of SmartGate.",
  safeguard: "Give me a quick overview of SafeGuard.",
};

/** @type {{role: "user" | "assistant", content: string}[]} */
const history = [];

window.onAccessGranted = initChatApp;

function initChatApp() {
  restoreHistory();
  maybeAskOpeningQuestion();
  updateOnlineStatus();
  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);
}

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

newChatBtn.addEventListener("click", () => {
  resetChat();
});

clearHistoryBtn.addEventListener("click", () => {
  if (confirm("Clear all chat history? This can't be undone.")) {
    resetChat();
  }
});

function resetChat() {
  history.length = 0;
  persistHistory();
  renderEmptyState();
  inputEl.focus();
}

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

function maybeAskOpeningQuestion() {
  if (history.length > 0) return; // don't interrupt an existing conversation

  const proposal = new URLSearchParams(location.search).get("proposal");
  const opening = OPENING_QUESTIONS[proposal];
  if (opening) ask(opening);
}

function appendRetryButton(el, question, priorHistory) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "retry-btn";
  btn.textContent = "↻ Retry";
  btn.addEventListener("click", () => answerInto(el, question, priorHistory, 0));
  el.appendChild(btn);
}

function showTypingIndicator(el) {
  el.innerHTML =
    '<span class="typing-dots"><span></span><span></span><span></span></span>';
}

async function ask(question) {
  addMessage("user", question);
  history.push({ role: "user", content: question });
  persistHistory();

  const aiEl = addMessage("ai", "");
  await answerInto(aiEl, question, history.slice(0, -1), 0);
}

async function answerInto(aiEl, question, priorHistory, attempt) {
  sendBtn.disabled = true;
  aiEl.className = "msg ai loading";
  showTypingIndicator(aiEl);

  if (!navigator.onLine) {
    aiEl.className = "msg ai error";
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
      headers: {
        "Content-Type": "application/json",
        "X-Access-Code": localStorage.getItem(ACCESS_TOKEN_KEY) || "",
      },
      body: JSON.stringify({ question, history: priorHistory }),
      signal: controller.signal,
    });

    if (!response.ok || !response.body) {
      throw new Error(`Request failed (${response.status})`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let firstChunk = true;

    while (true) {
      resetStallTimer();
      const { done, value } = await reader.read();
      if (done) break;
      fullText += decoder.decode(value, { stream: true });
      if (firstChunk && fullText) {
        aiEl.className = "msg ai pending";
        firstChunk = false;
      }
      renderMarkdown(aiEl, fullText);
      chatEl.scrollTop = chatEl.scrollHeight;
    }

    clearTimeout(stallTimer);
    aiEl.classList.remove("loading", "pending");
    if (!fullText) aiEl.textContent = "(no response)";
    history.push({ role: "assistant", content: fullText });
    persistHistory();
  } catch (err) {
    clearTimeout(stallTimer);

    if (fullText) {
      // We already streamed a partial answer — keep it, flag the drop.
      aiEl.classList.remove("loading", "pending");
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
      // Likely a flaky-connection blip — keep showing the loading dots,
      // retry silently.
      setTimeout(() => answerInto(aiEl, question, priorHistory, 1), 1200);
      return;
    } else {
      aiEl.className = "msg ai error";
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
