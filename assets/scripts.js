// THEME SWITCH / HEADER SCROLL
document.addEventListener("DOMContentLoaded", () => { // theme switching
    const header = document.querySelector("header");
    const headmid = document.querySelector(".head-centered");
    const headmain = document.querySelector(".head-main");
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

    window.addEventListener("scroll", () => { 
        header.classList.toggle("scrolled", window.scrollY > 50);
        headmid.classList.toggle("scrolled-centered", window.scrollY > 50);
        headmain.classList.toggle("scrolled-main", window.scrollY > 50);
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

// ANIMATION STATES
function show(el) {
  el.classList.add("show");
}
function hide(el) {
  el.classList.remove("show");
}

// NAVIGATION
document.addEventListener("DOMContentLoaded", () => {
    const head1 = document.querySelector(".head1");
    const head2 = document.querySelector(".head2");
    const navicon = document.querySelector(".nf-fa-navicon");
    const backicon = document.querySelector(".nf-fa-angle_left");
    const navbtn = document.getElementById("navbtn");
    const fullnav = document.getElementById("fullnav");
    const fullnavbtn = document.getElementById("fullnavbtn");
    
    let headerOpen = false;
    let fullnavOpen = false;

    navbtn.addEventListener("click", () => {
        const isResponsive = window.innerWidth < 600;

        if (!isResponsive) {
            if (!headerOpen) {
                hide(head1);
                show(head2);
                hide(navicon);
                show(backicon);
                headerOpen = true;
            } else {
                show(head1);
                hide(head2);
                show(navicon);
                hide(backicon);
                headerOpen = false;
            }
        } else {
            if (!fullnavOpen) {
                show(fullnav);
                show(fullnavbtn);
                fullnavOpen = true;
            }
        }
    });

    fullnavbtn.addEventListener("click", () => {
        hide(fullnav);
        hide(fullnavbtn);
        fullnavOpen = false;
    });
});

// TIME
function displayTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString(); 
    document.getElementById('clock').textContent = timeString;
}

displayTime(); 
setInterval(displayTime, 1000); 

// last.fm api
// pls dont abuse my api key 😔
const API_KEY = "6e524d1c84e12bd6fbd9e202b1442995";
const USER = "GeodeArc";
const BASE = "https://ws.audioscrobbler.com/2.0/";

async function fetchLastFM(method, params = {}) {
    const url = new URL(BASE);

    url.searchParams.set("method", method);
    url.searchParams.set("user", USER);
    url.searchParams.set("api_key", API_KEY);
    url.searchParams.set("format", "json");

    Object.entries(params).forEach(([k, v]) =>
    url.searchParams.set(k, v)
    );

    const res = await fetch(url);
    return res.json();
}

function truncate(str, max = 24) {
    if (!str) return "N/A";
    return str.length > max
    ? str.slice(0, max) + ".."
    : str;
}

async function loadMusicStats() {
    const [
    recent,
    topTracks,
    topArtists,
    topAlbums,
    userInfo
] = await Promise.all([
    fetchLastFM("user.getRecentTracks", { limit: 1 }),
    fetchLastFM("user.getTopTracks", { limit: 1, period: "7day" }),
    fetchLastFM("user.getTopArtists", { limit: 1, period: "7day" }),
    fetchLastFM("user.getTopAlbums", { limit: 1, period: "7day" }),
    fetchLastFM("user.getInfo")
]);

    const now = recent?.recenttracks?.track?.[0];
    const track = topTracks?.toptracks?.track?.[0];
    const artist = topArtists?.topartists?.artist?.[0];
    const album = topAlbums?.topalbums?.album?.[0];
    const scrobbles = userInfo?.user?.playcount;

    const title = truncate(now?.name, 24);

    document.querySelector(".nf-fa-music").innerHTML =
        ` <b>Listening to:</b> ${title} - ${now?.artist["#text"]}`;

    document.querySelector(".nf-fa-record_vinyl").innerHTML =
        ` <b>Top Track:</b> ${track?.name ?? "N/A"}`;

    document.querySelector(".nf-md-account_music").innerHTML =
        ` <b>Top Artist:</b> ${artist?.name ?? "N/A"}`;

    document.querySelector(".nf-md-music_box").innerHTML =
        ` <b>Top Album:</b> ${album?.name ?? "N/A"}`;

    document.querySelector(".nf-md-music_clef_treble").innerHTML =
        ` <b>Scrobbles:</b> ${scrobbles ?? "N/A"}`;
}

loadMusicStats();

// UPTIME
setInterval(() => {
    const time = performance.now() / 1000;
    document.querySelector(".nf-md-timer").innerHTML = ` <b>Uptime:</b> ${time.toFixed(0)}s`;
}, 1000); 