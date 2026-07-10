// State Global Kamera
let localStream = null;
let currentFacingMode = "user"; // "user" = kamera depan, "environment" = kamera belakang
let selectedPhotosCount = 1;
let capturedImages = []; // Array untuk menyimpan hasil foto (Base64)

document.addEventListener("DOMContentLoaded", () => {
    initCameraControls();
    startCamera();
});

// Inisialisasi Event Listener Kontrol UI
function initCameraControls() {
    const shutterBtn = document.getElementById("btn-shutter");
    const switchBtn = document.getElementById("btn-switch");
    const modeButtons = document.querySelectorAll(".btn-mode");

    // Event Klik Shutter (Mulai Ambil Foto)
    shutterBtn.addEventListener("click", startCaptureSequence);

    // Event Klik Switch Kamera (Depan <-> Belakang)
    switchBtn.addEventListener("click", toggleCameraFacing);

    // Event Klik Pemilihan Mode Jumlah Foto
    modeButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            modeButtons.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            selectedPhotosCount = parseInt(e.target.getAttribute("data-photos"));
        });
    });
}

// Fungsi Membuka Aliran Kamera Perangkat
async function startCamera() {
    const videoElement = document.getElementById("camera-stream");
    
    // Stop stream lama jika ada sebelum membuka yang baru
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }

    const constraints = {
        video: {
            facingMode: currentFacingMode,
            width: { ideal: 1280 },
            height: { ideal: 960 }
        },
        audio: false
    };

    try {
        localStream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = localStream;
        
        // Atur efek cermin hanya untuk kamera depan biar natural saat dipakai berkaca
        if (currentFacingMode === "user") {
            videoElement.classList.add("mirror");
        } else {
            videoElement.classList.remove("mirror");
        }
    } catch (error) {
        console.error("Gagal mengakses kamera:", error);
        alert("Akses kamera ditolak atau tidak tersedia. Pastikan memberikan izin kamera.");
    }
}

// Fungsi Mengganti Kamera
function toggleCameraFacing() {
    currentFacingMode = currentFacingMode === "user" ? "environment" : "user";
    startCamera();
}

// Fungsi Pembantu Jeda Waktu (Sleep)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fungsi Rangkaian Pengambilan Foto Beruntun (Sequence)
async function startCaptureSequence() {
    const shutterBtn = document.getElementById("btn-shutter");
    const switchBtn = document.getElementById("btn-switch");
    const modeButtons = document.querySelectorAll(".btn-mode");
    
    // Kunci UI selama proses berfoto agar user tidak menekan tombol lain
    shutterBtn.disabled = true;
    switchBtn.disabled = true;
    modeButtons.forEach(b => b.disabled = true);
    
    capturedImages = []; // Reset penampung foto lama

    for (let i = 0; i < selectedPhotosCount; i++) {
        // Jalankan countdown 3 detik untuk setiap sesi foto
        await runCountdown(3);
        
        // Eksekusi jepretan foto
        captureSingleFrame();
        
        // Berikan jeda 1.5 detik antar sesi foto agar user bisa berganti pose
        if (i < selectedPhotosCount - 1) {
            await sleep(1500);
        }
    }

    // Aktifkan tombol navigasi ke Part 3 karena foto sudah siap
    document.getElementById("btn-next-part").disabled = false;
    
    // Buka kembali kunci UI kontrol
    shutterBtn.disabled = false;
    switchBtn.disabled = false;
    modeButtons.forEach(b => b.disabled = false);

    alert(`Berhasil menangkap ${capturedImages.length} foto! Siap untuk digabung ke Frame di Part 3.`);
}

// Fungsi Menampilkan Hitung Mundur Visual
function runCountdown(seconds) {
    return new Promise((resolve) => {
        const overlay = document.getElementById("countdown-overlay");
        overlay.classList.remove("hidden");
        
        let current = seconds;
        overlay.textContent = current;

        const interval = setInterval(() => {
            current--;
            if (current > 0) {
                overlay.textContent = current;
            } else {
                clearInterval(interval);
                overlay.classList.add("hidden");
                resolve(); // Selesai hitung mundur
            }
        }, 1000);
    });
}

// Fungsi Menangkap Gambar dari Track Video ke Canvas Tersembunyi
function captureSingleFrame() {
    triggerFlashAnimation();
    playSyntheticShutterSound();

    const video = document.getElementById("camera-stream");
    const canvas = document.createElement("canvas");
    
    // Gunakan resolusi asli video dari kamera asli agar hasil jernih HD
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext("2d");

    // Jika kamera depan, hasil foto canvas harus di-flip horizontal 
    // agar hasilnya sama persis dengan apa yang dilihat user di layar pratinjau (tidak terbalik)
    if (currentFacingMode === "user") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Konversi hasil gambar ke format Base64 PNG dan simpan ke array global
    const dataUrl = canvas.toDataURL("image/png");
    capturedImages.push(dataUrl);
}

// Efek Kilatan Flash Putih
function triggerFlashAnimation() {
    const flash = document.getElementById("flash-overlay");
    flash.classList.add("animate-flash");
    
    flash.addEventListener("animationend", () => {
        flash.classList.remove("animate-flash");
    }, { once: true });
}

// Sintetis Audio Shutter Menggunakan Web Audio API (Suara Klik Kamera Asli)
function playSyntheticShutterSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        
        const audioCtx = new AudioContext();
        const bufferSize = audioCtx.sampleRate * 0.1; // Durasi suara klik singkat (0.1 detik)
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Membuat efek suara "shsh" menggunakan white noise acak
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noiseNode = audioCtx.createBufferSource();
        noiseNode.buffer = buffer;

        // Filter frekuensi agar menyerupai mekanik shutter besi kamera
        const filterNode = audioCtx.createBiquadFilter();
        filterNode.type = 'bandpass';
        filterNode.frequency.value = 1200;

        // Mengatur volume suara meluruh cepat dari keras ke sunyi (exponential decay)
        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);

        noiseNode.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        noiseNode.start();
    } catch (e) {
        console.warn("Web Audio API tidak didukung pada browser ini.", e);
    }
}
