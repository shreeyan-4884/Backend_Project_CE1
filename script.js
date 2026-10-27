
"use strict";

const products = [
    {id:1,name:"Wireless Headphones",category:"Electronics",price:1499,icon:"fa-solid fa-headphones",description:"Comfortable sound for everyday listening."},
    {id:2,name:"Smart Watch",category:"Electronics",price:1999,icon:"fa-regular fa-clock",description:"A simple style upgrade for your wrist."},
    {id:3,name:"Classic T-Shirt",category:"Fashion",price:499,icon:"fa-solid fa-shirt",description:"Soft everyday cotton comfort."},
    {id:4,name:"Running Shoes",category:"Fashion",price:1299,icon:"fa-solid fa-shoe-prints",description:"Lightweight shoes for active days."},
    {id:5,name:"Desk Lamp",category:"Home",price:799,icon:"fa-regular fa-lightbulb",description:"A warm glow for your workspace."},
    {id:6,name:"Coffee Mug",category:"Home",price:299,icon:"fa-solid fa-mug-hot",description:"Your favourite drink's new companion."},
    {id:7,name:"Travel Backpack",category:"Accessories",price:999,icon:"fa-solid fa-bag-shopping",description:"Room for the essentials on the go."},
    {id:8,name:"Sunglasses",category:"Accessories",price:599,icon:"fa-solid fa-glasses",description:"A classic look for sunny days."}
];

let cart = [];
let appliedCoupon = "";
let discountAmount = 0;

const money = amount => new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
}).format(amount);

function renderProducts() {
    const category = document.getElementById("categoryFilter").value;
    const maxPrice = Number(document.getElementById("priceFilter").value);
    const sort = document.getElementById("sortFilter").value;

    let filtered = products.filter(p =>
        (category === "All" || p.category === category) &&
        p.price <= maxPrice
    );

    if (sort === "low") filtered.sort((a, b) => a.price - b.price);
    if (sort === "high") filtered.sort((a, b) => b.price - a.price);
    if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));

    document.getElementById("resultCount").textContent =
        `${filtered.length} product(s)`;

    document.getElementById("products").innerHTML = filtered.length
        ? filtered.map(p => `
            <article class="product">
                <div class="product-art"><i class="${p.icon}"></i></div>
                <div class="product-body">
                    <div class="category">${p.category}</div>
                    <h3>${p.name}</h3>
                    <p class="description">${p.description}</p>
                    <div class="product-bottom">
                        <span class="price">${money(p.price)}</span>
                        <button class="primary" onclick="addToCart(${p.id})">
                            <i class="fa-solid fa-cart-plus"></i> Add to cart
                        </button>
                    </div>
                </div>
            </article>
        `).join("")
        : '<div class="empty">No products match these filters.</div>';
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const item = cart.find(p => p.id === id);

    if (item) item.quantity++;
    else cart.push({ ...product, quantity: 1 });

    renderCart();
}

function changeQuantity(id, change) {
    const item = cart.find(p => p.id === id);
    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) removeItem(id);
    else renderCart();
}

function removeItem(id) {
    cart = cart.filter(p => p.id !== id);
    renderCart();
}

function calculateTotals() {
    const subtotal = cart.reduce(
        (sum, p) => sum + p.price * p.quantity, 0
    );

    if (appliedCoupon === "WELCOME15")
        discountAmount = subtotal * 0.15;
    else if (appliedCoupon === "MART200")
        discountAmount = Math.min(200, subtotal);
    else discountAmount = 0;

    const delivery = subtotal === 0 || subtotal >= 1500 ? 0 : 49;
    const total = Math.max(0, subtotal - discountAmount + delivery);

    return { subtotal, discount: discountAmount, delivery, total };
}

function renderCart() {
    document.getElementById("cartCount").textContent =
        cart.reduce((sum, p) => sum + p.quantity, 0);

    document.getElementById("cartItems").innerHTML = cart.length
        ? cart.map(p => `
            <div class="cart-item">
                <div class="cart-icon"><i class="${p.icon}"></i></div>
                <div>
                    <h3>${p.name}</h3>
                    <small>${money(p.price)} each</small>
                    <div class="item-controls">
                        <button class="qty-btn" onclick="changeQuantity(${p.id},-1)">−</button>
                        <strong>${p.quantity}</strong>
                        <button class="qty-btn" onclick="changeQuantity(${p.id},1)">+</button>
                        <button class="remove" onclick="removeItem(${p.id})">
                            <i class="fa-solid fa-trash"></i> Remove
                        </button>
                    </div>
                    <small>Line total: <strong>${money(p.price * p.quantity)}</strong></small>
                </div>
            </div>
        `).join("")
        : '<div class="empty">Your cart is empty.<br>Add a product to get started.</div>';

    const t = calculateTotals();

    document.getElementById("subtotal").textContent = money(t.subtotal);
    document.getElementById("discount").textContent = "-" + money(t.discount);
    document.getElementById("delivery").textContent = money(t.delivery);
    document.getElementById("total").textContent = money(t.total);
    document.getElementById("checkoutTotal").textContent = money(t.total);
}

function applyCoupon() {
    const code = document.getElementById("couponInput").value.trim().toUpperCase();
    const message = document.getElementById("couponMessage");

    if (!cart.length) {
        appliedCoupon = "";
        message.textContent = "Add a product before applying a coupon.";
        message.className = "message error";
    } else if (["WELCOME15", "MART200"].includes(code)) {
        appliedCoupon = code;
        message.textContent = code === "WELCOME15"
            ? "Coupon applied: 15% discount!"
            : "Coupon applied: ₹200 off!";
        message.className = "message success";
    } else {
        appliedCoupon = "";
        message.textContent = "Invalid coupon. Try WELCOME15 or MART200.";
        message.className = "message error";
    }

    renderCart();
}

function clearCart() {
    cart = [];
    appliedCoupon = "";

    document.getElementById("couponInput").value = "";
    document.getElementById("couponMessage").textContent = "";

    renderCart();
}

const checkoutDialog = document.getElementById("checkoutDialog");
const successDialog = document.getElementById("successDialog");

function openCheckout() {
    if (!cart.length) {
        alert("Your cart is empty. Add a product before checkout.");
        return;
    }

    document.getElementById("checkoutTotal").textContent =
        money(calculateTotals().total);

    checkoutDialog.showModal();
}

function closeCheckout() {
    checkoutDialog.close();
}

function placeOrder(event) {
    event.preventDefault();

    if (!cart.length) {
        closeCheckout();
        alert("Your cart is empty.");
        return;
    }

    const name = document.getElementById("customerName").value.trim();
    if (!name) return;

    const total = money(calculateTotals().total);
    const orderNumber = "SM" + Math.floor(100000 + Math.random() * 900000);

    checkoutDialog.close();

    document.getElementById("successText").textContent =
        `Thank you, ${name}! Your demo order ${orderNumber} totals ${total}.`;

    successDialog.showModal();

    cart = [];
    appliedCoupon = "";

    document.getElementById("couponInput").value = "";
    document.getElementById("couponMessage").textContent = "";
    document.getElementById("checkoutForm").reset();

    renderCart();
}

["categoryFilter", "priceFilter", "sortFilter"].forEach(id => {
    document.getElementById(id).addEventListener("change", renderProducts);
});

document.getElementById("applyCoupon").addEventListener("click", applyCoupon);

document.getElementById("couponInput").addEventListener("keydown", event => {
    if (event.key === "Enter") {
        event.preventDefault();
        applyCoupon();
    }
});

document.getElementById("clearCart").addEventListener("click", clearCart);
document.getElementById("checkoutButton").addEventListener("click", openCheckout);
document.getElementById("closeCheckout").addEventListener("click", closeCheckout);
document.getElementById("cancelCheckout").addEventListener("click", closeCheckout);
document.getElementById("checkoutForm").addEventListener("submit", placeOrder);

document.getElementById("finishOrder").addEventListener("click", () => {
    successDialog.close();
});

renderProducts();
renderCart();
