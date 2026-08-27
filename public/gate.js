const ACCESS_CODE_KEY = "capstone-access-code";

(function () {
  const overlay = document.getElementById("access-gate");
  const form = document.getElementById("access-gate-form");
  const input = document.getElementById("access-code-input");
  const errorEl = document.getElementById("access-gate-error");
  const submitBtn = document.getElementById("access-gate-submit");

  async function verify(code) {
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  function unlock() {
    overlay.hidden = true;
    if (typeof window.onAccessGranted === "function") {
      window.onAccessGranted();
    }
  }

  (async function tryStoredCode() {
    const stored = localStorage.getItem(ACCESS_CODE_KEY);
    if (!stored) return;
    if (await verify(stored)) {
      unlock();
    } else {
      localStorage.removeItem(ACCESS_CODE_KEY);
    }
  })();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const code = input.value.trim();
    if (!code) return;

    submitBtn.disabled = true;
    errorEl.hidden = true;

    const ok = await verify(code);

    submitBtn.disabled = false;

    if (ok) {
      localStorage.setItem(ACCESS_CODE_KEY, code);
      unlock();
    } else {
      errorEl.hidden = false;
      input.select();
      input.focus();
    }
  });
})();
