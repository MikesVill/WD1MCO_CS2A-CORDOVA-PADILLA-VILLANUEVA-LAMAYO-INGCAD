
(function () {
    const CART_KEY = 'movieflix_empire_cart_v1';

    const money = value =>
        '₱' + Number(value).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    function readCart() {
        try {
            return JSON.parse(localStorage.getItem(CART_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        renderCart();
    }

    function updateBadges(cart) {
        const count = cart.reduce((sum, item) => sum + item.qty, 0);

        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
        });
    }

    function renderCart() {
        const cart = readCart();

        updateBadges(cart);

        const host = document.getElementById('cartItems');
        const total = document.getElementById('cartTotal');
        const checkout = document.getElementById('checkoutBtn');

        if (!host) return;

        if (!cart.length) {
            host.innerHTML = '<p class="empty-cart">Your cart is empty. Add something from the collection above.</p>';
            total.textContent = money(0);
            checkout.disabled = true;
            return;
        }

        host.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-details">
                    <strong>${escapeHtml(item.name)}</strong>
                    <small>${money(item.price)} each</small>
                </div>

                <div class="cart-item-actions">
                    <div class="quantity-control" aria-label="Quantity controls for ${escapeHtml(item.name)}">

                        <button
                            type="button"
                            class="quantity-btn"
                            data-qty-change="-1"
                            data-id="${escapeHtml(item.id)}"
                            aria-label="Reduce ${escapeHtml(item.name)} quantity">
                            <i class="bi bi-dash-lg"></i>
                        </button>

                        <span class="quantity-value" aria-live="polite">
                            ${item.qty}
                        </span>

                        <button
                            type="button"
                            class="quantity-btn"
                            data-qty-change="1"
                            data-id="${escapeHtml(item.id)}"
                            aria-label="Increase ${escapeHtml(item.name)} quantity">
                            <i class="bi bi-plus-lg"></i>
                        </button>

                    </div>

                    <strong class="cart-line-total">
                        ${money(item.price * item.qty)}
                    </strong>

                    <button
                        type="button"
                        class="remove-item-btn"
                        aria-label="Remove ${escapeHtml(item.name)}"
                        data-remove="${escapeHtml(item.id)}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        total.textContent = money(
            cart.reduce((sum, item) => sum + item.price * item.qty, 0)
        );

        checkout.disabled = false;
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, ch => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[ch]));
    }

    function toast(message) {
        const old = document.querySelector('.toast-message');

        if (old) old.remove();

        const el = document.createElement('div');

        el.className = 'toast-message';
        el.textContent = message;

        document.body.appendChild(el);

        setTimeout(() => el.remove(), 2300);
    }

    document.addEventListener('click', event => {

        const add = event.target.closest('.btn-add');

        if (add) {
            const cart = readCart();
            const id = add.dataset.id;
            const found = cart.find(item => item.id === id);

            if (found) {
                found.qty += 1;
            } else {
                cart.push({
                    id,
                    name: add.dataset.name,
                    price: Number(add.dataset.price),
                    qty: 1
                });
            }

            saveCart(cart);
            toast(add.dataset.name + ' added to cart');

            return;
        }

        const quantityButton = event.target.closest('[data-qty-change]');

        if (quantityButton) {
            const cart = readCart();

            const item = cart.find(
                entry => entry.id === quantityButton.dataset.id
            );

            if (!item) return;

            item.qty += Number(quantityButton.dataset.qtyChange);

            if (item.qty <= 0) {
                saveCart(cart.filter(entry => entry.id !== item.id));
                toast(item.name + ' removed from cart');
            } else {
                saveCart(cart);
            }

            return;
        }

        const remove = event.target.closest('[data-remove]');

        if (remove) {
            const cart = readCart();

            const item = cart.find(
                entry => entry.id === remove.dataset.remove
            );

            saveCart(
                cart.filter(entry => entry.id !== remove.dataset.remove)
            );

            if (item) {
                toast(item.name + ' removed from cart');
            }
        }
    });

    const clear = document.getElementById('clearCart');

    if (clear) {
        clear.addEventListener('click', () => {
            saveCart([]);
            toast('Cart cleared');
        });
    }

    const checkout = document.getElementById('checkoutBtn');

    if (checkout) {
        checkout.addEventListener('click', () => {
            const cart = readCart();

            if (!cart.length) return;

            toast('Demo order complete — no payment was processed');
            saveCart([]);
        });
    }

    renderCart();

})();
