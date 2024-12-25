const video = document.getElementById("qr-video");
const result = document.getElementById("result");
const idForm = document.getElementById("id-form");
const idInput = document.getElementById("id-input");
const tabs = document.querySelectorAll(".tab");
const scanContainer = document.getElementById("scan-container");
const idContainer = document.getElementById("id-container");
const toggleScanButton = document.getElementById("toggle-scan");

let qrScanner;

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

// Initialize QR Scanner
function initializeQRScanner() {
    qrScanner = new QrScanner(video, (scannedData) => {
        try {
            const parsedData = JSON.parse(scannedData);
            validateAndDeleteQRCode(parsedData.uniqueId);
        } catch (error) {
            result.textContent = "Invalid QR Code format.";
            result.style.color = "red";
        }
    });
}

// Start scanning
function startScanning() {
    if (!qrScanner) {
        initializeQRScanner();
    }
    qrScanner.start().then(() => {
        result.textContent = "Camera started. Scan a QR Code.";
        result.style.color = "blue";
    }).catch((error) => {
        console.error("Error starting scanner:", error);
        result.textContent = "Unable to access camera. Please check your permissions.";
        result.style.color = "red";
    });
}

// Stop scanning
function stopScanning() {
    if (qrScanner) {
        qrScanner.stop();
        result.textContent = "Scanner stopped.";
        result.style.color = "blue";
    }
}

// Handle tab switching
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

// Validate manually entered ID
idForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = idInput.value.trim();
    if (id) {
        await validateAndDeleteQRCode(id);
        idInput.value = "";
    }
});

// Event listener for toggling scanning
toggleScanButton.addEventListener("click", () => {
    if (toggleScanButton.textContent === "Start Scanning") {
        startScanning();
        toggleScanButton.textContent = "Stop Scanning";
    } else {
        stopScanning();
        toggleScanButton.textContent = "Start Scanning";
    }
});
