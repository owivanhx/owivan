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

    document.getElementById('clock').textContent = timeStr;
    document.getElementById('date').textContent = dateStr;
}

// Alternar Tema
const btn = document.getElementById('theme-toggle');
btn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    // Troca o ícone
    const icon = btn.querySelector('i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
});

// Iniciar
setInterval(updateTime, 1000);
updateTime();
