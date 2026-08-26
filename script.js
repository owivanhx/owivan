// 1. Função do Relógio de Seul
function updateTime() {
    const agora = new Date();
    const optionsTime = {
        timeZone: 'Asia/Seoul',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    const optionsDate = {
        timeZone: 'Asia/Seoul',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    };

    const timeStr = agora.toLocaleTimeString('ko-KR', optionsTime);
    const dateStr = agora.toLocaleDateString('ko-KR', optionsDate);

    const clockElem = document.getElementById('clock');
    const dateElem = document.getElementById('date');

    if (clockElem) clockElem.textContent = timeStr;
    if (dateElem) dateElem.textContent = dateStr;
}

// 2. Controle do Modo Escuro
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

// 3. Verifica se já estava no modo escuro ao carregar a página
if (localStorage.getItem('darkTheme') === 'true') {
    body.classList.add('dark-mode');
    if (themeBtn) {
        const icon = themeBtn.querySelector('i');
        if (icon) icon.classList.replace('fa-moon', 'fa-sun');
    }
}

// Inicialização
setInterval(updateTime, 1000);
updateTime();
