//
// LOCAL STORAGE
//
var tty = true; // LATER


//
// BASIC
//
const input = document.getElementById('prompt');
const output = document.getElementById('output');

input.focus();
window.addEventListener('click', () => input.focus());
input.addEventListener('blur', () => input.focus());

input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const typed = input.innerText.trim();
        runCommand(typed);
        input.innerText = '';
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        commandStop();
        input.innerText = '';
    }
    if (e.key === 'Tab') {
        e.preventDefault();
        const typedText = input.innerText.trim();

        if (!typedText) return;

        const commandList = Object.keys(commands);
        const matches = commandList.filter(cmd => cmd.startsWith(typedText));

        if (matches.length > 0) {
            input.innerText = matches[0];

            placeCaretAtEnd(input);
        }
    }
});


//
// COMMAND FUNCTIONALITY
//

// command list
// match / run command
const commands = {
    "help": cmdHelp,
    "clear": cmdClear,
    "geofetch": cmdGeofetch,
    "exit": cmdClose,

    // temp
    "echo": () => printOutput("you heard something, maybe an echo of the command, but nothing actually happened<br><br><p style='color: var(--tcol1)'>(yet to implement...)</p>"),
    "ls": () => printOutput("no files in this directory<br><br><p style='color: var(--tcol1)'>(yet to implement...)</p>"),
    "cat": () => printOutput("mmrrrooow~ meow!<br><br><p style='color: var(--tcol1)'>(yet to implement...)</p>"),
    "start": () => printOutput("Opening in new tab...") & open('/classic/'),
    
    // secrets (not very secret if you look at the source code, aka here)
    "nvim": () => printOutput("'nano' not installed"),
    "vim": () => printOutput("'nano' not installed"),
    "vi": () => printOutput("'nano' not installed"),
    "nano": () => printOutput("'neovim' not installed"),
    "sudo": () => printOutput("you arent allowed"),
    "root": () => printOutput("Access Denied"),
    "fastfetch": () => printOutput("In this world, the command is 'geofetch'"),
};

// command runner
async function runCommand(rawCmd) {
    const promptHost = document.getElementById('host').innerText;
    const historyLine = document.createElement('div');

    historyLine.className = 'history-line';
    historyLine.innerHTML = `<span>${promptHost}</span> <span>${escapeHTML(rawCmd)}</span>`;
    output.appendChild(historyLine);

    if (!rawCmd) {
        scrollToBottom();
        return;
    }

    const [cmdName, ...args] = rawCmd.split(' ');

    if (commands[cmdName]) {
        await commands[cmdName](args);
    } else {
        printOutput(`try again smh - command not found: ${cmdName}`);
    }

    if (rawCmd != "clear") {
        printOutput("<br>")
    }

    scrollToBottom();
}

// rn just ctrl+c handler
async function commandStop() {
    const promptHost = document.getElementById('host').innerText;
    const historyLine = document.createElement('div');

    historyLine.className = 'history-line';
    historyLine.innerHTML = `<span>${promptHost}</span>`
    output.appendChild(historyLine);

    printOutput("Ctrl + C - Killed<br><br>")

    scrollToBottom();
}

// tab autocomplete
function placeCaretAtEnd(el) {
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

// print output to output div
function printOutput(htmlContent) {
    const resLine = document.createElement('div');
    resLine.className = 'cmd-response';
    resLine.innerHTML = htmlContent;
    output.appendChild(resLine);
}

// scroll page to bottom if overflowing vertically
function scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
}

// prevent HTML escape
// https://stackoverflow.com/questions/7381974/which-characters-need-to-be-escaped-in-html
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag])
    );
}


//
// COMMANDS
// 

function cmdClear() {
    output.innerHTML = '';
}

function cmdHelp() {
    printOutput(`
        Available commands:<br><br>
        <b>geofetch</b> - fastfetch like fetch<br>
        <b>clear</b> - clear terminal screen<br>
        <b>help</b> - show this menu, wow<br>
        <b>cat</b> - check contents of file<br>
        <b>echo</b> - echo text to file/output<br>
        <b>ls</b> - list current directory<br>
        <b>start</b> - start original website<br>
        <b>exit</b> - exit the website<br><br>
        
        there may or may not be others...
    `);
}

async function cmdClose() {
    printOutput('<p style="color: var(--tcol1)">except you are never able to leave...<p>')
}

async function cmdGeofetch() {
    const logo = `
                -@                
               .##@               
              .####@              
              @#####@             
            . *######@            
           .##@o@#####@           
          /############@          
         /##############@         
        @######@**%######@        
       @######'     %#####o       
      @######@       ######%      
    -@#######h       ######@.'    
   /#####h**''       '**%@####@   
  @H@*'                    '*%#@  
*'                            '*
`;

    const items = [
        { icon: "nf-fa-fire", title: "Interests", val: "PC Hardware, FOSS, Gaming, Music" },
        { icon: "nf-fa-gamepad", title: "Fav Games", val: "MC, Trackmania, GD, UT/DR" },
        { icon: "nf-fa-tv", title: "Fav Media", val: "Star Trek, Severance, B99" },
        { icon: "nf-md-desktop_tower", title: "PC Specs", val: "Ryzen 9 5950X, 32GB DDR4, RX 6800XT" },
        { icon: "nf-fa-music", title: "Listening To", val: "TODO" },
        { icon: "nf-fa-record_vinyl", title: "Top Track", val: "TODO" },
        { icon: "nf-md-account_music", title: "Top Artist", val: "TODO" },
        { icon: "nf-md-music_clef_treble", title: "Scrobbles", val: "TODO" },
        { icon: "nf-linux-hyprland", title: "Current WM", val: "Hyprland" },
        { icon: "nf-fa-laptop", title: "Thinkpads", val: "7" },
        { icon: "nf-md-av_timer", title: "Your Uptime", val: getUptime() },
        { icon: "nf-oct-browser", title: "Your OS", val: getBrowser() }
    ];

    const fetchHTML = items.map(item => `
        <div class="fetch-row">
            <p class="nerd-icon ${item.icon}"></p>
            <span class="fetch-key">${item.title}:</span>
            <span class="fetch-val">${item.val}</span>
        </div>
    `).join('');

    const fetchContainerHTML = `
        <div class="geofetch-wrapper">
            <pre class="geofetch-logo">${logo}</pre>
            <div class="geofetch-stats">
                <div class="fetch-header"><b>guest@GeOS</b></div>
                <div class="fetch-divider">──────────────────────</div>
                ${fetchHTML}
            </div>
        </div>
    `;

    function getUptime() {
        const seconds = Math.floor(performance.now() / 1000);
        return `${seconds}s`;
    }

    function getBrowser() {
        return navigator.platform
    }
    
    printOutput(fetchContainerHTML);
}