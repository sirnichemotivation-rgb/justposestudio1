const CONFIG = {
    cloudName: "dntrwkexp",
    thumbQuality: "q_auto,f_auto,w_500",
    fullQuality: "q_auto,f_auto"
};

const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('event');
const gallery = document.getElementById('gallery');
const modal = document.getElementById('photoModal');
const modalContent = document.getElementById('modalContent');

// 1. LOAD MAIN PRINTS
if (eventId) {
    fetch(`https://res.cloudinary.com/${CONFIG.cloudName}/image/list/${eventId}.json`)
        .then(res => res.json())
        .then(data => {
            gallery.innerHTML = "";
            // Ipakita lang ang mga may "1_Print" sa wall
            const mainPrints = data.resources.filter(img => img.public_id.includes('1_Print'));
            mainPrints.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            mainPrints.forEach(img => {
                const parts = img.public_id.split('/');
                const sessId = parts[parts.length - 2]; 
                const thumbUrl = `https://res.cloudinary.com/${CONFIG.cloudName}/image/upload/${CONFIG.thumbQuality}/${img.public_id}.${img.format}`;
                
                const card = document.createElement('div');
                card.className = "img-card";
                card.onclick = () => openFolder(sessId);
                card.innerHTML = `<img src="${thumbUrl}">`;
                gallery.appendChild(card);
            });
        })
        .catch(() => {
            gallery.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #666;">No photos yet.</p>`;
        });
}

// 2. OPEN FOLDER (5 Images Limit + Smooth Sort)
async function openFolder(sessId) {
    modal.style.display = "flex";
    modalContent.innerHTML = "<div style='color:white; width:100%; text-align:center;'>Loading...</div>";

    try {
        const response = await fetch(`https://res.cloudinary.com/${CONFIG.cloudName}/image/list/${sessId}.json`);
        const data = await response.json();
        modalContent.innerHTML = ""; 

        // FILTER: Kuhanin lang ang 1_Print at 4 individual Shots
        let cleanFiles = data.resources.filter(img => 
            img.public_id.includes('1_Print') || img.public_id.includes('Shot_')
        );

        // SORT: 1_Print muna, tapos Shot_1, Shot_2...
        cleanFiles.sort((a, b) => a.public_id.localeCompare(b.public_id));

        // LIMIT: 5 images lang talaga
        cleanFiles.slice(0, 5).forEach(img => {
            const imgUrl = `https://res.cloudinary.com/${CONFIG.cloudName}/image/upload/${CONFIG.fullQuality}/${img.public_id}.${img.format}`;
            const downloadUrl = `https://res.cloudinary.com/${CONFIG.cloudName}/image/upload/fl_attachment/${img.public_id}.${img.format}`;
            
            const div = document.createElement('div');
            div.className = "folder-item";
            div.innerHTML = `
                <a href="${downloadUrl}" class="mini-download-btn">↓</a>
                <img src="${imgUrl}">
            `;
            modalContent.appendChild(div);
        });
    } catch (err) {
        modalContent.innerHTML = "<div style='color:red;'>Error.</div>";
    }
}

function closeModal() { modal.style.display = "none"; }
