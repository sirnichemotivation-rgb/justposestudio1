const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('event');
const sessionId = urlParams.get('id');

const cloudName = "dntrwkexp"; // Cloudinary name mo
let searchTag = eventId || sessionId;

const gallery = document.getElementById('gallery');

if (searchTag) {
    // Kinukuha ang listahan ng images na may tag ng Event o Session
    fetch(`https://res.cloudinary.com/${cloudName}/image/list/${searchTag}.json`)
        .then(response => {
            if (!response.ok) throw new Error("No photos yet.");
            return response.json();
        })
        .then(data => {
            gallery.innerHTML = ""; // Alisin ang "Loading..."
            
            // Ayusin ang pagkakasunod-sunod (Latest first)
            data.resources.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            data.resources.forEach(img => {
                const imgUrl = `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto/${img.public_id}.${img.format}`;
                
                const wrapper = document.createElement('div');
                wrapper.className = "img-wrapper";
                
                const imgTag = document.createElement('img');
                imgTag.src = imgUrl;
                imgTag.loading = "lazy"; // Para mabilis mag-load
                
                wrapper.appendChild(imgTag);
                gallery.appendChild(wrapper);
            });
        })
        .catch(err => {
            gallery.innerHTML = `<p style="color:white; text-align:center;">No photos found for ${searchTag}. Start posing!</p>`;
        });
} else {
    gallery.innerHTML = `<p style="color:white; text-align:center;">Justpose: Scan your QR code to see the gallery.</p>`;
}
