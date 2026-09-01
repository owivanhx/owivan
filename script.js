// Substitua este ID pelo seu ID do Discord (o Discord precisa estar conectado à sua conta do Spotify)
const DISCORD_USER_ID = "SEU_DISCORD_ID_AQUI"; 

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
