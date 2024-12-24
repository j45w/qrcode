const video = document.getElementById("qr-video");
const toggleScanButton = document.getElementById("toggle-scan");
const result = document.getElementById("result");
const idForm = document.getElementById("id-form");
const idInput = document.getElementById("id-input");
const tabs = document.querySelectorAll(".tab");
const scanContainer = document.getElementById("scan-container");
const idContainer = document.getElementById("id-container");

let scanning = false;
let codeReader;

// Backend base URL
const BASE_URL = "https://qrcode-n318.onrender.com"; // Your Render backend URL

// Function to validate and delete user by QR code or manual ID
async function validateAndDeleteQRCode(uniqueId) {
    try {
        const response = await fetch(`${BASE_URL}/api/users/validate-and-delete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uniqueId }),
        });

        const data = await response.json();

        if (response.ok) {
            result.textContent = `Success! ${data.message}`;
            result.className = "success fade-in";
        } else {
            result.textContent = data.error || "Validation failed";
            result.className = "error fade-in";
        }
    } catch (err) {
        result.textContent = "Failed to connect to the server.";
        result.className = "error fade-in";
    }
}

// Start camera and scanning
function startScanning() {
    if (codeReader) {
        codeReader.reset();
    }
    codeReader = new ZXing.BrowserQRCodeReader();
    codeReader.decodeFromVideoDevice(null, video.id, async (result, err) => {
        if (result) {
            try {
                const scannedData = JSON.parse(result.text);
                if (scannedData.uniqueId) {
                    await validateAndDeleteQRCode(scannedData.uniqueId);
                } else {
                    result.textContent = "Invalid QR Code format.";
                    result.className = "error fade-in";
                }
            } catch (e) {
                console.error("Error processing QR Code:", e);
                result.textContent = "Invalid QR Code.";
                result.className = "error fade-in";
            }
        }
        if (err && !(err instanceof ZXing.NotFoundException)) {
            console.error(err);
        }
    }).then(() => {
        scanning = true;
        toggleScanButton.textContent = "Stop Scanning";
    });
}

// Stop scanning and reset the camera
function stopScanning() {
    if (codeReader) {
        codeReader.reset();
        scanning = false;
        toggleScanButton.textContent = "Start Scanning";
    }
}

// Toggle scanning on button click
toggleScanButton.addEventListener("click", () => {
    if (scanning) {
        stopScanning();
    } else {
        initializeCamera();
    }
});

// Initialize the camera for scanning
function initializeCamera() {
    navigator.mediaDevices
        .getUserMedia({
            video: {
                facingMode: { ideal: "environment" }, // Rear-facing camera for mobile
                width: { ideal: 1280 },
                height: { ideal: 720 },
            },
        })
        .then(function (stream) {
            video.srcObject = stream;
            video.setAttribute("playsinline", true); // Required for iOS Safari
            video.play();
            startScanning();
        })
        .catch(function (err) {
            console.error("Camera access denied:", err);
            result.textContent = "Unable to access camera. Please check your permissions.";
            result.className = "error fade-in";
        });
}

// Validate manually entered ID
idForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = idInput.value.trim();
    if (id) {
        await validateAndDeleteQRCode(id);
        idInput.value = "";
    }
});

// Handle tab switching between Scan and Manual ID
tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        if (tab.dataset.tab === "scan") {
            scanContainer.classList.remove("hidden");
            idContainer.classList.add("hidden");
            initializeCamera();
        } else {
            scanContainer.classList.add("hidden");
            idContainer.classList.remove("hidden");
            stopScanning();
        }

        result.textContent = "";
        result.className = "";
    });
});

// Automatically start the camera on page load
initializeCamera();
