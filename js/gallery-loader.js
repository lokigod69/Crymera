function loadImages(container, images) {
    if (!container) return;

    container.innerHTML = ''; // Clear existing content

    images.forEach(imgData => {
        const link = document.createElement('a');
        link.href = '#';
        link.className = 'artwork-card';

        // Add flip functionality if needed, or just basic structure
        // For now, matching the basic structure of other galleries

        const imgContainer = document.createElement('div');
        imgContainer.className = 'artwork-image-container';

        const img = document.createElement('img');
        img.src = imgData.src;
        img.alt = imgData.title || 'Gallery Image';

        imgContainer.appendChild(img);
        link.appendChild(imgContainer);
        container.appendChild(link);
    });
}