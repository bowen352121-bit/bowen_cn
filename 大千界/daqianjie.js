const PHOTOS = [
    { file: "fj1.jpg", addedAt: "2026-06-16T04:35:41" },
    { file: "fj2.jpg", addedAt: "2026-06-16T04:35:48" },
    { file: "zhe1.jpg", addedAt: "2026-06-16T04:36:09" },
    { file: "CH.jpg", addedAt: "2026-06-16T15:34:08" },
    { file: "CH2.jpg", addedAt: "2026-06-16T15:34:25" },
    { file: "CH3.jpg", addedAt: "2026-06-16T15:34:37" },
    { file: "CH4.jpg", addedAt: "2026-06-16T15:34:46" },
    { file: "CH5.jpg", addedAt: "2026-06-16T15:35:02" },
    { file: "CH6.jpg", addedAt: "2026-06-16T15:35:08" },
    { file: "CH7.jpg", addedAt: "2026-06-16T15:35:14" },
    { file: "CH8.jpg", addedAt: "2026-06-16T15:35:19" },
    { file: "CH9.jpg", addedAt: "2026-06-16T15:35:25" },
    { file: "CH10.jpg", addedAt: "2026-06-16T15:35:32" },
    { file: "CH11.jpg", addedAt: "2026-06-16T15:35:38" },
    { file: "26.6.23_1.jpg", addedAt: "2026-06-23T14:20:00" },
    { file: "26.6.23_2.jpg", addedAt: "2026-06-23T14:25:00" },
    { file: "26.6.23_3.jpg", addedAt: "2026-06-23T14:30:00" }
];

const gallery = document.getElementById("gallery");
const preview = document.getElementById("preview");
const previewImg = document.getElementById("previewImg");
const previewDate = document.getElementById("previewDate");
const closeBtn = document.getElementById("close");

function getDayPeriod(hour) {
    if (hour >= 0 && hour < 6) return "凌晨";
    if (hour >= 6 && hour < 12) return "上午";
    if (hour >= 12 && hour < 18) return "下午";
    return "晚上";
}

function formatCardDate(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
}

function formatAddedDate(dateStr) {
    const date = new Date(dateStr);
    return `${formatCardDate(dateStr)} ${getDayPeriod(date.getHours())}`;
}

function initHeroCarousel() {
    const track = document.getElementById("hero-carousel-track");
    const heroDate = document.getElementById("hero-date");
    const heroBanner = document.getElementById("hero-banner");
    if (!track || !heroDate) return;

    const slides = PHOTOS.slice(0, 8);
    let currentIndex = 0;
    let timer = null;

    track.innerHTML = slides.map((photo) => {
        const src = `../dqjimages/${photo.file}`;
        return `
            <div class="hero-slide">
                <img src="${src}" alt="大千界横幅 ${photo.file}" loading="eager">
            </div>
        `;
    }).join("");

    function updateHero(index) {
        currentIndex = index;
        track.style.transform = `translate3d(-${currentIndex * 100}%, 0, 0)`;
        heroDate.textContent = formatCardDate(slides[currentIndex].addedAt);
    }

    function startAutoPlay() {
        clearInterval(timer);
        timer = setInterval(() => {
            updateHero((currentIndex + 1) % slides.length);
        }, 3500);
    }

    updateHero(0);
    startAutoPlay();

    if (heroBanner) {
        heroBanner.addEventListener("mouseenter", () => clearInterval(timer));
        heroBanner.addEventListener("mouseleave", startAutoPlay);

        let touchStartX = 0;
        heroBanner.addEventListener("touchstart", (e) => {
            touchStartX = e.changedTouches[0].screenX;
            clearInterval(timer);
        }, { passive: true });
        heroBanner.addEventListener("touchend", (e) => {
            const dx = e.changedTouches[0].screenX - touchStartX;
            if (Math.abs(dx) >= 40) {
                if (dx < 0) {
                    updateHero((currentIndex + 1) % slides.length);
                } else {
                    updateHero((currentIndex - 1 + slides.length) % slides.length);
                }
            }
            startAutoPlay();
        }, { passive: true });
    }
}

function renderGallery() {
    if (!gallery) return;

    gallery.innerHTML = PHOTOS.map((photo) => {
        const src = `../dqjimages/${photo.file}`;
        const label = photo.file.replace(/\.[^.]+$/, "");
        return `
            <article class="photo-card">
                <button class="card-tool" type="button" title="摄影">▣</button>
                <span class="card-date">${formatCardDate(photo.addedAt)}</span>
                <img
                    src="${src}"
                    alt="大千界摄影作品 ${label}"
                    data-added="${photo.addedAt}"
                    loading="lazy"
                >
            </article>
        `;
    }).join("");

    gallery.querySelectorAll(".photo-card img").forEach((img) => {
        img.addEventListener("click", () => {
            openPreview(img.src, img.alt, img.dataset.added);
        });
    });
}

function openPreview(src, alt, addedAt) {
    previewImg.src = src;
    previewImg.alt = alt || "图片预览";
    previewDate.textContent = formatAddedDate(addedAt);
    preview.classList.add("show");
    preview.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closePreview() {
    preview.classList.remove("show");
    preview.setAttribute("aria-hidden", "true");
    previewImg.removeAttribute("src");
    previewDate.textContent = "";
    document.body.style.overflow = "";
}

if (closeBtn) {
    closeBtn.addEventListener("click", closePreview);
}

if (preview) {
    preview.addEventListener("click", (event) => {
        if (event.target === preview) {
            closePreview();
        }
    });
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && preview.classList.contains("show")) {
        closePreview();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    initHeroCarousel();
    renderGallery();

    window.BowenMusic?.bindToggle(
        document.getElementById("music-toggle"),
        document.getElementById("music-icon"),
        { play: "../images/音乐打开键.jpg", mute: "../images/音乐关闭键.jpg" }
    );
});
