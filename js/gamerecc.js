const gameList = [
  {
    name: "Outer Wilds",
    icon: "https://upload.wikimedia.org/wikipedia/en/f/f6/Outer_Wilds_Steam_artwork.jpg",
    appid: 753640,
    genre: "Exploration, Puzzle",
    year: 2019
  },
  {
    name: "Gunmetal Gothic",
    appid: 2248150,
    genre: "Action RPG, Third Person Shooter",
    year: 2027
  }
  // ,
  // {
  //  name: "Some Non-Steam Game",
  //  icon: "images/games/some-game.jpg", // no appid at all, just a custom image + link
  //  url: "https://itch.io/some-game",
 //   genre: "Indie",
 //   year: 2022
 // }
];

let shuffledQueue = [];

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getNextPick() {
  if (shuffledQueue.length === 0) {
    shuffledQueue = shuffle(gameList);
  }
  return shuffledQueue.pop();
}

function renderRecommendation() {
  const container = document.getElementById("game-recommendation");
  if (!container || gameList.length === 0) return;

  const pick = getNextPick();

  const icon = pick.icon || `https://cdn.cloudflare.steamstatic.com/steam/apps/${pick.appid}/header.jpg`;
  const url = pick.url || `https://store.steampowered.com/app/${pick.appid}`;

  container.innerHTML = `

    <a href="${url}" target="_blank" rel="noopener">
      <img src="${icon}" alt="${pick.name}" style="height:50px; display:block;">
    </a>
    
      <strong>${pick.name}</strong>
      ${pick.genre} · ${pick.year}

    
  `;
}

document.getElementById("reroll-btn")?.addEventListener("click", renderRecommendation);
renderRecommendation(); // show one immediately on page load