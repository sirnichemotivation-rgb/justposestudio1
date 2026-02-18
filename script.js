const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('event');
const sessionId = urlParams.get('id');

const cloudName = "dntrwkexp"; 
let searchTag = eventId || sessionId;

const gallery = document.getElementById('gallery');

if (searchTag) {
    // Kunin ang listahan ng images
    fetch(`https://res.cloudinary.com/${cloudName}/image/list/${searchTag}.json`)
        .then(response => {
            if (!response.ok) throw new Error("No photos found.");
            return response.json();
        })
        .then(data => {
            gallery.innerHTML = ""; 
            
            // Ayusin: Latest photos sa itaas
            data.resources.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            data.resources.forEach(img => {
                // Optimized image URL para sa gallery view
                const thumbUrl = `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto,w_500/${img.public_id}.${img.format}`;
                
                // Full quality URL para sa download
                const downloadUrl = `https://res.cloudinary.com/${cloudName}/image/upload/fl_attachment/${img.public_id}.${img.format}`;
                
                const wrapper = document.createElement('div');
                wrapper.className = "img-card";
                
                wrapper.innerHTML = `
                    <img src="${thumbUrl}" alt="Photo">
                    <a href="${downloadUrl}" class="download-btn">DOWNLOAD</a>
                `;
                
                gallery.appendChild(wrapper);
            });
        })
        .catch(err => {
            gallery.innerHTML = `<div class="msg">No photos found for <b>${searchTag}</b>. Start posing!</div>`;
        });
} else {
    gallery.innerHTML = `<div class="msg">JUSTPOSE: Scan your QR code to see the gallery.</div>`;
}
