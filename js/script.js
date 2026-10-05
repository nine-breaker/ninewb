/* =========================================================
   LAST.FM — WEEKLY TOP ALBUMS
   ========================================================= */
 
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

function checkOverflow(el) {
  if (el.scrollWidth > el.offsetWidth) {
    el.classList.add('overflow');
  } else {
    el.classList.remove('overflow');
  }
}

window.handleTrack = function(data) {
  try {
    const track = data.recenttracks.track[0];
    const isPlaying = track['@attr']?.nowplaying === 'true';
    const title = track.name;
    const artist = track.artist['#text'];
    const albumArt = track.image[2]['#text'];
    const timestamp = track.date?.uts;
    
    // Fix: Directly set text content, no span needed
    document.getElementById('np-track').textContent = title;
    document.getElementById('np-artist').textContent = artist;
    
    // Fix: Use correct ID
    document.getElementById('lastfm-now-art').src = albumArt || LASTFM_PLACEHOLDER_ART;
    
    document.getElementById('np-status').textContent = isPlaying
      ? 'now playing'
      : timeAgo(timestamp);
    
    checkOverflow(document.getElementById('np-track'));
    checkOverflow(document.getElementById('np-artist'));
  } catch (err) {
    console.error('handleTrack failed:', err);
  }
}

function fetchNowPlaying() {
  const existing = document.getElementById('lastfm-script');
  if (existing) existing.remove();
  const script = document.createElement('script');
  script.id = 'lastfm-script';
  script.src = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${USERNAME}&api_key=${API_KEY}&format=json&limit=1&callback=handleTrack`;
  document.body.appendChild(script);
}

fetchNowPlaying();
setInterval(fetchNowPlaying, 30000);
 
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
 
  // Fix: Only warn, don't return
  if (API_KEY === '054896d6109674bf5a77c6e988363583' || USERNAME === 'chronostat') {
    console.warn('lastfm-weekly-albums.js: set API_KEY and USERNAME before use.');
    // Don't return - let it try to work
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

renderLastThreeTracks();
document.addEventListener('DOMContentLoaded', loadWeeklyTopAlbums);