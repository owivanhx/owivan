// Configurações do Spotify
const CLIENT_ID = '9a9bd8c154c84bef81a0311fbcd5737c';
const REDIRECT_URI = window.location.href.split('#')[0];
const SCOPES = 'user-read-currently-playing user-read-playback-state';

// 1. Relógio de Seul
function updateTime() {
    const agora = new Date();
    const optionsTime = { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hour12: false };
    const optionsDate = { timeZone: 'Asia/Seoul', month: 'long', day: 'numeric', weekday: 'long' };

    const timeStr = agora.toLocaleTimeString('ko-KR', optionsTime);
    const dateStr = agora.toLocaleDateString('ko-KR', optionsDate);

    const clockElem = document.getElementById('clock');
    const dateElem = document.getElementById('date');

    if (clockElem) clockElem.textContent = timeStr;
    if (dateElem) dateElem.textContent = dateStr;
}

// 2. Calendário
function generateCalendar() {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = agora.getMonth();
    const diaHoje = agora.getDate();

    const header = document.getElementById('calendar-header');
    const grid = document.getElementById('calendar-grid');

    if (!header || !grid) return;

    header.textContent = agora.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    grid.innerHTML = '';

    const diasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    diasSemana.forEach(dia => {
        const div = document.createElement('div');
        div.className = 'calendar-day-name';
        div.textContent = dia;
        grid.appendChild(div);
    });

    const primeiroDiaIndex = new Date(ano, mes, 1).getDay();
    const totalDias = new Date(ano, mes + 1, 0).getDate();

    for (let i = 0; i < primeiroDiaIndex; i++) {
        grid.appendChild(document.createElement('div'));
    }

    for (let dia = 1; dia <= totalDias; dia++) {
        const divDia = document.createElement('div');
        divDia.className = 'calendar-day';
        divDia.textContent = dia;
        if (dia === diaHoje) divDia.classList.add('today');
        grid.appendChild(divDia);
    }
}

// 3. Autenticação e API do Spotify
function getAccessToken() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    let token = params.get('access_token');

    if (token) {
        localStorage.setItem('spotify_token', token);
        window.location.hash = '';
        return token;
    }

    return localStorage.getItem('spotify_token');
}

function loginSpotify() {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;
    window.location.href = authUrl;
}

async function fetchCurrentTrack() {
    const token = getAccessToken();

    if (!token) {
        showLoginButton();
        return;
    }

    try {
        const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 204 || response.status === 401) {
            if (response.status === 401) localStorage.removeItem('spotify_token');
            updateSpotifyUI(null);
            return;
        }

        const data = await response.json();
        updateSpotifyUI(data);
    } catch (error) {
        console.error('Erro ao buscar status do Spotify:', error);
        updateSpotifyUI(null);
    }
}

function updateSpotifyUI(data) {
    const cover = document.getElementById('spotify-cover');
    const title = document.getElementById('spotify-title');
    const artist = document.getElementById('spotify-artist');
    const progress = document.getElementById('spotify-progress');

    if (data && data.is_playing && data.item) {
        if (cover) cover.src = data.item.album.images[0]?.url || '';
        if (title) title.textContent = data.item.name;
        if (artist) artist.textContent = data.item.artists.map(a => a.name).join(', ');

        const total = data.item.duration_ms;
        const atual = data.progress_ms;
        const porcentagem = Math.min(100, Math.max(0, (atual / total) * 100));

        if (progress) progress.style.width = `${porcentagem}%`;
    } else {
        if (cover) cover.src = 'https://i.postimg.cc/mDkx1k8D/spotify-placeholder.png';
        if (title) title.textContent = 'Não ouvindo nada';
        if (artist) artist.textContent = 'Spotify Pausado';
        if (progress) progress.style.width = '0%';
    }
}

function showLoginButton() {
    const title = document.getElementById('spotify-title');
    const artist = document.getElementById('spotify-artist');
    
    if (title) title.textContent = 'Spotify Desconectado';
    if (artist) artist.innerHTML = '<a href="#" onclick="loginSpotify()" style="color: var(--spotify-green); text-decoration: underline;">Clique para conectar</a>';
}

// 4. Controle do Modo Escuro
const themeBtn = document.getElementById('theme-toggle');
const body = document.body;

if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const icon = themeBtn.querySelector('i');
        
        if (body.classList.contains('dark-mode')) {
            if (icon) icon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('darkTheme', 'true');
        } else {
            if (icon) icon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('darkTheme', 'false');
        }
    });
}

if (localStorage.getItem('darkTheme') === 'true') {
    body.classList.add('dark-mode');
    if (themeBtn) {
        const icon = themeBtn.querySelector('i');
        if (icon) icon.classList.replace('fa-moon', 'fa-sun');
    }
}

// Inicializações
setInterval(updateTime, 1000);
setInterval(fetchCurrentTrack, 3000);
updateTime();
generateCalendar();
fetchCurrentTrack();
