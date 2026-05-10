function updateSeoulTime() {
    const agora = new Date();

    // Configurações para o Relógio (HH:mm)
    const optionsTime = {
        timeZone: 'Asia/Seoul',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };

    // Configurações para a Data em Coreano (igual à imagem)
    const optionsDate = {
        timeZone: 'Asia/Seoul',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    };

    // Formatadores
    const timeFormatter = new Intl.DateTimeFormat('ko-KR', optionsTime);
    const dateFormatter = new Intl.DateTimeFormat('ko-KR', optionsDate);

    // Atualiza os elementos no HTML
    const clockElement = document.getElementById('clock');
    const dateElement = document.getElementById('date');

    if (clockElement) {
        clockElement.textContent = timeFormatter.format(agora);
    }
    
    if (dateElement) {
        dateElement.textContent = dateFormatter.format(agora);
    }
}

// Atualiza a cada segundo
setInterval(updateSeoulTime, 1000);

// Executa assim que a página carregar
window.onload = updateSeoulTime;
