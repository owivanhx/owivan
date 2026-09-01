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

// 2. Gerador do Calendário
function generateCalendar() {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = agora.getMonth();
    const diaHoje = agora.getDate();

    const header = document.getElementById('calendar-header');
    const grid = document.getElementById('calendar-grid');

    if (!header || !grid) return;

    // Nome do Mês e Ano no topo
    const nomeMes = agora.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    header.textContent = nomeMes;

    grid.innerHTML = '';

    // Dias da semana
    const diasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    diasSemana.forEach(dia => {
        const div = document.createElement('div');
        div.className = 'calendar-day-name';
        div.textContent = dia;
        grid.appendChild(div);
    });

    // Primeiro dia e total de dias do mês
    const primeiroDiaIndex = new Date(ano, mes, 1).getDay();
    const totalDias = new Date(ano, mes + 1, 0).getDate();

    // Espaços em branco antes do primeiro dia
    for (let i = 0; i < primeiroDiaIndex; i++) {
        const vazio = document.createElement('div');
        grid.appendChild(vazio);
    }

    // Dias do mês
    for (let dia = 1; dia <= totalDias; dia++) {
        const divDia = document.createElement('div');
        divDia.className = 'calendar-day';
        divDia.textContent = dia;

        if (dia === diaHoje) {
            divDia.classList.add('today');
        }

        grid.appendChild(divDia);
    }
}

// 3. Controle do Modo Escuro
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
updateTime();
generateCalendar();
