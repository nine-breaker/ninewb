
const gameList = [
  {
    name: "Outer Wilds",
    icon: "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/753640/776c33c3fe66b54a132832449bd8b2e17df93593.ico",
    appid: 753640,
    genre: "Exploration, Puzzle, Space",
    comment: "Stellar game and amazing soundtrack. This will change your life",
    year: 2019
  },
  {
    name: "Lunacid",
    icon: "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/1745510/009333bdf77ddd80e4d998686de20d56bf9a8fd7.jpg",
    appid: 1745510,
    genre: "Dark Fantasy, Dungeon Crawler, First-person RPG",
    comment:"I'm a sucker for anything remotely close to Morrowind. Also Demons Souls references",
    year: 2023
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

function buildUrl(pick) {
  return pick.url || `https://store.steampowered.com/app/${pick.appid}`;
}

function renderGameReccGrid() {
  const grid = document.getElementById('gamerecc-grid');
  const nameEl = document.getElementById('gamerecc-name');
  const metaEl = document.getElementById('gamerecc-meta');
  const commentEl = document.getElementById('gamerecc-comment');
  const linkEl = document.getElementById('gamerecc-link');
  if (!grid) return;

  grid.innerHTML = '';

  gameList.forEach((pick) => {
    const img = document.createElement('img');
    img.src = pick.icon;
    img.className = 'gamerecc-icon';
    img.alt = pick.name;

    img.addEventListener('click', () => {
      nameEl.textContent = pick.name;
      metaEl.textContent = `${pick.genre} · ${pick.year}`;
      commentEl.textContent = pick.comment || '';
      linkEl.href = buildUrl(pick);

      grid.querySelectorAll('.gamerecc-icon').forEach(el => el.classList.remove('selected'));
      img.classList.add('selected');
    });

    grid.appendChild(img);
  });

  if (gameList.length) {
    const first = gameList[0];
    nameEl.textContent = first.name;
    metaEl.textContent = `${first.genre} · ${first.year}`;
    commentEl.textContent = first.comment || '';
    linkEl.href = buildUrl(first);
    grid.firstChild?.classList.add('selected');
  }
}

renderGameReccGrid();
