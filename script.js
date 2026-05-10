function updateTime() {
    const agora = new Date();

    // Relógio de Seul
    const timeStr = agora.toLocaleTimeString('ko-KR', {
        timeZone: 'Asia/Seoul',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    // Data de Seul
    const dateStr = agora.toLocaleDateString('ko-KR', {
        timeZone: 'Asia/Seoul',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });

    const clockEl = document.getElementById('clock');
    const dateEl = document.getElementById('date');

    if(clockEl) clockEl.textContent = timeStr;
    if(dateEl) dateEl.textContent = dateStr;
}

// Controle do Tema
const themeBtn = document.getElementById('theme-toggle');
const body = document.body;

themeBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    const icon = themeBtn.querySelector('i');
    
    if (body.classList.contains('dark-mode')) {
        icon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('darkTheme', 'true');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('darkTheme', 'false');
    }
});

// Verifica preferência salva ao carregar
if (localStorage.getItem('darkTheme') === 'true') {
    body.classList.add('dark-mode');
    const icon = themeBtn.querySelector('i');
    if(icon) icon.classList.replace('fa-moon', 'fa-sun');
}

// Iniciar relógio
setInterval(updateTime, 1000);
updateTime();
