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

    const btnOpenChat = document.querySelector('.fab-ai');
    const chatDrawer = document.getElementById('chatDrawer');
    const chatOverlay = document.getElementById('chatOverlay');
    const btnCloseChat = document.getElementById('closeChatBtn');

    function toggleChat() {
        if (!chatDrawer || !chatOverlay) return; 

        const isOpen = chatDrawer.classList.contains('open');

        if (!isOpen) {
            chatDrawer.classList.add('open');
            chatOverlay.classList.add('open');
            document.body.style.overflow = 'hidden';
            lenis.stop();
        } else {
            chatDrawer.classList.remove('open');
            chatOverlay.classList.remove('open');
            document.body.style.overflow = '';
            lenis.start();
        }
    }

    if (btnOpenChat) {
        btnOpenChat.addEventListener('click', toggleChat);
        btnCloseChat.addEventListener('click', toggleChat);
        chatOverlay.addEventListener('click', toggleChat);
    }

    let cart = JSON.parse(localStorage.getItem('precoMinimoCart')) || [];

    function updateCartBadges() {
        const badges = document.querySelectorAll('.cart-badge');
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

        badges.forEach(badge => {
            badge.textContent = totalItems;
            badge.style.display = totalItems > 0 ? 'flex' : 'none';
        });
    }

    function addToCart(product) {
        const existingItemIndex = cart.findIndex(item => item.id === product.id);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        localStorage.setItem('precoMinimoCart', JSON.stringify(cart));
        updateCartBadges();
    }

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-add-cart');

        if (btn) {
            const card = btn.closest('.modern-product-card') || btn.closest('.product-card');

            if (card) {
                const name = card.querySelector('.product-name, h3').textContent;
                const brand = card.querySelector('.brand, .product-brand').textContent;
                const imgSrc = card.querySelector('img').src;

                const priceText = card.querySelector('.new-price, .product-price').textContent;
                const price = parseFloat(priceText.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());

                const oldPriceEl = card.querySelector('.old-price, .product-original-price');
                const oldPrice = oldPriceEl ? parseFloat(oldPriceEl.textContent.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()) : null;

                const id = name.toLowerCase().replace(/\s+/g, '-');

                addToCart({ id, name, brand, price, oldPrice, image: imgSrc });

                const originalContent = btn.innerHTML;
                btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Adicionado!`;
                btn.style.backgroundColor = '#10b981';
                btn.style.color = 'white';

                setTimeout(() => {
                    btn.innerHTML = originalContent;
                    btn.style.backgroundColor = '';
                    btn.style.color = '';
                }, 1500);
            }
        }
    });

    updateCartBadges();

    window.addEventListener('cartUpdated', updateCartBadges);
});