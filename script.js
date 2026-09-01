// Configurações do Spotify
const CLIENT_ID = '9a9bd8c154c84bef81a0311fbcd5737c'; // Cole aqui o Client ID gerado no dashboard
const REDIRECT_URI = window.location.href.split('#')[0]; // URL atual da sua página
const SCOPES = 'user-read-currently-playing user-read-playback-state';

// 1. Obtém o Token de Acesso da URL ou do LocalStorage
function getAccessToken() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    let token = params.get('access_token');

    if (token) {
        localStorage.setItem('spotify_token', token);
        window.location.hash = ''; // Limpa a URL
        return token;
    }

    return localStorage.getItem('spotify_token');
}

// 2. Redireciona para o login do Spotify caso não tenha autorização
function loginSpotify() {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;
    window.location.href = authUrl;
}

// 3. Busca a música em reprodução diretamente na API do Spotify
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
            // Se o token expirou ou não há música tocando
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

// 4. Atualiza a interface da tela
function updateSpotifyUI(data) {
    const cover = document.getElementById('spotify-cover');
    const title = document.getElementById('spotify-title');
    const artist = document.getElementById('spotify-artist');
    const progress = document.getElementById('spotify-progress');

    if (data && data.is_playing && data.item) {
        cover.src = data.item.album.images[0]?.url || '';
        title.textContent = data.item.name;
        artist.textContent = data.item.artists.map(a => a.name).join(', ');

        const total = data.item.duration_ms;
        const atual = data.progress_ms;
        const porcentagem = Math.min(100, Math.max(0, (atual / total) * 100));

        if (progress) progress.style.width = `${porcentagem}%`;
    } else {
        cover.src = 'https://i.postimg.cc/mDkx1k8D/spotify-placeholder.png';
        title.textContent = 'Não ouvindo nada';
        artist.textContent = 'Spotify Pausado';
        if (progress) progress.style.width = '0%';
    }
}

// Botão auxiliar caso o usuário precise conectar a conta
function showLoginButton() {
    const title = document.getElementById('spotify-title');
    const artist = document.getElementById('spotify-artist');
    
    title.textContent = 'Spotify Desconectado';
    artist.innerHTML = '<a href="#" onclick="loginSpotify()" style="color: var(--spotify-green); text-decoration: underline;">Clique para conectar</a>';
}

// Atualização contínua (A cada 3 segundos busca a música atual)
setInterval(fetchCurrentTrack, 3000);
fetchCurrentTrack();

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

// 3. Status do Spotify em Tempo Real (via Lanyard API)
let spotifyTimestamps = null;

function connectLanyard() {
    if (!DISCORD_USER_ID || DISCORD_USER_ID === "1211785542539149404") {
        console.warn("Por favor, insira o seu ID do Discord no script.js para vincular o Spotify.");
        return;
    }

    const ws = new WebSocket('wss://api.lanyard.rest/socket');

    ws.onopen = () => {
        ws.send(JSON.stringify({
            op: 2,
            d: { subscribe_to_id: DISCORD_USER_ID }
        }));
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.t === 'INIT_STATE' || data.t === 'PRESENCE_UPDATE') {
            updateSpotifyUI(data.d);
        }
    };

    ws.onclose = () => {
        setTimeout(connectLanyard, 5000); // Reconecta se a conexão cair
    };
}

function updateSpotifyUI(presence) {
    const cover = document.getElementById('spotify-cover');
    const title = document.getElementById('spotify-title');
    const artist = document.getElementById('spotify-artist');

    if (presence && presence.listening_to_spotify && presence.spotify) {
        cover.src = presence.spotify.album_art_url;
        title.textContent = presence.spotify.song;
        artist.textContent = presence.spotify.artist;
        spotifyTimestamps = presence.spotify.timestamps;
    } else {
        cover.src = 'https://i.postimg.cc/mDkx1k8D/spotify-placeholder.png';
        title.textContent = 'Não ouvindo nada';
        artist.textContent = 'Spotify Pausado';
        spotifyTimestamps = null;
        document.getElementById('spotify-progress').style.width = '0%';
    }
}

// Atualização da barra de progresso em tempo real
function updateProgressBar() {
    if (!spotifyTimestamps) return;

    const progress = document.getElementById('spotify-progress');
    const total = spotifyTimestamps.end - spotifyTimestamps.start;
    const atual = Date.now() - spotifyTimestamps.start;
    const porcentagem = Math.min(100, Math.max(0, (atual / total) * 100));

    if (progress) {
        progress.style.width = `${porcentagem}%`;
    }
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
setInterval(updateProgressBar, 1000);
updateTime();
generateCalendar();
connectLanyard();
