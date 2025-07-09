console.log('Do Androids Train? Ready to roll!');

// Simple navigation highlight for demonstration
const links = document.querySelectorAll('nav a');
links.forEach(link => {
    link.addEventListener('click', () => {
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

