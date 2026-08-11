let highestZIndex = 10;
const openAppsList = {}; 

// Configuração da Grade Inteligente (Tamanho de cada bloco/hitbox de ícone)
const gridX = 90; // Largura do espaço do ícone + espaçamento
const gridY = 90; // Altura do espaço do ícone + espaçamento

// Inicialização completa do sistema operacional
function initializeOS() {
    const savedBg = localStorage.getItem("sandboxos_bg");
    if (savedBg) applyBackgroundLogic(savedBg);

    const savedText = localStorage.getItem("sandboxos_note_text");
    const textarea = document.getElementById("notepad-textarea");
    if (textarea) textarea.value = savedText || "";

    // Restaura o posicionamento dos ícones da Área de Trabalho e ativa o arrastar inteligente
    document.querySelectorAll('.draggable-shortcut').forEach(function(shortcut) {
        const coords = localStorage.getItem("pos_" + shortcut.id);
        if (coords) {
            const pos = JSON.parse(coords);
            shortcut.style.top = pos.top;
            shortcut.style.left = pos.left;
        }
        makeShortcutDraggable(shortcut);
        
        // 🔥 ATUALIZADO: Remove o onclick antigo do HTML e força o uso de DUPLO CLIQUE (ondblclick)
        shortcut.removeAttribute('onclick');
        shortcut.ondblclick = function(e) {
            e.stopPropagation();
            const appId = shortcut.id.replace('shortcut-', '');
            openApp(appId);
        };
    });
}
setTimeout(initializeOS, 50);

// --- 🛡️ ENGINE DE MOVER OS ÍCONES COM GRADE (SNAP TO GRID) ---
function makeShortcutDraggable(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isDragging = false;

    elmnt.onmousedown = function(e) {
        e = e || window.event;
        e.stopPropagation();
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

        // Limita os ícones dentro dos limites visíveis da Área de Trabalho
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
        
        if (isDragging) {
            // 🔥 SISTEMA DE HITBOX/GRADE: Arredonda a posição atual para o bloco mais próximo da grade
            let snappedLeft = Math.round((elmnt.offsetLeft - 10) / gridX) * gridX + 20;
            let snappedTop = Math.round((elmnt.offsetTop - 10) / gridY) * gridY + 20;

            // Garante que o snap não jogue o ícone para fora da tela
            const maxW = window.innerWidth - 85;
            const maxH = window.innerHeight - 130;
            if (snappedLeft > maxW) snappedLeft = Math.round(maxW / gridX) * gridX;
            if (snappedTop > maxH) snappedTop = Math.round(maxH / gridY) * gridY;
            if (snappedLeft < 20) snappedLeft = 20;
            if (snappedTop < 20) snappedTop = 20;

            // 🔥 EVITAR SOBREPOSIÇÃO: Verifica se já tem outro ícone ocupando essa exata hitbox/coordenada
            document.querySelectorAll('.draggable-shortcut').forEach(function(otherShort) {
                if (otherShort.id !== elmnt.id) {
                    if (otherShort.style.left === snappedLeft + "px" && otherShort.style.top === snappedTop + "px") {
                        // Se a vaga estiver ocupada, empurra para a linha de baixo na grade
                        snappedTop += gridY;
                    }
                }
            });

            // Aplica o alinhamento magnético final
            elmnt.style.left = snappedLeft + "px";
            elmnt.style.top = snappedTop + "px";

            // Salva a posição final organizada na memória
            localStorage.setItem("pos_" + elmnt.id, JSON.stringify({
                top: elmnt.style.top,
                left: elmnt.style.left
            }));
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
    const lastChar = currentVal.slice(-1);
    const operators = ['+', '-', '*', '/'];
    if (operators.includes(lastChar)) return; 
    screen.value += op; 
}

function clearCalc() {
    const screen = document.getElementById("calc-screen");
    if (screen) screen.value = "";
}

function calculateResult() {
    const screen = document.getElementById("calc-screen");
    if (!screen || screen.value === "") return;
    try {
        let result = Function('"use strict";return (' + screen.value + ')')();
        screen.value = result;
    } catch (err) {
        screen.value = "Erro";
    }
}

// --- CONTROLES GERAIS DAS JANELAS (WINDOW MANAGER) ---
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
        if (newTop < 0) newTop = 0;
        if (newLeft < 0) newLeft = 0;
        if (newLeft + rect.width > window.innerWidth) newLeft = window.innerWidth - rect.width;
        if (newTop + rect.height > window.innerHeight - 45) newTop = window.innerHeight - 45 - rect.height;
        elmnt.style.top = newTop + "px"; elmnt.style.left = newLeft + "px";
    }

    function closeDragElement() { 
        document.onmouseup = null; 
        document.onmousemove = null; 
    }

    const resizeHandle = elmnt.querySelector('.window-resize-handle');
    if (resizeHandle) {
        resizeHandle.onmousedown = function(e) {
            e.preventDefault(); e.stopPropagation(); pos3 = e.clientX; pos4 = e.clientY;
            document.onmouseup = () => { document.onmouseup = null; document.onmousemove = null; };
            document.onmousemove = function(e) {
                e.preventDefault();
                let widthDiff = e.clientX - pos3; let heightDiff = e.clientY - pos4;
                pos3 = e.clientX; pos4 = e.clientY;
                let currentWidth = parseInt(window.getComputedStyle(elmnt).width);
                let currentHeight = parseInt(window.getComputedStyle(elmnt).height);
                if (currentWidth + widthDiff > 250) elmnt.style.width = (currentWidth + widthDiff) + "px";
                if (currentHeight + heightDiff > 150) elmnt.style.height = (currentHeight + heightDiff) + "px";
            };
        };
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
        desktop.style.background = "url('unsplash.com') no-repeat center center";
        desktop.style.backgroundSize = "cover";
    } else {
        desktop.style.background = colorOrType;
    }
}

document.querySelectorAll('.window').forEach(function(win) {
    makeDraggableAndResizable(win);
    win.addEventListener('mousedown', () => focusWindow(win));
});
