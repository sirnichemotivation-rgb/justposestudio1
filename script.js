// ==========================================
// CONFIGURATION - MADALI I-ADJUST DITO
// ==========================================
const CONFIG = {
    cloudName: "dntrwkexp",
    galleryTitle: "JUSTPOSE GALLERY", // Pangalan sa itaas
    titleSize: "45px",               // Laki ng Justpose Gallery text
    titleSpacing: "20px",            // Spacing mula sa itaas
    thumbWidth: "500",               // Laki ng thumbnail sa main page
    folderGridCols: "1",             // Ilang column ang singles sa loob ng folder
};

// ==========================================
// CORE LOGIC
// ==========================================
const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('event');

const gallery = document.getElementById('gallery');
const modal = document.getElementById('photoModal');
const modalContent = document.getElementById('modalContent');

// I-apply ang Configuration sa UI
document.querySelector('h1').innerText = CONFIG.galleryTitle;
document.querySelector('h1').style.fontSize = CONFIG.titleSize;
document.querySelector('h1').style.marginTop = CONFIG.titleSpacing;

if (eventId) {
    loadMainGallery();
} else {
    gallery.innerHTML = `<div class="msg">JUSTPOSE: Scan your QR code.</div>`;
}

// 1. LOAD PRINTS (Main Page)
async function loadMainGallery() {
    try {
        const response = await fetch(`https://res.cloudinary.com/${CONFIG.cloudName}/image/list/${eventId}.json`);
        const data = await response.json();
        gallery.innerHTML = ""; 

        // Latest photos sa itaas
        data.resources.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        data.resources.forEach(img => {
            // Kunin ang Session ID (Public ID format: Events/EventID/SESS_ID/1_Print)
            // Hahatiin natin ang path para makuha ang SESS_ID
            const pathParts = img.public_id.split('/');
            const sessId = pathParts[pathParts.length - 2]; 

            const thumbUrl = `https://res.cloudinary.com/${CONFIG.cloudName}/image/upload/q_auto,f_auto,w_${CONFIG.thumbWidth}/${img.public_id}.${img.format}`;
            
            const wrapper = document.createElement('div');
            wrapper.className = "img-card";
            wrapper.onclick = () => openFolder(sessId);
            wrapper.innerHTML = `
                <img src="${thumbUrl}" alt="Print">
                <div style="font-size:12px; color:#666; padding:10px; text-align:center;">OPEN SESSION FOLDER</div>
            `;
            gallery.appendChild(wrapper);
        });
    } catch (err) {
        gallery.innerHTML = `<div class="msg">No photos found for ${eventId}.</div>`;
    }
}

// 2. OPEN FOLDER (Dito lalabas ang Singles + Print)
async function openFolder(sessId) {
    modal.style.display = "flex";
    modalContent.innerHTML = "<p style='color:white; text-align:center; padding:50px;'>Loading Photos...</p>";

    try {
        // Hahanapin lahat ng images na may tag ng Session ID
        const response = await fetch(`https://res.cloudinary.com/${CONFIG.cloudName}/image/list/${sessId}.json`);
        const data = await response.json();
        modalContent.innerHTML = ""; 

        // Sort: 1_Print muna, tapos Shot_0, Shot_1...
        data.resources.sort((a, b) => a.public_id.localeCompare(b.public_id));

        data.resources.forEach(img => {
            const fullUrl = `https://res.cloudinary.com/${CONFIG.cloudName}/image/upload/q_auto,f_auto/${img.public_id}.${img.format}`;
            const downloadUrl = `https://res.cloudinary.com/${CONFIG.cloudName}/image/upload/fl_attachment/${img.public_id}.${img.format}`;
            
            const imgContainer = document.createElement('div');
            imgContainer.style.marginBottom = "30px";
            imgContainer.innerHTML = `
                <img src="${fullUrl}" style="width:100%; border-radius:12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <a href="${downloadUrl}" style="display:block; margin-top:10px; background:#fff; color:#000; text-align:center; padding:15px; border-radius:8px; text-decoration:none; font-weight:bold; font-size:14px;">DOWNLOAD PHOTO</a>
            `;
            modalContent.appendChild(imgContainer);
        });
    } catch (err) {
        modalContent.innerHTML = "<p style='color:red; text-align:center;'>Folder is empty or error occurred.</p>";
    }
}

function closeModal() {
    modal.style.display = "none";
}
