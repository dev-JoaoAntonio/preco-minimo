document.addEventListener("DOMContentLoaded", () => {

    const lenis = new Lenis({
        duration: 3,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach((element) => {
        observer.observe(element);
    });

});

const btnOpenChat = document.querySelector('.fab-ai');
const chatDrawer = document.getElementById('chatDrawer');
const chatOverlay = document.getElementById('chatOverlay');
const btnCloseChat = document.getElementById('closeChatBtn');

function toggleChat() {
    const isOpen = chatDrawer.classList.contains('open');

    if (!isOpen) {
        chatDrawer.classList.add('open');
        chatOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        if (typeof lenis !== 'undefined') lenis.stop();
    } else {
        chatDrawer.classList.remove('open');
        chatOverlay.classList.remove('open');
        document.body.style.overflow = '';
        if (typeof lenis !== 'undefined') lenis.start();
    }
}

if (btnOpenChat) {
    btnOpenChat.addEventListener('click', toggleChat);
    btnCloseChat.addEventListener('click', toggleChat);
    chatOverlay.addEventListener('click', toggleChat);
}