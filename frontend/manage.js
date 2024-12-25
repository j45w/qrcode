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

        if (response.ok) {
            result.textContent = `Success! ${data.message}`;
            result.style.color = "green"; // Display success in green
            result.className = "success fade-in";
        } else {
            result.textContent = data.error || "Validation failed";
            result.style.color = "red"; // Display errors in red
            result.className = "error fade-in";
        }
    } catch (err) {
        result.textContent = "Failed to connect to the server.";
        result.style.color = "red";
        result.className = "error fade-in";
    }
}

// Start camera and scanning
async function startScanning() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        result.textContent = "Camera not supported on this device.";
        result.style.color = "red";
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "environment", // Rear camera
            },
        });

        video.srcObject = stream;
        video.setAttribute("playsinline", true); // For mobile devices
        video.play();

        codeReader = new ZXing.BrowserQRCodeReader();
        codeReader.decodeFromVideoDevice(null, video, (result, err) => {
            if (result) {
                const scannedData = result.text;
                try {
                    const parsedData = JSON.parse(scannedData);
                    validateAndDeleteQRCode(parsedData.uniqueId);
                } catch (error) {
                    result.textContent = "Invalid QR Code format.";
                    result.style.color = "red";
                }
            }
            if (err && !(err instanceof ZXing.NotFoundException)) {
                console.error("QR Code scanning error:", err);
            }
        });

        scanning = true;
        toggleScanButton.textContent = "Stop Scanning";
    } catch (err) {
        console.error("Error accessing camera:", err);
        result.textContent = "Unable to access camera. Please check your permissions.";
        result.style.color = "red";
    }
}

// Stop scanning and reset the camera
function stopScanning() {
    if (codeReader) {
        codeReader.reset();
        scanning = false;
        toggleScanButton.textContent = "Start Scanning";
    }

    if (video.srcObject) {
        video.srcObject.getTracks().forEach((track) => track.stop());
    }
}

// Toggle scanning on button click
toggleScanButton.addEventListener("click", () => {
    if (scanning) {
        stopScanning();
    } else {
        startScanning();
    }
});

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
            startScanning();
        } else {
            scanContainer.classList.add("hidden");
            idContainer.classList.remove("hidden");
            stopScanning();
        }

        result.textContent = "";
    });
});

// Automatically start the camera on the Scan tab
startScanning();
