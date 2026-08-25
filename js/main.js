// js/main.js
document.addEventListener('DOMContentLoaded', () => {
    
    // Intersection Observer for fade-up animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-up');
    fadeElements.forEach(el => observer.observe(el));

    // Dashboard Dynamic Numbers (Simulating live data)
    const revenueEl = document.getElementById('revenue-amount');
    if (revenueEl) {
        let currentRev = 142390;
        setInterval(() => {
            // Randomly increase revenue slightly
            const increase = Math.floor(Math.random() * 50);
            currentRev += increase;
            
            // Format to BRL
            const formatted = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(currentRev);
            
            revenueEl.textContent = formatted;
        }, 3000);
    }
});
