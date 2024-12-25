const video = document.getElementById("qr-video");
const result = document.getElementById("result");
const idForm = document.getElementById("id-form");
const idInput = document.getElementById("id-input");
const startScanButton = document.getElementById("start-scan");
const stopScanButton = document.getElementById("stop-scan");
const checkQRButton = document.getElementById("check-qr");
const tabs = document.querySelectorAll(".tab");
const scanContainer = document.getElementById("scan-container");
const idContainer = document.getElementById("id-container");

let stream;
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

        if (response.ok) {
            result.textContent = `Success! ${data.message}`;
            result.style.color = "green";
        } else {
            result.textContent = data.error || "Validation failed";
            result.style.color = "red";
        }
    } catch (err) {
        result.textContent = "Failed to connect to the server.";
        result.style.color = "red";
    }
}

// Function to start live QR code scanning
async function startScanning() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        result.textContent = "Camera not supported on this device.";
        result.style.color = "red";
        return;
    }

    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: "environment" } },
        });

        video.srcObject = stream;
        video.setAttribute("playsinline", true);
        video.play();

        result.textContent = "Scanning... Point the camera at a QR code.";
        result.style.color = "blue";

        codeReader = new ZXing.BrowserQRCodeReader();
        codeReader.decodeFromVideoDevice(null, video, async (scanResult, error) => {
            if (scanResult) {
                const scannedData = scanResult.text;
                try {
                    const parsedData = JSON.parse(scannedData);
                    validateAndDeleteQRCode(parsedData.uniqueId);
                } catch (err) {
                    result.textContent = "Invalid QR Code format.";
                    result.style.color = "red";
                }
            }
            if (error && !(error instanceof ZXing.NotFoundException)) {
                console.error("QR Code scanning error:", error);
            }
        });

        startScanButton.classList.add("hidden");
        stopScanButton.classList.remove("hidden");
        checkQRButton.classList.remove("hidden");
    } catch (err) {
        console.error("Error accessing camera:", err);
        result.textContent = "Unable to access camera. Please check your permissions.";
        result.style.color = "red";
    }
}

// Function to stop scanning
function stopScanning() {
    if (stream) {
        stream.getTracks().forEach((track) => track.stop());
    }
    video.srcObject = null;

    if (codeReader) {
        codeReader.reset();
    }

    result.textContent = "Camera stopped.";
    result.style.color = "blue";

    startScanButton.classList.remove("hidden");
    stopScanButton.classList.add("hidden");
    checkQRButton.classList.add("hidden");
}

// Event listener for starting the scan
startScanButton.addEventListener("click", startScanning);

// Event listener for stopping the scan
stopScanButton.addEventListener("click", stopScanning);

// Validate manually entered ID
idForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = idInput.value.trim();
    if (id) {
        await validateAndDeleteQRCode(id);
        idInput.value = "";
    }
});

// Handle tab switching
tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        if (tab.dataset.tab === "scan") {
            scanContainer.classList.remove("hidden");
            idContainer.classList.add("hidden");
        } else {
            scanContainer.classList.add("hidden");
            idContainer.classList.remove("hidden");
            stopScanning();
        }

        result.textContent = "";
    });
});
