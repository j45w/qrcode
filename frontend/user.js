// Helper to generate QR code
function generateQRCode(data) {
    const qrcodeContainer = document.getElementById("qrcode");
    qrcodeContainer.innerHTML = '';
    new QRCode(qrcodeContainer, {
        text: data,
        width: 128,
        height: 128
    });
}

// Create QR Code
document.getElementById("createForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const name = document.getElementById("name").value;

    try {
        // Call backend API to create user
        const response = await fetch("https://qrcode-n318.onrender.com/api/users/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        });

        const data = await response.json();

        if (response.ok) {
            // Generate QR code with data from the server
            generateQRCode(data.qrCodeData);
            document.getElementById("result").innerHTML = `<p>Your Unique ID: ${data.uniqueId}</p>`;
        } else {
            document.getElementById("result").innerHTML = `<p>Error: ${data.error}</p>`;
        }
    } catch (err) {
        document.getElementById("result").innerHTML = `<p>Failed to connect to the server.</p>`;
    }
});

// Retrieve QR Code
document.getElementById("retrieveForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const uniqueId = document.getElementById("id").value;

    try {
        // Call backend API to retrieve user data by unique ID
        const response = await fetch("https://qrcode-n318.onrender.com/api/users/retrieve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uniqueId }),
        });

        const data = await response.json();

        if (response.ok) {
            // Generate QR code with data from the server
            generateQRCode(data.qrCodeData);
            document.getElementById("result").innerHTML = `<p>QR Code retrieved successfully!</p>`;
        } else {
            document.getElementById("result").innerHTML = `<p>${data.error}, Create one</p>`;
        }
    } catch (err) {
        document.getElementById("result").innerHTML = `<p>Failed to connect to the server.</p>`;
    }
});

// Tab switching functionality
const tabs = document.querySelectorAll(".tab");
const forms = document.querySelectorAll("form");

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        forms.forEach(form => form.classList.add("hidden"));
        document.getElementById(`${tab.dataset.tab}Form`).classList.remove("hidden");

        document.getElementById("result").innerHTML = '';
        document.getElementById("qrcode").innerHTML = '';
    });
});
