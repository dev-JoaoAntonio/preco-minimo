document.addEventListener("DOMContentLoaded", () => {
  const cartItemsContainer = document.querySelector('.cart-items-section');
  const cartSubtotalEl = document.getElementById('cartSubtotal');
  const cartTotalEl = document.getElementById('cartTotal');
  const sendOrderBtn = document.getElementById('sendOrderBtn');
  
  const couponInput = document.getElementById('couponCode');
  const applyCouponBtn = document.getElementById('applyCouponBtn');
  const couponMessage = document.getElementById('couponMessage');
  const discountLine = document.getElementById('discountLine');
  const discountLabel = document.getElementById('discountLabel');
  const discountAmountEl = document.getElementById('discountAmount');

  let cart = JSON.parse(localStorage.getItem('precoMinimoCart')) || [];
  let appliedCoupon = null;

  const validCouponsDB = {
    'BEMVINDO10': { type: 'percent', value: 10, minPurchase: 50 },
    'QUERO20': { type: 'fixed', value: 20, minPurchase: 100 }
  };

  const formatPrice = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  function renderCart() {
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom: 1rem; opacity: 0.5;">
            <circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
          </svg>
          <h3>Seu carrinho está vazio</h3>
          <p>Adicione produtos para solicitar uma entrega.</p>
        </div>
      `;
      updateTotals();
      return;
    }

    cartItemsContainer.innerHTML = cart.map((item, index) => `
      <div class="cart-item" data-index="${index}">
        <div class="item-image"><img src="${item.image}" alt="${item.name}"></div>
        <div class="item-details">
          <span class="brand">${item.brand}</span>
          <h3 class="item-name">${item.name}</h3>
          <div class="item-price">${formatPrice(item.price)}</div>
        </div>
        <div class="item-actions">
          <div class="quantity-control">
            <button class="qtd-btn minus" aria-label="Diminuir">−</button>
            <input type="number" value="${item.quantity}" readonly>
            <button class="qtd-btn plus" aria-label="Aumentar">+</button>
          </div>
          <button class="remove-btn" aria-label="Remover">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
            <span>Remover</span>
          </button>
        </div>
      </div>
    `).join('');

    updateTotals();
    attachEventListeners();
  }

  function updateTotals() {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    let discount = 0;
    let finalTotal = subtotal;

    if (appliedCoupon) {
      if (subtotal >= appliedCoupon.rule.minPurchase) {
        if (appliedCoupon.rule.type === 'percent') {
          discount = subtotal * (appliedCoupon.rule.value / 100);
        } else if (appliedCoupon.rule.type === 'fixed') {
          discount = appliedCoupon.rule.value;
        }
        
        if (discount > subtotal) discount = subtotal;
        finalTotal = subtotal - discount;

        discountLine.style.display = 'flex';
        discountLabel.textContent = `Cupom (${appliedCoupon.code})`;
        discountAmountEl.textContent = `- ${formatPrice(discount)}`;
      } else {
        appliedCoupon = null;
        couponInput.value = '';
        couponMessage.style.color = 'var(--brand-red)';
        couponMessage.textContent = 'Cupom removido (valor mínimo não atingido).';
        discountLine.style.display = 'none';
      }
    } else {
      discountLine.style.display = 'none';
    }

    cartSubtotalEl.textContent = formatPrice(subtotal);
    cartTotalEl.textContent = formatPrice(finalTotal);
    
    sendOrderBtn.disabled = cart.length === 0;
    sendOrderBtn.style.opacity = cart.length === 0 ? '0.5' : '1';
  }

  applyCouponBtn.addEventListener('click', () => {
    const code = couponInput.value.trim().toUpperCase();
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    if (!code) return;

    const couponData = validCouponsDB[code];

    if (couponData) {
      if (subtotal >= couponData.minPurchase) {
        appliedCoupon = { code: code, rule: couponData };
        couponMessage.style.color = '#10b981';
        couponMessage.textContent = 'Cupom aplicado com sucesso!';
        updateTotals();
      } else {
        appliedCoupon = null;
        couponMessage.style.color = 'var(--brand-red)';
        couponMessage.textContent = `Este cupom exige compra mínima de ${formatPrice(couponData.minPurchase)}.`;
        updateTotals();
      }
    } else {
      appliedCoupon = null;
      couponMessage.style.color = 'var(--brand-red)';
      couponMessage.textContent = 'Cupom inválido ou expirado.';
      updateTotals();
    }
  });

  function updateCartState() {
    localStorage.setItem('precoMinimoCart', JSON.stringify(cart));
    renderCart();
    window.dispatchEvent(new Event('cartUpdated')); 
  }

  function attachEventListeners() {
    document.querySelectorAll('.cart-item').forEach(itemEl => {
      const index = itemEl.getAttribute('data-index');
      itemEl.querySelector('.plus').addEventListener('click', () => { cart[index].quantity += 1; updateCartState(); });
      itemEl.querySelector('.minus').addEventListener('click', () => { if (cart[index].quantity > 1) { cart[index].quantity -= 1; updateCartState(); }});
      itemEl.querySelector('.remove-btn').addEventListener('click', () => { cart.splice(index, 1); updateCartState(); });
    });
  }

  sendOrderBtn.addEventListener('click', () => {
    const name = document.getElementById('leadName').value.trim();
    const phone = document.getElementById('leadPhone').value.trim();
    const address = document.getElementById('leadAddress').value.trim();

    if (!name || !phone || !address) {
      alert("Por favor, preencha todos os dados de entrega.");
      return;
    }

    const securePayload = {
      orderId: 'PED-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      createdAt: new Date().toISOString(),
      customer: { name, phone, address },
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity
      })),
      status: 'pending_validation'
    };

    let adminOrders = JSON.parse(localStorage.getItem('precoMinimoOrders')) || [];
    adminOrders.push(securePayload);
    localStorage.setItem('precoMinimoOrders', JSON.stringify(adminOrders));

    const originalText = sendOrderBtn.innerHTML;
    sendOrderBtn.innerHTML = `✓ Pedido Enviado!`;
    sendOrderBtn.style.backgroundColor = '#10b981';

    setTimeout(() => {
      cart = [];
      updateCartState();
      window.location.href = '/';
    }, 2000);
  });

  renderCart();
});