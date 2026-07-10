// State Filter & Aksesoris Dekorasi Global
let currentFilters = { brightness: 100, contrast: 100, saturation: 100, sepia: 0, grayscale: 0, hueRotate: 0 };
let currentStep = 1; // 1 = Frame, 2 = Filter, 3 = Stiker

// State Teks Kustom & Stiker
let customTextState = { text: "", color: "#ffffff", pctX: 50, pctY: 88 };
let placedStickers = []; 

document.addEventListener("DOMContentLoaded", () => {
    initEditorControls();
});

function initEditorControls() {
    const btnToggleView = document.getElementById("btn-toggle-view");
    const btnToPart6 = document.getElementById("btn-to-part6");
    
    const viewFrame = document.getElementById("view-frame-select");
    const viewFilter = document.getElementById("view-filter-edit");
    const viewSticker = document.getElementById("view-sticker-text");
    const modalTitle = document.getElementById("modal-title");

    // Alur Mesin Navigasi Antar Menu Editor (Step-by-Step)
    btnToggleView.addEventListener("click", () => {
        if (currentStep === 1) {
            // Pindah ke Filter
            viewFrame.classList.add("hidden");
            viewFilter.classList.remove("hidden");
            modalTitle.textContent = "Sesuaikan Filter ✨";
            btnToggleView.textContent = "Lanjut Stiker & Teks 🧸";
            currentStep = 2;
        } else if (currentStep === 2) {
            // Pindah ke Stiker
            viewFilter.classList.add("hidden");
            viewSticker.classList.remove("hidden");
            modalTitle.textContent = "Tambah Hiasan Lucu 🎀";
            btnToggleView.textContent = "↩️ Reset ke Awal (Frame)";
            
            // Aktifkan & Munculkan tombol download (Fitur Utama Part 6)
            btnToPart6.classList.remove("hidden");
            btnToPart6.disabled = false; 
            currentStep = 3;
        } else {
            // Reset balik ke Frame awal
            viewSticker.classList.add("hidden");
            viewFrame.classList.remove("hidden");
            modalTitle.textContent = "Pratinjau Cetak Strip 🎀";
            btnToggleView.textContent = "Lanjut Editor Filter 🎨";
            btnToPart6.classList.add("hidden");
            btnToPart6.disabled = true;
            currentStep = 1;
        }
    });

    // --- LOGIKA MANUAL SLIDER FILTER ---
    const bSlider = document.getElementById("slider-brightness");
    const cSlider = document.getElementById("slider-contrast");
    const sSlider = document.getElementById("slider-saturation");

    const handleSliderChange = () => {
        currentFilters.brightness = bSlider.value;
        currentFilters.contrast = cSlider.value;
        currentFilters.saturation = sSlider.value;
        document.querySelectorAll(".btn-preset").forEach(b => b.classList.remove("active"));
        if (typeof buildPhotostrip === "function") buildPhotostrip();
    };

    bSlider.addEventListener("input", handleSliderChange);
    cSlider.addEventListener("input", handleSliderChange);
    sSlider.addEventListener("input", handleSliderChange);

    // Filter Preset Cepat
    const presetButtons = document.querySelectorAll(".btn-preset");
    presetButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            if(e.target.id === "btn-clear-stickers") return; // Skip tombol reset stiker
            presetButtons.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            applyPresetValues(e.target.getAttribute("data-preset"));
            bSlider.value = currentFilters.brightness;
            cSlider.value = currentFilters.contrast;
            sSlider.value = currentFilters.saturation;
            if (typeof buildPhotostrip === "function") buildPhotostrip();
        });
    });

    // --- LOGIKA TEKS KUSTOM & STIKER ---
    const textInput = document.getElementById("input-custom-text");
    const textColorInput = document.getElementById("input-text-color");
    const textXSlider = document.getElementById("slider-text-x");
    const textYSlider = document.getElementById("slider-text-y");

    const triggerCanvasRebuild = () => {
        customTextState.text = textInput.value;
        customTextState.color = textColorInput.value;
        customTextState.pctX = textXSlider.value;
        customTextState.pctY = textYSlider.value;
        if (typeof buildPhotostrip === "function") buildPhotostrip();
    };

    textInput.addEventListener("input", triggerCanvasRebuild);
    textColorInput.addEventListener("input", triggerCanvasRebuild);
    textXSlider.addEventListener("input", triggerCanvasRebuild);
    textYSlider.addEventListener("input", triggerCanvasRebuild);

    // Klik tombol emoji untuk nempel stiker
    const stickerButtons = document.querySelectorAll(".btn-sticker");
    stickerButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const emoji = e.target.getAttribute("data-emoji");
            placedStickers.push({
                emoji: emoji,
                pctX: 35 + Math.random() * 30, 
                pctY: 20 + Math.random() * 50  
            });
            if (typeof buildPhotostrip === "function") buildPhotostrip();
        });
    });

    // Reset Hapus Semua Stiker Tempel
    document.getElementById("btn-clear-stickers").addEventListener("click", () => {
        placedStickers = [];
        if (typeof buildPhotostrip === "function") buildPhotostrip();
    });

    // --- ENGINE DOWNLOAD AMAN DATA CANVAS (Baru di Part 6) ---
    btnToPart6.addEventListener("click", () => {
        const canvas = document.getElementById("photostrip-canvas");
        if (!canvas) return;

        try {
            // Membuat nama berkas unik menggunakan timestamp waktu milisekon
            const timestamp = new Date().getTime();
            const fileName = `NaNachiaBooth_${timestamp}.png`;

            // Konversi data canvas ke bentuk Blob gambar bertipe PNG (Sangat aman untuk Mobile)
            canvas.toBlob((blob) => {
                if (!blob) return;
                const blobUrl = URL.createObjectURL(blob);
                
                // Buat elemen jangkar tautan virtual berekstensi download
                const downloadLink = document.createElement("a");
                downloadLink.href = blobUrl;
                downloadLink.download = fileName;
                
                // Masukkan ke dokumen, trigger klik otomatis, lalu langsung singkirkan
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                
                // Bebaskan alokasi memori objek URL setelah selesai diunduh
                setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
            }, "image/png");

        } catch (error) {
            console.error("Gagal mengeksekusi penyimpanan gambar:", error);
            alert("Waduh, gagal mengunduh otomatis. Jangan panik, kamu bisa tekan lama (long press) pada gambar cetakan photostrip di atas, lalu pilih 'Simpan Gambar'!");
        }
    });
}

function applyPresetValues(presetName) {
    currentFilters = { brightness: 100, contrast: 100, saturation: 100, sepia: 0, grayscale: 0, hueRotate: 0 };
    if (presetName === "vintage") { currentFilters.sepia = 40; currentFilters.contrast = 85; currentFilters.brightness = 95; }
    else if (presetName === "bw") { currentFilters.grayscale = 100; currentFilters.contrast = 120; }
    else if (presetName === "cool") { currentFilters.hueRotate = 15; currentFilters.saturation = 110; }
}

function getCanvasFilterString() {
    return `brightness(${currentFilters.brightness}%) contrast(${currentFilters.contrast}%) saturate(${currentFilters.saturation}%) sepia(${currentFilters.sepia}%) grayscale(${currentFilters.grayscale}%) hue-rotate(${currentFilters.hueRotate}deg)`;
}
