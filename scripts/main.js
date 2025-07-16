console.log('Do Androids Train? Ready to roll!');

// Simple navigation highlight for demonstration
function init() {

    const links = document.querySelectorAll('nav a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    const locEl = document.getElementById('location-data');
    if (locEl) {
        const FALLBACK_COORDS = { lat: 37.7749, lon: -122.4194 }; // San Francisco
        function applyFallback(message) {
            locEl.textContent = message;
            if (typeof window.updateMapOverlay === 'function') {
                window.updateMapOverlay(FALLBACK_COORDS.lat, FALLBACK_COORDS.lon);
            }
        }

        if ('geolocation' in navigator) {
            navigator.geolocation.watchPosition(
                pos => {
                    const latNum = pos.coords.latitude;
                    const lonNum = pos.coords.longitude;
                    locEl.textContent = `LAT: ${latNum.toFixed(5)}\u00B0, LON: ${lonNum.toFixed(5)}\u00B0`;
                    if (typeof window.updateMapOverlay === 'function') {
                        window.updateMapOverlay(latNum, lonNum);
                    }
                },
                err => {
                    console.error('Geolocation error:', err);
                    applyFallback('LOCATION UNAVAILABLE.');
                },
                { enableHighAccuracy: true }
            );
        } else {
            applyFallback('GEOLOCATION UNSUPPORTED.');
        }
    }
}

if (document.readyState !== 'loading') {
    init();
} else {
    document.addEventListener('DOMContentLoaded', init);
}

