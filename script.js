// Variável para controlar a sobreposição das janelas (qual fica na frente)
let highestZIndex = 10;

// Função para abrir um aplicativo
function openApp(appId) {
    const win = document.getElementById(`win-${appId}`);
    if (win) {
        win.style.display = 'flex'; // Exibe a janela usando flexbox
        focusWindow(win);           // Coloca ela na frente das outras
    }
}

// Função para fechar um aplicativo
function closeApp(appId) {
    const win = document.getElementById(`win-${appId}`);
    if (win) {
        win.style.display = 'none';
    }
}

// Função para colocar a janela clicada na frente de todas
function focusWindow(elmnt) {
    highestZIndex++;
    elmnt.style.zIndex = highestZIndex;
}

// Configura o sistema de arrastar para todas as janelas existentes
document.querySelectorAll('.window').forEach(win => {
    makeDraggable(win);
    
    // Faz a janela ir para a frente se o usuário clicar em qualquer parte dela
    win.addEventListener('mousedown', () => {
        focusWindow(win);
    });
});

// Lógica universal para arrastar elementos pela tela
function makeDraggable(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = document.getElementById(elmnt.id + "-header");
    
    if (header) {
        header.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        
        // Posição inicial do cursor do mouse
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        
        // Calcula a nova posição do cursor
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // Aplica a nova posição na janela na tela
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}
