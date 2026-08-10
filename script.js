/* Configurações Globais */
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    user-select: none;
}

body, html {
    height: 100%;
    overflow: hidden;
}

#desktop {
    background: url('https://unsplash.com') no-repeat center center;
    background-size: cover;
    height: calc(100vh - 45px);
    position: relative;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-content: flex-start;
    flex-wrap: wrap;
}

.shortcut {
    width: 80px;
    height: 80px;
    color: white;
    text-align: center;
    cursor: pointer;
    font-size: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    text-shadow: 1px 1px 4px rgba(0,0,0,0.8);
    border-radius: 4px;
    transition: background 0.2s;
}

.shortcut:hover {
    background: rgba(255, 255, 255, 0.15);
}

.shortcut-icon {
    font-size: 32px;
}

.window {
    position: absolute;
    width: 400px;
    height: 300px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.2);
    box-shadow: 0px 8px 24px rgba(0,0,0,0.3);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.window-header {
    background: #f3f3f3;
    color: #333;
    padding: 8px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ddd;
    cursor: move;
}

.window-title {
    font-size: 14px;
    font-weight: 500;
}

.window-controls button {
    background: none;
    border: none;
    width: 28px;
    height: 24px;
    cursor: pointer;
    font-size: 12px;
    border-radius: 4px;
    transition: background 0.2s;
}

.window-controls button:hover {
    background: #e5e5e5;
}

.window-controls .close-btn:hover {
    background: #e81123;
    color: white;
}

.window-content {
    flex: 1;
    padding: 10px;
    background: white;
}

textarea {
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
    resize: none;
    font-size: 14px;
}

/* Layout específico do app de Configurações */
.settings-layout {
    display: flex;
    padding: 0; /* Remove o padding padrão da janela para colar as seções */
}

.settings-sidebar {
    width: 120px;
    background: #f9f9f9;
    border-right: 1px solid #eee;
    display: flex;
    flex-direction: column;
    padding: 10px 0;
}

.settings-sidebar button {
    background: none;
    border: none;
    padding: 10px 15px;
    text-align: left;
    font-size: 14px;
    cursor: pointer;
    width: 100%;
}

.settings-sidebar button.active {
    background: #e2e2e2;
    font-weight: bold;
}

.settings-body {
    flex: 1;
    padding: 20px;
}

.settings-body h3 {
    margin-bottom: 5px;
    font-size: 18px;
}

.settings-body p {
    font-size: 13px;
    color: #666;
    margin-bottom: 15px;
}

/* Grade de seleção de cores */
.color-picker-grid {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.color-ball {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid transparent;
    transition: transform 0.2s, border 0.2s;
    box-shadow: 0 2px 5px rgba(0,0,0,0.15);
}

.color-ball:hover {
    transform: scale(1.1);
    border-color: #333;
}

.color-blue { background-color: #2a4d69; }
.color-purple { background-color: #4b357a; }
.color-dark { background-color: #1e1e1e; }
.color-green { background-color: #1e4620; }
.color-sunset { background-color: #b85d32; }
.color-default { 
    background: linear-gradient(45deg, #2196F3, #9C27B0); 
    border-radius: 8px; /* Quadrado arredondado diferenciado */
}

/* Barra de Tarefas */
#taskbar {
    height: 45px;
    background: rgba(32, 32, 32, 0.85);
    backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    padding: 0 15px;
    position: relative;
    z-index: 99999;
}

#start-menu-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
}

#start-menu-btn:hover {
    background: rgba(255, 255, 255, 0.2);
}
