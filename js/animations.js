export function initAnimations() {
    // Orchestrated Reveals
    const observerOptions = {
        root: null,
        rootMargin: '-50px 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal-up');
    revealElements.forEach(el => observer.observe(el));

    // Dashboard Data Simulation
    const revenueEl = document.getElementById('revenue-amount');
    if (revenueEl) {
        let currentRev = 142390;
        setInterval(() => {
            const increase = Math.floor(Math.random() * 85);
            currentRev += increase;
            
            const formatted = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(currentRev);
            
            revenueEl.textContent = formatted;
        }, 2500);
    }
}
