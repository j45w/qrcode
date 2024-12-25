const video = document.getElementById("qr-video");
const canvas = document.createElement("canvas");
const result = document.getElementById("result");
const idForm = document.getElementById("id-form");
const idInput = document.getElementById("id-input");
const tabs = document.querySelectorAll(".tab");
const scanContainer = document.getElementById("scan-container");
const idContainer = document.getElementById("id-container");

let stream;
let qrCodeCaptured = null;

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

// Function to start the camera
async function startCamera() {
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
        result.textContent = "Camera started. Click 'Take Screenshot' to scan QR.";
        result.style.color = "blue";
    } catch (err) {
        console.error("Error accessing camera:", err);
        result.textContent = "Unable to access camera. Please check your permissions.";
        result.style.color = "red";
    }
}

// Function to stop the camera
function stopCamera() {
    if (stream) {
        stream.getTracks().forEach((track) => track.stop());
    }
    video.srcObject = null;
}

// Function to capture the QR code (screenshot)
function captureQRCode() {
    if (!video.srcObject) {
        result.textContent = "Camera is not active. Please start the camera.";
        result.style.color = "red";
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Store the captured QR code
    qrCodeCaptured = canvas;
    result.textContent = "Screenshot taken. Click 'Check QR' to validate.";
    result.style.color = "blue";
}

// Function to scan and validate the captured QR code
async function checkQRCode() {
    if (!qrCodeCaptured) {
        result.textContent = "No screenshot available. Please take a screenshot first.";
        result.style.color = "red";
        return;
    }

    const context = qrCodeCaptured.getContext("2d");
    const imageData = context.getImageData(0, 0, qrCodeCaptured.width, qrCodeCaptured.height);

    try {
        const codeReader = new ZXing.BrowserQRCodeReader();
        const resultData = await codeReader.decodeFromImageData(imageData);

        if (resultData) {
            const scannedData = resultData.text;
            try {
                const parsedData = JSON.parse(scannedData);
                validateAndDeleteQRCode(parsedData.uniqueId);
            } catch (error) {
                result.textContent = "Invalid QR Code format.";
                result.style.color = "red";
            }
        }
    } catch (err) {
        console.error("Error scanning QR code:", err);
        result.textContent = "No QR code detected.";
        result.style.color = "red";
    }
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

// Event listener for capturing the QR code
document.getElementById("capture-scan").addEventListener("click", captureQRCode);

// Event listener for checking the QR code
document.getElementById("check-qr").addEventListener("click", checkQRCode);

// Handle tab switching
tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        if (tab.dataset.tab === "scan") {
            scanContainer.classList.remove("hidden");
            idContainer.classList.add("hidden");
            startCamera();
        } else {
            scanContainer.classList.add("hidden");
            idContainer.classList.remove("hidden");
            stopCamera();
        }

        result.textContent = "";
    });
});
