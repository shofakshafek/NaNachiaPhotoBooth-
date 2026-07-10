// State Global Manajemen Frame Canvas PRO
let currentFrameColor = "#ffcbd5"; 
let selectedFrameTheme = "pink";
let currentLayout = "strip"; // Default: 'strip' (vertikal), opsi lain: 'grid' (2x2)

document.addEventListener("DOMContentLoaded", () => {
    initCanvasComponents();
});

function initCanvasComponents() {
    const btnNextPart = document.getElementById("btn-next-part");
    const btnCloseModal = document.getElementById("btn-close-modal");
    const frameOptions = document.querySelectorAll(".btn-frame-opt");
    const layoutOptions = document.querySelectorAll(".btn-layout");

    if (btnNextPart) {
        btnNextPart.addEventListener("click", () => {
            document.getElementById("result-modal").classList.remove("hidden");
            buildPhotostrip();
        });
    }

    if (btnCloseModal) {
        btnCloseModal.addEventListener("click", () => {
            document.getElementById("result-modal").classList.add("hidden");
        });
    }

    // Handler Ganti Warna Frame
    frameOptions.forEach(opt => {
        opt.addEventListener("click", (e) => {
            frameOptions.forEach(o => o.classList.remove("active"));
            e.target.classList.add("active");
            selectedFrameTheme = e.target.getAttribute("data-frame");
            
            const colorMap = { pink: "#ffcbd5", mint: "#b2dfdb", blue: "#bbdefb", dark: "#263238" };
            currentFrameColor = colorMap[selectedFrameTheme];
            buildPhotostrip();
        });
    });

    // Handler Switch Layout PRO (Strip vs 2x2 Grid)
    layoutOptions.forEach(btn => {
        btn.addEventListener("click", (e) => {
            layoutOptions.forEach(l => l.classList.remove("active"));
            e.target.classList.add("active");
            currentLayout = e.target.getAttribute("data-layout");
            
            // Jika modal sedang terbuka, langsung render ulang layoutnya secara live
            const modal = document.getElementById("result-modal");
            if(modal && !modal.classList.contains("hidden")) {
                buildPhotostrip();
            }
        });
    });
}

async function buildPhotostrip() {
    const canvas = document.getElementById("photostrip-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    if (!capturedImages || capturedImages.length === 0) return;
    const numPhotos = capturedImages.length;
    
    // Spesifikasi Dimensi Satuan Gambar
    const photoW = 500;
    const photoH = 375; 
    const padding = 30;
    const bottomSpace = 140; 

    // Ambil string filter aktif dari editor.js
    let activeFilter = "none";
    if (typeof getCanvasFilterString === "function") {
        activeFilter = getCanvasFilterString();
    }

    // KONDISI LAYOUT 1: Mode 2x2 Korean Grid (Hanya aktif jika foto berjumlah pas 4)
    if (currentLayout === "grid" && numPhotos === 4) {
        canvas.width = (photoW * 2) + (padding * 3);
        canvas.height = (photoH * 2) + (padding * 3) + bottomSpace;

        ctx.filter = "none";
        ctx.fillStyle = currentFrameColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Rendering Grid Matriks Foto 2x2
        for (let i = 0; i < 4; i++) {
            const img = await loadImgAsync(capturedImages[i]);
            const col = i % 2;          // Kolom 0 atau 1
            const row = Math.floor(i / 2); // Baris 0 atau 1
            
            const dx = padding + (col * (photoW + padding));
            const dy = padding + (row * (photoH + padding));

            ctx.save();
            ctx.filter = activeFilter;
            ctx.drawImage(img, dx, dy, photoW, photoH);
            ctx.restore();
        }

    } else {
        // KONDISI LAYOUT 2: Mode Vertikal Klasik (Default)
        canvas.width = photoW + (padding * 2);
        canvas.height = (photoH * numPhotos) + (padding * (numPhotos + 1)) + bottomSpace;

        ctx.filter = "none";
        ctx.fillStyle = currentFrameColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < numPhotos; i++) {
            const img = await loadImgAsync(capturedImages[i]);
            const dx = padding;
            const dy = padding + (i * (photoH + padding));
            
            ctx.save();
            ctx.filter = activeFilter; 
            ctx.drawImage(img, dx, dy, photoW, photoH);
            ctx.restore();
        }
    }

    // Render Hiasan Seni Panda Dasar & Watermark
    ctx.filter = "none";
    drawPandaDecorations(ctx, canvas.width, canvas.height);

    // Render Teks Kustom Overlay
    if (typeof customTextState !== "undefined" && customTextState.text.trim() !== "") {
        ctx.save();
        ctx.fillStyle = customTextState.color;
        ctx.font = "bold 32px 'Fredoka', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
        ctx.shadowBlur = 6;
        
        const tx = (customTextState.pctX / 100) * canvas.width;
        const ty = (customTextState.pctY / 100) * canvas.height;
        ctx.fillText(customTextState.text, tx, ty);
        ctx.restore();
    }

    // Render Stiker Tempel Overlay
    if (typeof placedStickers !== "undefined" && placedStickers.length > 0) {
        ctx.save();
        ctx.font = "42px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        placedStickers.forEach(stk => {
            const sx = (stk.pctX / 100) * canvas.width;
            const sy = (stk.pctY / 100) * canvas.height;
            ctx.fillText(stk.emoji, sx, sy);
        });
        ctx.restore();
    }

    // --- FITUR PRO: REALISTIC GLOSSY OVERPRINT COATING ---
    // Menyapu pencahayaan diagonal transparan di atas seluruh canvas agar terlihat seperti refleksi cetakan fisik asli
    ctx.save();
    const glossyGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    glossyGradient.addColorStop(0, "rgba(255, 255, 255, 0.16)");
    glossyGradient.addColorStop(0.25, "rgba(255, 255, 255, 0.0)");
    glossyGradient.addColorStop(0.48, "rgba(255, 255, 255, 0.0)");
    glossyGradient.addColorStop(0.50, "rgba(255, 255, 255, 0.22)"); // Garis pantulan utama
    glossyGradient.addColorStop(0.53, "rgba(255, 255, 255, 0.05)");
    glossyGradient.addColorStop(0.75, "rgba(255, 255, 255, 0.0)");
    glossyGradient.addColorStop(1, "rgba(255, 255, 255, 0.0)");
    
    ctx.fillStyle = glossyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
}

function loadImgAsync(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = src;
    });
}

function drawPandaDecorations(ctx, canvasW, canvasH) {
    const centerY = canvasH - 75;
    // Posisikan watermark di tengah secara dinamis jika melebari ke versi grid pro
    const centerX = currentLayout === "grid" ? (canvasW / 2) - 130 : 80; 
    
    const primaryColor = selectedFrameTheme === "dark" ? "#ffffff" : "#2c3e50";
    const whiteColor = "#ffffff";

    ctx.save();
    // Telinga
    ctx.fillStyle = primaryColor;
    ctx.beginPath(); ctx.arc(centerX - 22, centerY - 22, 14, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(centerX + 22, centerY - 22, 14, 0, Math.PI * 2); ctx.fill();
    // Kepala
    ctx.fillStyle = whiteColor;
    ctx.beginPath(); ctx.arc(centerX, centerY, 28, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = primaryColor; ctx.stroke();
    // Mata
    ctx.fillStyle = primaryColor;
    ctx.beginPath(); ctx.arc(centerX - 10, centerY - 2, 7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(centerX + 10, centerY - 2, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = whiteColor;
    ctx.beginPath(); ctx.arc(centerX - 10, centerY - 3, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(centerX + 10, centerY - 3, 2, 0, Math.PI * 2); ctx.fill();
    // Hidung
    ctx.fillStyle = primaryColor;
    ctx.beginPath(); ctx.arc(centerX, centerY + 6, 3, 0, Math.PI * 2); ctx.fill();
    // Watermark Text
    ctx.fillStyle = primaryColor;
    ctx.font = "bold 26px 'Fredoka', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("NaNachiaPhotoBooth", centerX + 45, centerY + 3);
    ctx.fillStyle = selectedFrameTheme === "dark" ? "#ff8fa3" : "#7d7d7d";
    ctx.font = "700 20px 'Quicksand', sans-serif";
    ctx.fillText("by shfq", centerX + 45, centerY + 28);
    ctx.restore();
}
