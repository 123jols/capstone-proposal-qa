const ACCESS_TOKEN_KEY = "capstone-access-token";

(function () {
  const overlay = document.getElementById("access-gate");
  const form = document.getElementById("access-gate-form");
  const input = document.getElementById("access-code-input");
  const errorEl = document.getElementById("access-gate-error");
  const submitBtn = document.getElementById("access-gate-submit");

  async function verifyToken(token) {
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.ok) return "valid";
      if (res.status === 401) return "invalid";
      return "unknown"; // server/transient error — don't punish the user for this
    } catch {
      return "unknown"; // network error
    }
  }

  async function redeemCode(code) {
    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      return { status: res.status, ...data };
    } catch {
      return { status: 0, ok: false };
    }
  }

  function unlock() {
    overlay.hidden = true;
    if (typeof window.onAccessGranted === "function") {
      window.onAccessGranted();
    }
  }

  (async function tryStoredToken() {
    const stored = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!stored) return;
    const result = await verifyToken(stored);
    if (result === "valid") {
      unlock();
    } else if (result === "invalid") {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
    // "unknown" (network/server hiccup): keep the token, leave the gate up, let them retry.
  })();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const code = input.value.trim();
    if (!code) return;

    submitBtn.disabled = true;
    errorEl.hidden = true;

    const result = await redeemCode(code);

    submitBtn.disabled = false;

    if (result.ok && result.token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, result.token);
      unlock();
    } else {
      errorEl.textContent =
        result.status === 429
          ? "Too many attempts — try again in an hour."
          : "Incorrect or already-used code — try again.";
      errorEl.hidden = false;
      input.select();
      input.focus();
    }
  });
})();
