let highestZIndex = 10;
const openAppsList = {}; 

// Carrega o fundo e posições salvas dos ícones ao iniciar
function initializeOS() {
    const savedBg = localStorage.getItem("sandboxos_bg");
    if (savedBg) applyBackgroundLogic(savedBg);

    const savedText = localStorage.getItem("sandboxos_note_text");
    const textarea = document.getElementById("notepad-textarea");
    if (textarea) textarea.value = savedText || "";

    // Restaura o posicionamento dos ícones da Área de Trabalho
    document.querySelectorAll('.draggable-shortcut').forEach(function(shortcut) {
        const coords = localStorage.getItem("pos_" + shortcut.id);
        if (coords) {
            const pos = JSON.parse(coords);
            shortcut.style.top = pos.top;
            shortcut.style.left = pos.left;
        }
        makeShortcutDraggable(shortcut);
    });
}
setTimeout(initializeOS, 50);

// --- 🛡️ ENGINE DE MOVER OS ÍCONES DA ÁREA DE TRABALHO ---
function makeShortcutDraggable(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isDragging = false;

    elmnt.onmousedown = function(e) {
        e = e || window.event;
        // Permite abrir se for clique comum rápido, mas prepara o arrastar se segurar
        isDragging = false;
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragShortcut;
        document.onmousemove = dragShortcut;
    };

    function dragShortcut(e) {
        e = e || window.event;
        e.preventDefault();
        isDragging = true;
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        let newTop = elmnt.offsetTop - pos2;
        let newLeft = elmnt.offsetLeft - pos1;

        // Limita os ícones para não fugirem além da barra de tarefas ou do topo
        const maxW = window.innerWidth - 85;
        const maxH = window.innerHeight - 130;
        if (newTop < 10) newTop = 10;
        if (newLeft < 10) newLeft = 10;
        if (newLeft > maxW) newLeft = maxW;
        if (newTop > maxH) newTop = maxH;

        elmnt.style.top = newTop + "px";
        elmnt.style.left = newLeft + "px";
    }

    function closeDragShortcut() {
        document.onmouseup = null;
        document.onmousemove = null;
        
        // Se arrastou, salva a nova posição na memória
        if (isDragging) {
            localStorage.setItem("pos_" + elmnt.id, JSON.stringify({
                top: elmnt.style.top,
                left: elmnt.style.left
            }));
            // Desativa temporariamente o clique do app para o ícone não abrir logo após soltar o mouse
            elmnt.style.pointerEvents = 'none';
            setTimeout(() => elmnt.style.pointerEvents = 'auto', 50);
        }
    }
}

// --- 🧮 ENGINE DE SEGURANÇA DA CALCULADORA ---
function pressCalcNum(num) {
    const screen = document.getElementById("calc-screen");
    if (screen) {
        if (screen.value === "0" || screen.value === "Erro") screen.value = "";
        screen.value += num;
    }
}

function pressCalcOp(op) {
    const screen = document.getElementById("calc-screen");
    if (!screen || screen.value === "Erro") return;

    let currentVal = screen.value;
    if (currentVal === "") return;

    // Pega o último caractere digitado na tela
    const lastChar = currentVal.slice(-1);
    const operators = ['+', '-', '*', '/'];

    // 🛡️ SISTEMA DE SEGURANÇA: Se o último caractere já for um sinal, impede o novo sinal repetido
    if (operators.includes(lastChar)) {
        return; // Ignora o clique completamente para evitar coisas como 1++1 ou 1+/1
    }

    screen.value += op; // Permite expressões completas como 1+1/2-5 se o caractere anterior for número
}

function clearCalc() {
    const screen = document.getElementById("calc-screen");
    if (screen) screen.value = "";
}

function calculateResult() {
    const screen = document.getElementById("calc-screen");
    if (!screen || screen.value === "") return;

    try {
        // executa a conta matemática segura da expressão digitada
        let result = Function('"use strict";return (' + screen.value + ')')();
        screen.value = result;
    } catch (err) {
        screen.value = "Erro";
    }
}

// --- CONTROLES GERAIS DAS JANELAS ---
function saveNoteText() {
    const textarea = document.getElementById("notepad-textarea");
    if (textarea) localStorage.setItem("sandboxos_note_text", textarea.value);
}

function openApp(appId) {
    const win = document.getElementById("win-" + appId);
    if (win) {
        win.style.display = 'flex';
        focusWindow(win);
        
        if (!openAppsList[appId]) {
            openAppsList[appId] = { maximized: false, prevStyle: {} };
            updateTaskbar();
        }
    }
}

function closeApp(appId) {
    const win = document.getElementById("win-" + appId);
    if (win) {
        win.style.display = 'none';
        delete openAppsList[appId]; 
        updateTaskbar();
    }
}

function focusWindow(elmnt) {
    highestZIndex++;
    elmnt.style.zIndex = highestZIndex;
    
    document.querySelectorAll('.taskbar-button').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById("tb-" + elmnt.id.replace('win-', ''));
    if (activeBtn) activeBtn.classList.add('active');
}

function minimizeApp(appId) {
    const win = document.getElementById("win-" + appId);
    if (win) {
        win.style.display = 'none';
        const activeBtn = document.getElementById("tb-" + appId);
        if (activeBtn) activeBtn.classList.remove('active');
    }
}

function maximizeApp(appId) {
    const win = document.getElementById("win-" + appId);
    if (!win) return;

    if (!openAppsList[appId].maximized) {
        openAppsList[appId].prevStyle = {
            top: win.style.top, left: win.style.left, width: win.style.width, height: win.style.height
        };
        win.style.top = '0px'; win.style.left = '0px'; win.style.width = '100%'; win.style.height = 'calc(100vh - 45px)';
        openAppsList[appId].maximized = true;
    } else {
        const prev = openAppsList[appId].prevStyle;
        win.style.top = prev.top; win.style.left = prev.left; win.style.width = prev.width; win.style.height = prev.height;
        openAppsList[appId].maximized = false;
    }
}

function updateTaskbar() {
    const container = document.getElementById('taskbar-apps');
    if (!container) return;
    container.innerHTML = ''; 
    
    Object.keys(openAppsList).forEach(function(appId) {
        const btn = document.createElement('button');
        btn.id = "tb-" + appId;
        btn.className = 'taskbar-button';
        
        const nameMap = { 'notepad': '📝 Bloco de Notas', 'settings': '⚙️ Configurações', 'calc': '🧮 Calculadora' };
        btn.innerText = nameMap[appId] || appId;
        
        btn.onclick = function() {
            const win = document.getElementById("win-" + appId);
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

function toggleStartMenu(event) {
    event.stopPropagation();
    const menu = document.getElementById("start-menu");
    if (menu) menu.style.display = (menu.style.display === "none") ? "flex" : "none";
}

function openAppFromStart(appId) {
    openApp(appId);
    document.getElementById("start-menu").style.display = "none";
}

function closeStartMenuOutside(event) {
    const menu = document.getElementById("start-menu");
    if (menu && menu.style.display === "flex") menu.style.display = "none";
}

function clearSystemData() {
    if (confirm("Deseja redefinir o sistema? Isso limpará todas as posições dos ícones, notas e cores.")) {
        localStorage.clear();
        window.location.reload();
    }
}

function changeBackground(colorOrType) {
    applyBackgroundLogic(colorOrType);
    localStorage.setItem("sandboxos_bg", colorOrType);
}

function applyBackgroundLogic(colorOrType) {
    const desktop = document.getElementById('desktop');
    if (!desktop) return;
    if (colorOrType === 'image') {
        desktop.style.background = "url('https://unsplash.com') no-repeat center center";
        desktop.style.backgroundSize = "cover";
    } else {
        desktop.style.background = colorOrType;
    }
}

document.querySelectorAll('.window').forEach(function(win) {
    makeDraggableAndResizable(win);
    win.addEventListener('mousedown', () => focusWindow(win));
});

function makeDraggableAndResizable(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = document.getElementById(elmnt.id + "-header");
    if (header) header.onmousedown = dragMouseDown;

    const tBorder = elmnt.querySelector('.border-top'); if (tBorder) tBorder.onmousedown = dragMouseDown;
    const bBorder = elmnt.querySelector('.border-bottom'); if (bBorder) bBorder.onmousedown = dragMouseDown;
    const lBorder = elmnt.querySelector('.border-left'); if (lBorder) lBorder.onmousedown = dragMouseDown;
    const rBorder = elmnt.querySelector('.border-right'); if (rBorder) rBorder.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        const appId = elmnt.id.replace('win-', '');
        if (openAppsList[appId] && openAppsList[appId].maximized) return;
        e = e || window.event;
        if(e.target.tagName === 'BUTTON') return; 
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY; pos3 = e.clientX; pos4 = e.clientY;
        let newTop = elmnt.offsetTop - pos2; let newLeft = elmnt.offsetLeft - pos1;
        const rect = elmnt.getBoundingClientRect();
