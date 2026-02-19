const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

// 1. Buksan ang Camera pagka-load ng page
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        console.error("Error accessing camera: ", err);
        alert("Hindi mahanap ang camera.");
    });

// 2. MAIN FUNCTION: Single Shot & Print
async function takeShotAndPrint() {
    // I-set ang canvas size sa laki ng video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Kunin ang image mula sa video feed
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // I-convert ang image sa Base64 format
    const imageData = canvas.toDataURL('image/jpeg');

    console.log("Capturing photo...");

    try {
        // Ipadala ang image sa Python Backend para i-process at i-print via Java
        const response = await fetch('http://localhost:5000/process_shot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageData })
        });

        const result = await response.json();
        if (result.status === "success") {
            alert("Photo Captured! Sending to Printer...");
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        console.error("Failed to connect to Python backend:", error);
        alert("Hindi makakonekta sa Python server.");
    }
}

// 3. SHARE FUNCTION
function sharePhoto() {
    const imageData = canvas.toDataURL('image/jpeg');
    
    // Check kung supported ng browser ang Web Share API
    if (navigator.share) {
        navigator.share({
            title: 'My Photobooth Photo',
            text: 'Check out my shot!',
            url: imageData // Note: Mas maganda kung URL ito mula sa server
        }).then(() => {
            console.log('Successful share');
        }).catch((error) => {
            console.log('Error sharing', error);
        });
    } else {
        alert("Share not supported on this browser. Use Download instead.");
    }
}

// 4. DOWNLOAD FUNCTION (Nasa baba na ito sa UI)
function downloadPhoto() {
    const link = document.createElement('a');
    link.download = 'photobooth_shot.jpg';
    link.href = canvas.toDataURL('image/jpeg');
    link.click();
}
