const imgs = document.querySelectorAll(".photo-card img");
const preview = document.getElementById("preview");
const previewImg = document.getElementById("previewImg");
const closeBtn = document.getElementById("close");

function openPreview(src, alt) {
    previewImg.src = src;
    previewImg.alt = alt || "图片预览";
    preview.classList.add("show");
    preview.setAttribute("aria-hidden", "false");
}

function closePreview() {
    preview.classList.remove("show");
    preview.setAttribute("aria-hidden", "true");
    previewImg.removeAttribute("src");
}

imgs.forEach((img) => {
    img.addEventListener("click", () => {
        openPreview(img.src, img.alt);
    });
});

closeBtn.addEventListener("click", closePreview);

preview.addEventListener("click", (event) => {
    if (event.target === preview) {
        closePreview();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && preview.classList.contains("show")) {
        closePreview();
    }
});

const bgm = document.getElementById("bgm");
const MUSIC_ENABLED_KEY = "bowenMusicEnabled";
const MUSIC_TIME_KEY = "bowenMusicTime";

function saveMusicTime() {
    if (bgm && Number.isFinite(bgm.currentTime)) {
        localStorage.setItem(MUSIC_TIME_KEY, String(bgm.currentTime));
    }
}

function tryPlaySharedMusic() {
    if (!bgm || localStorage.getItem(MUSIC_ENABLED_KEY) === "false") return;

    const savedTime = Number(localStorage.getItem(MUSIC_TIME_KEY));
    if (Number.isFinite(savedTime) && savedTime > 0) {
        bgm.currentTime = savedTime;
    }

    bgm.play().catch(() => {
        document.addEventListener("click", () => {
            if (localStorage.getItem(MUSIC_ENABLED_KEY) !== "false") {
                bgm.play().catch(() => {});
            }
        }, { once: true });
    });
}

if (bgm) {
    tryPlaySharedMusic();
    bgm.addEventListener("timeupdate", saveMusicTime);
    window.addEventListener("beforeunload", saveMusicTime);
}
