const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('event');
const sessionId = urlParams.get('id');

const cloudName = "dntrwkexp"; 
let searchTag = eventId || sessionId;

const gallery = document.getElementById('gallery');
const modal = document.getElementById('photoModal');
const modalImg = document.getElementById('modalImg');
const downloadLink = document.getElementById('downloadLink');

// Function para buksan ang picture
function openPhoto(fullUrl, downloadUrl) {
    modalImg.src = fullUrl;
    downloadLink.href = downloadUrl;
    modal.style.display = "flex";
}

// Function para isara ang modal
function closeModal() {
    modal.style.display = "none";
}

if (searchTag) {
    fetch(`https://res.cloudinary.com/${cloudName}/image/list/${searchTag}.json`)
        .then(response => {
            if (!response.ok) throw new Error("No photos found.");
            return response.json();
        })
        .then(data => {
            gallery.innerHTML = ""; 
            
            data.resources.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            data.resources.forEach(img => {
                const thumbUrl = `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto,w_500/${img.public_id}.${img.format}`;
                const fullViewUrl = `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto/${img.public_id}.${img.format}`;
                const downloadUrl = `https://res.cloudinary.com/${cloudName}/image/upload/fl_attachment/${img.public_id}.${img.format}`;
                
                const wrapper = document.createElement('div');
                wrapper.className = "img-card";
                
                // Onclick event para lumaki ang photo
                wrapper.onclick = () => openPhoto(fullViewUrl, downloadUrl);

                wrapper.innerHTML = `<img src="${thumbUrl}" alt="Photo">`;
                
                gallery.appendChild(wrapper);
            });
        })
        .catch(err => {
            gallery.innerHTML = `<div class="msg">No photos found for <b>${searchTag}</b>. Start posing!</div>`;
        });
} else {
    gallery.innerHTML = `<div class="msg">JUSTPOSE: Scan your QR code to see the gallery.</div>`;
}
