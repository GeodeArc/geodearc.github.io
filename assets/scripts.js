// THEME SWITCH
document.addEventListener("DOMContentLoaded", () => { // theme switching
    const togglebtn = document.getElementById("themeswitch");
    const body = document.body;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const savedTheme = localStorage.getItem("theme");

    function applyTheme(theme) {  // applies the theme
        if (theme === "dark") {
            body.classList.add("darkmode");
        } else {
            body.classList.remove("darkmode");
        }
    }

    if (savedTheme) { // checks local storage, and system preferences
        applyTheme(savedTheme);
    } else {
        applyTheme(systemPrefersDark ? "dark" : "light"); 
    }
    if (togglebtn) {
        togglebtn.addEventListener("click", () => { // theme switching, click script
            const currentTheme = body.classList.contains("darkmode") ? "dark" : "light";
            const newTheme = currentTheme === "dark" ? "light" : "dark";

            applyTheme(newTheme);
            localStorage.setItem("theme", newTheme);
        });
    }

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => { // live reloading
        if (!localStorage.getItem("theme")) { 
            applyTheme(event.matches ? "dark" : "light");
        }
    });
});

// CLIPBOARD COPY (copyClipboard)
function copyClip() {
    const text = document.querySelector('.copy').innerText;
    navigator.clipboard.writeText(text);

    const icon = document.getElementById('copyicon');
    icon.className = 'nf-fa-check';

    setTimeout(() => {
        icon.className = 'nf-fa-copy';
    }, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
    const head1 = document.querySelector(".head1");
    const head2 = document.querySelector(".head2");
    const navicon = document.querySelector(".nf-fa-navicon");
    const backicon = document.querySelector(".nf-fa-angle_left");
    const navbtn = document.getElementById("navbtn");

    // initial state
    head1.style.display = "block";
    head2.style.display = "none";
    navicon.style.display = "block";
    backicon.style.display = "none";

    navbtn.addEventListener("click", () => {
        const isOpen = head2.style.display === "flex";
        if (!isOpen) {
            // open menu
            head1.style.display = "none";
            head2.style.display = "flex";
            navicon.style.display = "none";
            backicon.style.display = "block";
        } else {
            // close menu
            head1.style.display = "block";
            head2.style.display = "none";
            navicon.style.display = "block";
            backicon.style.display = "none";
        }
    });
});