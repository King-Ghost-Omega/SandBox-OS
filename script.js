let highestZIndex = 10;
const openAppsList = {}; 

function loadSavedBackground() {
    const savedBg = localStorage.getItem("sandboxos_bg");
    if (savedBg) {
        const desktop = document.getElementById('desktop');
        if (desktop) {
            applyBackgroundLogic(savedBg);
        } else {
            setTimeout(loadSavedBackground, 50);
        }
    }
}
loadSavedBackground();

// --- NOVO: Carrega o texto do bloco de notas salvo se existir ---
function loadSavedNote() {
    const savedText = localStorage.getItem("sandboxos_note_text");
    const textarea = document.getElementById("notepad-textarea");
    if (textarea) {
        textarea.value = savedText || "";
    } else {
        setTimeout(loadSavedNote, 50);
    }
}
loadSavedNote();

// --- NOVO: Salva as notas em tempo real enquanto digita ---
function saveNoteText() {
    const textarea = document.getElementById("notepad-textarea");
    if (textarea) {
        localStorage.setItem("sandboxos_note_text", textarea.value);
    }
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
    
    document.querySelectorAll('.taskbar-button').forEach(function(btn) {
        btn.classList.remove('active');
    });
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
        const prev = openAppsList[appId].prevStyle;
        win.style.top = prev.top;
        win.style.left = prev.left;
        win.style.width = prev.width;
        win.style.height = prev.height;
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
        
        const nameMap = { 'notepad': '📝 Bloco de Notas', 'settings': '⚙️ Configurações' };
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

// --- NOVO: Lógica do Menu Iniciar ---
function toggleStartMenu(event) {
    event.stopPropagation(); // Impede o clique de propagar para o desktop
    const menu = document.getElementById("start-menu");
    if (menu) {
        if (menu.style.display === "none") {
            menu.style.display = "flex";
        } else {
            menu.style.display = "none";
        }
    }
}

function openAppFromStart(appId) {
    openApp(appId);
    document.getElementById("start-menu").style.display = "none"; // Fecha o menu ao abrir o app
}

function closeStartMenuOutside(event) {
    const menu = document.getElementById("start-menu");
    // Se o menu estiver aberto e o clique não foi dentro dele, fecha o menu
    if (menu && menu.style.display === "flex") {
        menu.style.display = "none";
    }
}

function clearSystemData() {
    if (confirm("Deseja redefinir o sistema? Isso limpará o texto das notas e a cor de fundo.")) {
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
    win.addEventListener('mousedown', function() {
        focusWindow(win);
    });
});

function makeDraggableAndResizable(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    const header = document.getElementById(elmnt.id + "-header");
    if (header) { header.onmousedown = dragMouseDown; }

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
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        let newTop = elmnt.offsetTop - pos2;
        let newLeft = elmnt.offsetLeft - pos1;

        const desktopWidth = window.innerWidth;
        const desktopHeight = window.innerHeight - 45; 
        
        const rect = elmnt.getBoundingClientRect();
        const winWidth = rect.width;
        const winHeight = rect.height;

        if (newTop < 0) newTop = 0;
        if (newLeft < 0) newLeft = 0;
        if (newLeft + winWidth > desktopWidth) newLeft = desktopWidth - winWidth;
        if (newTop + winHeight > desktopHeight) newTop = desktopHeight - winHeight;

        elmnt.style.top = newTop + "px";
        elmnt.style.left = newLeft + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }

    const resizeHandle = elmnt.querySelector('.window-resize-handle');
    if (resizeHandle) {
        resizeHandle.onmousedown = function(e) {
            e.preventDefault();
            e.stopPropagation(); 
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = function() {
                document.onmouseup = null;
                document.onmousemove = null;
            };
            document.onmousemove = function(e) {
                e.preventDefault();
                let widthDiff = e.clientX - pos3;
                let heightDiff = e.clientY - pos4;
                pos3 = e.clientX;
                pos4 = e.clientY;
                
                let currentWidth = parseInt(window.getComputedStyle(elmnt).width);
                let currentHeight = parseInt(window.getComputedStyle(elmnt).height);
                
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
