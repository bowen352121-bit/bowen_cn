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

document.addEventListener("DOMContentLoaded", () => {
    window.BowenMusic?.init();
});
