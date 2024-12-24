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

// Function to validate and delete user by QR code or manual ID
async function validateAndDeleteQRCode(uniqueId) {
    try {
        const response = await fetch("https://qrcode-n318.onrender.com/api/users/validate-and-delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uniqueId }),
        });

        const data = await response.json();

        const resultDiv = document.getElementById("result");
        resultDiv.classList.remove("hidden"); // Make result visible

        if (response.ok) {
            resultDiv.textContent = `Success! ${data.message}`;
            resultDiv.className = "success fade-in"; // Apply success styling
        } else {
            resultDiv.textContent = data.error || "Validation failed";
            resultDiv.className = "error fade-in"; // Apply error styling
        }
    } catch (err) {
        const resultDiv = document.getElementById("result");
        resultDiv.classList.remove("hidden");
        resultDiv.textContent = "Failed to connect to the server.";
        resultDiv.className = "error fade-in"; // Apply error styling
    }
}


// Start camera and scanning
function startScanning() {
    codeReader = new ZXing.BrowserMultiFormatReader();
    codeReader
        .decodeFromVideoDevice(null, video, (result, err) => {
            if (result) {
                const scannedData = result.text;
                try {
                    const parsedData = JSON.parse(scannedData);
                    validateAndDeleteQRCode(parsedData.uniqueId);
                } catch (error) {
                    console.error("Invalid QR Code format:", error);
                    result.textContent = "Invalid QR Code format.";
                    result.className = "error fade-in";
                }
            }
            if (err && !(err instanceof ZXing.NotFoundException)) {
                console.error("QR Code scanning error:", err);
            }
        })
        .then(() => {
            scanning = true;
            toggleScanButton.textContent = "Stop Scanning";
        })
        .catch((err) => {
            console.error("Error initializing QR code scanning:", err);
            result.textContent = "Unable to initialize QR scanning.";
            result.className = "error fade-in";
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
                facingMode: { ideal: "environment" },
                width: { ideal: 1280 },
                height: { ideal: 720 },
            },
        })
        .then(function (stream) {
            video.srcObject = stream;
            video.setAttribute("playsinline", true);
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

