try {
  const raw = localStorage.getItem("capstone-qa-history");
  const history = raw ? JSON.parse(raw) : [];
  if (Array.isArray(history) && history.length > 0) {
    document.getElementById("continue-banner").hidden = false;
  }
} catch {
  // storage unavailable — just skip the banner
}
