const API_KEY = '054896d6109674bf5a77c6e988363583';
const USERNAME = 'chronostat';
const LASTFM_ALBUM_LIMIT = 8;
const LASTFM_PLACEHOLDER_ART = 'images/album-placeholder.gif';
 
const LASTFM_BASE = 'https://ws.audioscrobbler.com/2.0/';

function timeAgo(dateString) {
  const past = new Date(dateString * 1000);
  const now = new Date();
  const diff = Math.floor((now - past) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}


/* NOW PLAYING */

// search
const NP_LINK_TO = 'youtube';
const NP_SEARCH_LINKS = {
  youtube:  (q) => `https://www.youtube.com/results?search_query=${q}`,
  spotify:  (q) => `https://open.spotify.com/search/${q}`,
  bandcamp: (q) => `https://bandcamp.com/search?q=${q}`
};

const NP_NO_COVER_HASH = '2a96cbd8b46e442fc41c2b86b821562f';

// how far + how long the loop is
function fitNowPlayingText() {
  const box = document.getElementById('np-text');
  const inner = box?.firstElementChild;
  if (!inner || !box.clientWidth) return;

  // back to one copy at rest, so it can be measured
  inner.classList.remove('scrolling');
  inner.querySelectorAll('.np-copy[aria-hidden]').forEach((copy) => copy.remove());

  const first = inner.firstElementChild;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || first.offsetWidth <= box.clientWidth) return; 

  // a second copy follows the first, so when the scroll restarts it lines up seamlessly
  const second = first.cloneNode(true);
  second.setAttribute('aria-hidden', 'true');
  inner.appendChild(second);
  inner.classList.add('scrolling'); 

  const distance = second.offsetLeft - first.offsetLeft; 
  inner.style.setProperty('--np-shift', `-${distance}px`);
  inner.style.setProperty('--np-dur', `${Math.max(5, distance / 20)}s`); 
}

let npLastLabel = '';

function setNowPlayingText(label) {
  const box = document.getElementById('np-text');
  if (!box || label === npLastLabel) return; // no restart scroll
  npLastLabel = label;

  const inner = document.createElement('span');
  inner.className = 'np-text-inner';

  const copy = document.createElement('span');
  copy.className = 'np-copy';
  copy.textContent = label; // never parsed as HTML

  inner.appendChild(copy);
  box.replaceChildren(inner);
  fitNowPlayingText();
}

async function updateNowPlaying() {
  const line = document.getElementById('np-line');
  const art  = document.getElementById('np-art');
  const play = document.getElementById('np-play');
  const text = document.getElementById('np-text');
  if (!line || !art || !play || !text) return;
  if (document.hidden) return; // don't poll from a background tab

  const url = `${LASTFM_BASE}?method=user.getrecenttracks` +
    `&user=${encodeURIComponent(USERNAME)}` +
    `&api_key=${API_KEY}` +
    `&format=json&limit=1`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Last.fm now playing request failed: ${res.status}`);
    const data = await res.json();

    const track = data?.recenttracks?.track?.[0];
    if (!track) return;

    const playing = track['@attr']?.nowplaying === 'true';
    const cover   = track.image?.[1]?.['#text']; 
    const artist  = track.artist?.['#text'] ?? 'unknown artist';

    art.src = cover && !cover.includes(NP_NO_COVER_HASH) ? cover : LASTFM_PLACEHOLDER_ART;
    setNowPlayingText(`${track.name} - ${artist}`);
    line.href = Object.hasOwn(NP_SEARCH_LINKS, NP_LINK_TO)
      ? NP_SEARCH_LINKS[NP_LINK_TO](encodeURIComponent(`${artist} ${track.name}`))
      : track.url; // 'lastfm' (or any unknown value) falls back to the Last.fm track page
    line.title = playing
      ? 'now playing'
      : (track.date?.uts ? `last played ${timeAgo(track.date.uts)}` : 'last played');
    play.classList.toggle('paused', !playing);
  } catch (err) {
    console.error('now playing failed:', err);
  }
}

function startNowPlaying() {
  updateNowPlaying();
  setInterval(updateNowPlaying, 30000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateNowPlaying(); // refresh right away when the tab comes back
  });
  window.addEventListener('resize', fitNowPlayingText);
  document.fonts?.ready.then(fitNowPlayingText); // re-measure once your custom font has loaded
}


/* WEEKLY TOP ALBUMS */
async function fetchWeeklyAlbumChart(limit = LASTFM_ALBUM_LIMIT) {
  const url = `${LASTFM_BASE}?method=user.getweeklyalbumchart` +
    `&user=${encodeURIComponent(USERNAME)}` +
    `&api_key=${API_KEY}` +
    `&format=json`;
 
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Last.fm chart request failed: ${res.status}`);
  const data = await res.json();
 
  const albums = data?.weeklyalbumchart?.album || [];
  return albums.slice(0, limit);
}
 
async function fetchAlbumArt(artist, album) {
  const url = `${LASTFM_BASE}?method=album.getinfo` +
    `&api_key=${API_KEY}` +
    `&artist=${encodeURIComponent(artist)}` +
    `&album=${encodeURIComponent(album)}` +
    `&format=json`;
 
  try {
    const res = await fetch(url);
    if (!res.ok) return LASTFM_PLACEHOLDER_ART;
    const data = await res.json();
    const images = data?.album?.image || [];
    const best = images.find(i => i.size === 'extralarge')
      || images.find(i => i.size === 'large')
      || images[images.length - 1];
    return best?.['#text'] || LASTFM_PLACEHOLDER_ART;
  } catch {
    return LASTFM_PLACEHOLDER_ART;
  }
}
 
function buildAlbumCoverEl({ title, artist, url, art }) {
  const a = document.createElement('a');
  a.className = 'album-cover';
  a.href = url || '#';
  a.target = '_blank';
  a.rel = 'noopener';
  a.dataset.title = title;
  a.dataset.artist = artist;
 
  const img = document.createElement('img');
  img.src = art || LASTFM_PLACEHOLDER_ART;
  img.alt = `${title} — ${artist}`;
  img.loading = 'lazy';
 
  a.appendChild(img);
  return a;
}
 
async function loadWeeklyTopAlbums() {
  const grid = document.getElementById('weekly-albums-grid');
  if (!grid) return;
 
  // warn without return
  if (API_KEY === '054896d6109674bf5a77c6e988363583' || USERNAME === 'chronostat') {
    console.warn('lastfm-weekly-albums.js: set API_KEY and USERNAME before use.');
    // no return. retry to make it work
  }
 
  try {
    const chartAlbums = await fetchWeeklyAlbumChart();
 
    grid.innerHTML = '';
    const placeholders = chartAlbums.map(entry => {
      const title = entry.name || 'Unknown Album';
      const artist = entry.artist?.['#text'] || 'Unknown Artist';
      const el = buildAlbumCoverEl({ title, artist, url: entry.url, art: null });
      grid.appendChild(el);
      return { el, title, artist };
    });
 
    await Promise.all(placeholders.map(async ({ el, title, artist }) => {
      const art = await fetchAlbumArt(artist, title);
      const img = el.querySelector('img');
      if (img) img.src = art;
    }));

    attachAlbumHoverEvents();
  } catch (err) {
    console.error('Failed to load weekly top albums:', err);
  }
}

function attachAlbumHoverEvents() {
  const grid = document.getElementById('weekly-albums-grid');
  const infoBox = document.getElementById('album-hover-info');
  if (!grid || !infoBox) return;

  const defaultText = '';

  grid.querySelectorAll('.album-cover').forEach(el => {
    el.addEventListener('mouseenter', () => {
      const title = el.dataset.title || 'Unknown Album';
      const artist = el.dataset.artist || 'Unknown Artist';
      infoBox.textContent = `${title} - ${artist}`;
    });

    el.addEventListener('mouseleave', () => {
      infoBox.textContent = defaultText;
    });
  });
}


/* RECENT TRACKS */
async function fetchLastThreeTracks() {
  const url = `${LASTFM_BASE}?method=user.getrecenttracks` +
    `&user=${USERNAME}` +
    `&api_key=${API_KEY}` +
    `&format=json&limit=4`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Last.fm recent tracks request failed: ${res.status}`);
    const data = await res.json();

    let tracks = data?.recenttracks?.track || [];
    tracks = tracks.slice(0, 3);
    return tracks.map(track => ({
      title: track.name,
      artist: track.artist?.['#text'],
      art: track.image?.[2]?.['#text'] || LASTFM_PLACEHOLDER_ART,
      url: track.url,
      nowPlaying: track['@attr']?.nowplaying === 'true'
    }));
  } catch (err) {
    console.error('Failed to fetch last 3 tracks:', err);
    return [];
  }
}


async function renderLastThreeTracks() {
  const container = document.getElementById('r-tracks');
  if (!container) return;

  const tracks = await fetchLastThreeTracks();
  if (!tracks.length) {
    container.textContent = 'No recent tracks';
    return;
  }

  container.innerHTML = tracks
    .map(t => `
      <a href="${t.url}" target="_blank" rel="noopener" class="u-no-underline u-flex-row u-gap-sm" style="align-items:center; color:inherit;">
        <img src="${t.art}" alt="${t.title}" style="width:12px; height:12px; display:block;">
        <span>${t.title} — ${t.artist}${t.nowPlaying ? '' : ''}</span>
      </a>
    `)
    .join('');
}


/* INIT */
renderLastThreeTracks();
document.addEventListener('DOMContentLoaded', loadWeeklyTopAlbums);
document.addEventListener('DOMContentLoaded', startNowPlaying);