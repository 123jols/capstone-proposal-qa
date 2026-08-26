const chatEl = document.getElementById("chat");
const formEl = document.getElementById("composer");
const inputEl = document.getElementById("question");
const sendBtn = document.getElementById("send");
const suggestionsEl = document.getElementById("suggestions");

/** @type {{role: "user" | "assistant", content: string}[]} */
const history = [];

renderEmptyState();

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

async function ask(question) {
  addMessage("user", question);
  history.push({ role: "user", content: question });

  const aiEl = addMessage("ai pending", "");
  sendBtn.disabled = true;

  let fullText = "";

  try {
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        history: history.slice(0, -1), // exclude the message we just added server-side context for
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Request failed (${response.status})`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullText += decoder.decode(value, { stream: true });
      renderMarkdown(aiEl, fullText);
      chatEl.scrollTop = chatEl.scrollHeight;
    }

    aiEl.classList.remove("pending");
    history.push({ role: "assistant", content: fullText });
  } catch (err) {
    aiEl.classList.remove("pending");
    aiEl.classList.add("error");
    aiEl.textContent =
      fullText || `Something went wrong: ${err.message || err}`;
  } finally {
    sendBtn.disabled = false;
    inputEl.focus();
  }
}
