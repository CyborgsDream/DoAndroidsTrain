console.log('Do Androids Train? Ready to roll!');

// Simple navigation highlight for demonstration
document.addEventListener('DOMContentLoaded', () => {

    const links = document.querySelectorAll('nav a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    const locEl = document.getElementById('location-data');
    if (locEl) {
        if ('geolocation' in navigator) {
            navigator.geolocation.watchPosition(
                pos => {
                    const lat = pos.coords.latitude.toFixed(5);
                    const lon = pos.coords.longitude.toFixed(5);
                    locEl.textContent = `LAT: ${lat}\u00B0, LON: ${lon}\u00B0`;
                },
                err => {
                    console.error('Geolocation error:', err);
                    locEl.textContent = 'LOCATION UNAVAILABLE.';
                },
                { enableHighAccuracy: true }
            );
        } else {
            locEl.textContent = 'GEOLOCATION UNSUPPORTED.';
        }
    }
});

