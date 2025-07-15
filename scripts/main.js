console.log('Do Androids Train? Ready to roll!');

// Simple navigation highlight for demonstration
document.addEventListener('DOMContentLoaded', () => {

    fetch('version')
        .then(r => r.text())
        .then(v => {
            const digits = v.trim().padStart(3, '0');
            const formatted = `v${digits[0]}.${digits[1]}.${digits[2]}`;
            const headingEl = document.getElementById('app-heading');
            if (headingEl) {
                headingEl.textContent += ' ' + formatted;
            }
        })
        .catch(err => console.error('Version load failed', err));

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
                    const latNum = pos.coords.latitude;
                    const lonNum = pos.coords.longitude;
                    locEl.textContent = `LAT: ${latNum.toFixed(5)}\u00B0, LON: ${lonNum.toFixed(5)}\u00B0`;
                    if (typeof window.updateMapOverlay === 'function') {
                        window.updateMapOverlay(latNum, lonNum);
                    }
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

