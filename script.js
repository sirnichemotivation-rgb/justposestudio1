const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('event');
const cloudName = "dntrwkexp"; 

const gallery = document.getElementById('gallery');
const modal = document.getElementById('photoModal');
const modalContent = document.getElementById('modalContent'); // Siguraduhin na may div ka na ganito sa loob ng modal

// 1. LOAD MAIN GALLERY (PRINTS ONLY)
if (eventId) {
    fetch(`https://res.cloudinary.com/${cloudName}/image/list/${eventId}.json`)
        .then(response => response.json())
        .then(data => {
            gallery.innerHTML = ""; 
            // Sort by latest
            data.resources.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            data.resources.forEach(img => {
                // Kunin ang Session ID mula sa public_id (Format natin ay: SESS_123456_Print)
                const sessId = img.public_id.split('_').slice(0, 2).join('_');
                
                const thumbUrl = `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto,w_500/${img.public_id}.${img.format}`;
                
                const wrapper = document.createElement('div');
                wrapper.className = "img-card";
                // DITO ANG MAGIC: Pag click, load session folder
                wrapper.onclick = () => openSessionFolder(sessId);
                wrapper.innerHTML = `
                    <img src="${thumbUrl}" alt="Photo">
                    <div style="font-size:10px; color:#555; text-align:center; padding:5px;">TAP TO VIEW FOLDER</div>
                `;
                gallery.appendChild(wrapper);
            });
        })
        .catch(err => {
            gallery.innerHTML = `<div class="msg">No photos found. Start posing!</div>`;
        });
}

// 2. OPEN SESSION FOLDER (LALABAS ANG PRINT + SINGLES)
function openSessionFolder(sessId) {
    modal.style.display = "flex";
    // Clear previous content and show loading
    modalContent.innerHTML = "<p style='color:white; text-align:center;'>Opening Folder...</p>";

    // FETCH lahat ng images na may tag ng Session ID
    fetch(`https://res.cloudinary.com/${cloudName}/image/list/${sessId}.json`)
        .then(res => res.json())
        .then(data => {
            modalContent.innerHTML = ""; // Clear loading
            
            // Sort para mauna lagi ang Print (na may "1_Print" public id)
            data.resources.sort((a, b) => a.public_id.localeCompare(b.public_id));

            data.resources.forEach(img => {
                const fullUrl = `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto/${img.public_id}.${img.format}`;
                const downloadUrl = `https://res.cloudinary.com/${cloudName}/image/upload/fl_attachment/${img.public_id}.${img.format}`;
                
                const imgContainer = document.createElement('div');
                imgContainer.style.marginBottom = "20px";
                imgContainer.innerHTML = `
                    <img src="${fullUrl}" style="width:100%; border-radius:10px; margin-bottom:10px;">
                    <a href="${downloadUrl}" class="download-btn" style="display:block; text-align:center; background:#fff; color:#000; padding:10px; border-radius:5px; text-decoration:none; font-weight:bold;">DOWNLOAD THIS PHOTO</a>
                    <hr style="border:0; border-top:1px solid #333; margin-top:15px;">
                `;
                modalContent.appendChild(imgContainer);
            });
        })
        .catch(err => {
            modalContent.innerHTML = "<p style='color:red;'>Failed to load session shots.</p>";
        });
}

function closeModal() {
    modal.style.display = "none";
}
