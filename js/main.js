document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    generateSakura();
});

/* --- Fungsi Manajemen Tema (Pastel / Dark Mode) --- */
function initTheme() {
    const themeToggle = document.getElementById("theme-toggle");
    const htmlElement = document.documentElement;
    const modeIcon = themeToggle.querySelector(".mode-icon");

    // Ambil preferensi tema dari local storage jika ada
    const savedTheme = localStorage.getItem("theme") || "light";
    htmlElement.setAttribute("data-theme", savedTheme);
    updateToggleIcon(savedTheme, modeIcon);

    themeToggle.addEventListener("click", () => {
        const currentTheme = htmlElement.getAttribute("data-theme");
        const newTheme = currentTheme === "light" ? "dark" : "light";
        
        htmlElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        updateToggleIcon(newTheme, modeIcon);
    });
}

function updateToggleIcon(theme, iconElement) {
    // Ubah emoji ikon tombol sesuai tema aktif
    iconElement.textContent = theme === "light" ? "🌙" : "☀️";
}

/* --- Fungsi Efek Sakura Berguguran Estetik --- */
function generateSakura() {
    const container = document.getElementById("animation-container");
    const maxPetals = 15; // Batasi jumlah kelopak agar tidak membebani performa HP

    for (let i = 0; i < maxPetals; i++) {
        createPetal(container);
    }
}

function createPetal(container) {
    const petal = document.createElement("div");
    petal.classList.add("sakura-petal");

    // Pengaturan ukuran, posisi acak, dan durasi animasi secara acak
    const size = Math.random() * 8 + 6; // Antara 6px hingga 14px
    const startLeft = Math.random() * 100; // 0% hingga 100% lebar layar
    const duration = Math.random() * 12 + 8; // Kecepatan jatuh antara 8s hingga 20s
    const delay = Math.random() * -20; // Supaya animasi langsung tersebar sejak web dimuat

    petal.style.width = `${size}px`;
    petal.style.height = `${size * 1.4}px`; // Proporsi agak lonjong
    petal.style.left = `${startLeft}vw`;
    petal.style.animationDuration = `${duration}s`;
    petal.style.animationDelay = `${delay}s`;

    container.appendChild(petal);

    // Ketika animasi selesai, reset posisi agar jatuh berulang secara mulus
    petal.addEventListener("animationiteration", () => {
        petal.style.left = `${Math.random() * 100}vw`;
    });
}
