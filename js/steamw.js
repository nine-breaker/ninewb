(async () => {
  const container = document.getElementById("steam-lastplayed");
  if (!container) return;

  const steamId = "76561199102469679";
  const WORKER_URL = "https://steam-proxy.tacniyne.workers.dev";

  container.textContent = "Loading last played game...";

  try {
    const res = await fetch(`${WORKER_URL}?steamid=${steamId}`);
    const data = await res.json();

    if (!data) {
      container.textContent = "No recent games";
      return;
    }

    container.innerHTML = `
      <a href="${data.store_url}" target="_blank" rel="noopener" class="u-flex-row u-gap-sm u-no-underline" style="align-items:center; color:inherit;">
        <img src="${data.icon_small}" alt="${data.name}" style="width:20px; height:20px; display:block;">
        ${data.name}
      </a>
    `;
  } catch (err) {
    container.textContent = "Error fetching Steam data";
    console.error(err);
  }
})();