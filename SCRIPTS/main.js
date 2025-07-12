console.log('Do Androids Train? Ready to roll!');

// Simple navigation highlight for demonstration
document.addEventListener('DOMContentLoaded', () => {
    // Insert current time (HH:MM) into the H1 heading if present
    const tsEl = document.getElementById('timestamp');
    if (tsEl) {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        tsEl.textContent = `${hh}:${mm}`;
    }

    const links = document.querySelectorAll('nav a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
});

