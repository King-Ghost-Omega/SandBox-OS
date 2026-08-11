let highestZIndex = 10;
const openAppsList = {}; // Monitora o estado de cada app aberto

function openApp(appId) {
    const win = document.getElementById(`win-${appId}`);
    if (win) {
        win.style.display = 'flex';
        focusWindow(win);
        
        // Se o app não estiver registrado na barra de tarefas, registra agora
        if (!openAppsList[appId]) {
            openAppsList[appId] = { maximized: false, prevStyle: {} };
            updateTaskbar();
        }
    }
}

function closeApp(appId) {
    const win = document.getElementById(`win-${appId}`);
    if (win) {
        win.style.display = 'none';
        delete openAppsList[appId]; // Remove do registro
        updateTaskbar();
    }
}

function focusWindow(elmnt) {
    highestZIndex++;
    elmnt.style.zIndex = highestZIndex;
    
    // Atualiza o visual do botão ativo na barra de tarefas
    document.querySelectorAll('.taskbar-button').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`tb-${elmnt.id.replace('win-', '')}`);
    if (activeBtn) activeBtn.classList.add('active');
}

// Sistema de Minimizar
function minimizeApp(appId) {
    const win = document.getElementById(`win-${appId}`);
    if (win) {
        win.style.display = 'none';
        const activeBtn = document.getElementById(`tb-${appId}`);
        if (activeBtn) activeBtn.classList.remove('active');
    }
}

// Sistema de Maximizar / Expandir total
function maximizeApp(appId) {
    const win = document.getElementById(`win-${appId}`);
    if (!win) return;

    if (!openAppsList[appId].maximized) {
        // Guarda o tamanho e posição antiga antes de expandir tudo
        openAppsList[appId].prevStyle = {
            top: win.style.top,
            left: win.style.left,
            width: win.style.width,
            height: win.style.height
        };
        win.style.top = '0px';
        win.style.left = '0px';
        win.style.width = '100%';
        win.style.height = 'calc(100vh - 45px)';
        openAppsList[appId].maximized = true;
    } else {
        // Restaura tamanho antigo
        const prev = openAppsList[appId].prevStyle;
        win.style.top = prev.top;
        win.style.left = prev.left;
        win.style.width = prev.width;
        win.style.height = prev.height;
        openAppsList[appId].maximized = false;
    }
}

// Atualiza os botões dinamicamente no rodapé do OS
function updateTaskbar() {
    const container = document.getElementById('taskbar-apps');
    container.innerHTML = ''; // Limpa botões antigos
    
    Object.keys(openAppsList).forEach(appId => {
        const btn = document.createElement('button');
        btn.id = `tb-${appId}`;
        btn.className = 'taskbar-button';
        
        // Traduz ID técnico para nome amigável
        const nameMap = { 'notepad': '📝 Bloco de Notas', 'settings': '⚙️ Configurações' };
        btn.innerText = nameMap[appId] || appId;
        
        btn.onclick = () => {
            const win = document.getElementById(`win-${appId}`);
            if (win.style.display === 'none') {
                win.style.display = 'flex';
                focusWindow(win);
            } else {
                minimizeApp(appId);
            }
        };
        container.appendChild(btn);
    });
}

function changeBackground(colorOrType) {
    const desktop = document.getElementById('desktop');
    if (colorOrType === 'image') {
        desktop.style.background = "url('https://unsplash.com') no-repeat center center";
        desktop.style.backgroundSize = "cover";
    } else {
        desktop.style.background = colorOrType;
    }
}

// Configura o sistema de cliques e comportamentos para todas as janelas
document.querySelectorAll('.window').forEach(win => {
    makeDraggableAndResizable(win);
    win.addEventListener('mousedown', () => {
        focusWindow(win);
    });
});

// Mecânica Completa: Arrastar por qualquer Lateral e Mudar Tamanho pela Pontinha
function makeDraggableAndResizable(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    // 1. Vincula o evento de arrastar tanto ao Header quanto a QUALQUER uma das 4 bordas laterais
    const dragTargets = [
        document.getElementById(elmnt.id + "-header"),
        elmnt.querySelector('.border-top'),
        elmnt.querySelector('.border-bottom'),
        elmnt.querySelector('.border-left'),
        elmnt.querySelector('.border-right')
    ];

    dragTargets.forEach(target => {
        if (target) {
            target.onmousedown = dragMouseDown;
        }
    });

    function dragMouseDown(e) {
        // Impede arrastar se o app estiver maximizado tela cheia
        const appId = elmnt.id.replace('win-', '');
        if (openAppsList[appId] && openAppsList[appId].maximized) return;

        e = e || window.event;
        if(e.target.tagName === 'BUTTON') return; // Não arrasta se clicar nos botões de controle
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        let newTop = elmnt.offsetTop - pos2;
        let newLeft = elmnt.offsetLeft - pos1;

        // Impede que o usuário suma com a janela completamente para cima da tela
        if (newTop < 0) newTop = 0;

        elmnt.style.top = newTop + "px";
        elmnt.style.left = newLeft + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }

    // 2. Sistema de Mudar o Tamanho (Resize) puxando o cantinho inferior direito
    const resizeHandle = elmnt.querySelector('.window-resize-handle');
    if (resizeHandle) {
        resizeHandle.onmousedown = (e) => {
            e.preventDefault();
            e.stopPropagation(); // Evita ativar o arrastar junto
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = () => {
                document.onmouseup = null;
                document.onmousemove = null;
            };
            document.onmousemove = (e) => {
                e.preventDefault();
                let widthDiff = e.clientX - pos3;
                let heightDiff = e.clientY - pos4;
                pos3 = e.clientX;
                pos4 = e.clientY;
                
                let currentWidth = parseInt(window.getComputedStyle(elmnt).width);
                let currentHeight = parseInt(window.getComputedStyle(elmnt).height);
                
                // Define limites mínimos de tamanho (250x150) para a janela não quebrar
                if (currentWidth + widthDiff > 250) {
                    elmnt.style.width = (currentWidth + widthDiff) + "px";
                }
                if (currentHeight + heightDiff > 150) {
                    elmnt.style.height = (currentHeight + heightDiff) + "px";
                }
            };
        };
    }
}
