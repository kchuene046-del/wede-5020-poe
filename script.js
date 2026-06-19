// ========================================
// BUTTERCUP BAKES - COMPLETE JAVASCRIPT
// Shopping Cart + Student Verification + Cake Customization + Payment Options
// ========================================

// ========================
// 1. GLOBAL VARIABLES
// ========================

let cart = [];
let studentVerification = {
    isVerified: false,
    studentType: null,
    institutionName: '',
    studentNumber: '',
    studentEmail: '',
    verifiedAt: null,
    discountRate: 0.10
};

// Student specials
const studentSpecials = {
    active: true,
    discountPercentage: 10,
    specialCombo: "Student Combo",
    comboPrice: 55,
    freeItemOnBirthday: true,
    referralBonus: "R20 off next order"
};

// ========================
// 2. LOAD & SAVE FUNCTIONS
// ========================

function loadCart() {
    const savedCart = localStorage.getItem('buttercupCart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            updateCartCount();
        } catch(e) { console.error('Error loading cart', e); }
    }
    
    const savedStudent = localStorage.getItem('buttercupStudentVerification');
    if (savedStudent) {
        try {
            const saved = JSON.parse(savedStudent);
            if (saved.verifiedAt && (Date.now() - saved.verifiedAt < 86400000)) {
                studentVerification = saved;
            } else {
                localStorage.removeItem('buttercupStudentVerification');
            }
        } catch(e) { console.error('Error loading student verification', e); }
    }
}

function saveCart() {
    localStorage.setItem('buttercupCart', JSON.stringify(cart));
    updateCartCount();
    if (document.getElementById('cart-drawer') && document.getElementById('cart-drawer').style.display === 'flex') {
        renderCartDrawer();
    }
}

function saveStudentVerification() {
    localStorage.setItem('buttercupStudentVerification', JSON.stringify(studentVerification));
}

// ========================
// 3. CART FUNCTIONS
// ========================

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(el => {
        if (totalItems > 0) {
            el.textContent = totalItems;
            el.style.display = 'flex';
        } else {
            el.style.display = 'none';
        }
    });
}

function calculateTotals() {
    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const isStudent = studentVerification.isVerified;
    const discount = isStudent ? subtotal * 0.10 : 0;
    const delivery = subtotal > 300 ? 0 : 45;
    const total = subtotal - discount + delivery;
    
    return { subtotal, discount, delivery, total, isStudent };
}

function addToCart(productName, price, quantity = 1, customDetails = null) {
    let displayName = productName;
    let finalPrice = price;
    
    if (customDetails) {
        displayName = `${productName} (${customDetails.flavor || ''} ${customDetails.size || ''})`.trim();
        if (customDetails.message) {
            displayName += ` 🎀 "${customDetails.message.substring(0, 20)}"`;
        }
        finalPrice = customDetails.finalPrice || price;
    }
    
    let discountedPrice = finalPrice;
    if (studentVerification.isVerified) {
        discountedPrice = finalPrice * 0.9;
    }
    
    const existingItem = cart.find(item => item.name === displayName);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: Date.now() + Math.random(),
            name: displayName,
            originalPrice: finalPrice,
            price: Math.round(discountedPrice * 100) / 100,
            quantity: quantity,
            customDetails: customDetails,
            studentDiscounted: studentVerification.isVerified
        });
    }
    
    saveCart();
    const discountMsg = studentVerification.isVerified ? " (10% student discount applied!)" : "";
    showNotification(`✨ Added ${productName} to cart!${discountMsg}`, 'success');
}

// ========================
// 4. STUDENT VERIFICATION MODAL
// ========================

function showStudentVerificationModal() {
    const modalHTML = `
        <div id="student-modal-overlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:2500; display:flex; align-items:center; justify-content:center;">
            <div style="background:#FFFBF8; border-radius:30px; max-width:500px; width:90%; padding:35px; position:relative; animation:slideIn 0.3s ease;">
                <button onclick="closeStudentModal()" style="position:absolute; top:15px; right:20px; background:none; border:none; font-size:28px; cursor:pointer; color:#A0522D;">&times;</button>
                <div style="text-align:center;">
                    <span style="font-size:60px;">🎓</span>
                    <h2 style="color:#A0522D; margin:10px 0;">Student Verification</h2>
                    <p style="color:#C47E5A;">Get <strong>10% OFF</strong> on your entire order!</p>
                    <div style="background:#FFE8E0; border-radius:20px; padding:15px; margin:15px 0;">
                        <p style="margin:5px 0; font-weight:bold;">🎁 Special Student Perks:</p>
                        <p style="margin:5px 0; font-size:14px;">✅ 10% discount on all items</p>
                        <p style="margin:5px 0; font-size:14px;">✅ Free cookie on your birthday</p>
                        <p style="margin:5px 0; font-size:14px;">✅ Refer a friend - Get R20 off</p>
                        <p style="margin:5px 0; font-size:14px;">✅ Free delivery on orders R300+</p>
                    </div>
                </div>
                <form id="student-verification-form">
                    <div style="margin-bottom:15px;">
                        <label style="font-weight:600; color:#7B3F1A;">Institution Type *</label>
                        <select id="student-type" required style="width:100%; padding:12px; border-radius:12px; border:1px solid #FFD0BA; background:#FFF7F0;">
                            <option value="">-- Select --</option>
                            <option value="university">🏛️ University</option>
                            <option value="college">📚 College / TVET</option>
                            <option value="highschool">📖 High School</option>
                        </select>
                    </div>
                    <div style="margin-bottom:15px;">
                        <label style="font-weight:600; color:#7B3F1A;">Institution Name *</label>
                        <input type="text" id="institution-name" placeholder="e.g., University of Johannesburg" style="width:95%; padding:12px; border-radius:12px; border:1px solid #FFD0BA; background:#FFF7F0;">
                    </div>
                    <div style="margin-bottom:15px;">
                        <label style="font-weight:600; color:#7B3F1A;">Student Number *</label>
                        <input type="text" id="student-number" placeholder="Enter your student ID" style="width:95%; padding:12px; border-radius:12px; border:1px solid #FFD0BA; background:#FFF7F0;">
                    </div>
                    <div style="margin-bottom:20px;">
                        <label style="font-weight:600; color:#7B3F1A;">Student Email *</label>
                        <input type="email" id="student-email" placeholder="yourname@student.edu" style="width:95%; padding:12px; border-radius:12px; border:1px solid #FFD0BA; background:#FFF7F0;">
                    </div>
                    <button type="submit" style="width:100%; background:#A0522D; color:white; padding:14px; border:none; border-radius:40px; font-size:16px; cursor:pointer; font-weight:bold;">✅ Verify & Get 10% OFF</button>
                    <button type="button" onclick="closeStudentModal()" style="width:100%; background:#FFE0D0; color:#7B3F1A; padding:12px; border:none; border-radius:40px; margin-top:10px; cursor:pointer;">Maybe Later</button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById('student-verification-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const studentType = document.getElementById('student-type').value;
        const institutionName = document.getElementById('institution-name').value.trim();
        const studentNumber = document.getElementById('student-number').value.trim();
        const studentEmail = document.getElementById('student-email').value.trim();
        
        if (!studentType || !institutionName || !studentNumber || !studentEmail) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        studentVerification = {
            isVerified: true,
            studentType: studentType,
            institutionName: institutionName,
            studentNumber: studentNumber,
            studentEmail: studentEmail,
            verifiedAt: Date.now(),
            discountRate: 0.10
        };
        saveStudentVerification();
        closeStudentModal();
        updateCartPricesWithDiscount();
        showNotification('🎉 Student verified! 10% discount applied! 🎉', 'success');
        if (document.getElementById('cart-drawer')) renderCartDrawer();
    });
}

function updateCartPricesWithDiscount() {
    if (!studentVerification.isVerified) return;
    cart.forEach(item => {
        if (!item.studentDiscounted) {
            item.price = Math.round(item.originalPrice * 0.9 * 100) / 100;
            item.studentDiscounted = true;
        }
    });
    saveCart();
}

function removeStudentDiscount() {
    cart.forEach(item => {
        if (item.studentDiscounted) {
            item.price = item.originalPrice;
            item.studentDiscounted = false;
        }
    });
    studentVerification = {
        isVerified: false, studentType: null, institutionName: '', studentNumber: '', studentEmail: '', verifiedAt: null, discountRate: 0.10
    };
    saveStudentVerification();
    saveCart();
    showNotification('Student discount removed.', 'info');
    if (document.getElementById('cart-drawer')) renderCartDrawer();
}

function closeStudentModal() {
    const modal = document.getElementById('student-modal-overlay');
    if (modal) modal.remove();
}

// ========================
// 5. CAKE CUSTOMIZATION
// ========================

function openCakeCustomization(cakeType, basePrice) {
    const modalHTML = `
        <div id="customize-modal-overlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:2500; display:flex; align-items:center; justify-content:center;">
            <div style="background:#FFFBF8; border-radius:30px; max-width:500px; width:90%; max-height:85vh; overflow-y:auto; padding:35px; position:relative; animation:slideIn 0.3s ease;">
                <button onclick="closeCustomizeModal()" style="position:absolute; top:15px; right:20px; background:none; border:none; font-size:28px; cursor:pointer;">&times;</button>
                <div style="text-align:center;">
                    <span style="font-size:40px;">${cakeType === 'celebration' ? '🎂' : '🎨'}</span>
                    <h2 style="color:#A0522D;">${cakeType === 'celebration' ? 'Customize Your Cake' : 'Design Your Custom Cake'}</h2>
                </div>
                <form id="cake-customization-form">
                    <div style="margin-bottom:20px;">
                        <label style="font-weight:600;">Cake Flavor *</label>
                        <select id="cake-flavor" required style="width:100%; padding:12px; border-radius:12px; border:1px solid #FFD0BA;">
                            <option value="">Select</option>
                            <option value="Vanilla">🍦 Vanilla</option>
                            <option value="Chocolate">🍫 Chocolate</option>
                            <option value="Red Velvet">❤️ Red Velvet</option>
                            <option value="Lemon">🍋 Lemon</option>
                            <option value="Carrot">🥕 Carrot</option>
                        </select>
                    </div>
                    <div style="margin-bottom:20px;">
                        <label style="font-weight:600;">Size *</label>
                        <select id="cake-size" required style="width:100%; padding:12px; border-radius:12px; border:1px solid #FFD0BA;">
                            <option value="6 inch" data-add="0">6 inch (6-8 servings) - R${basePrice}</option>
                            <option value="8 inch" data-add="300">8 inch (10-12 servings) - R${basePrice + 300}</option>
                            <option value="10 inch" data-add="600">10 inch (15-20 servings) - R${basePrice + 600}</option>
                        </select>
                    </div>
                    <div style="margin-bottom:20px;">
                        <label style="font-weight:600;">Frosting</label>
                        <select id="cake-frosting" style="width:100%; padding:12px; border-radius:12px; border:1px solid #FFD0BA;">
                            <option value="Buttercream">🧁 Buttercream</option>
                            <option value="Cream Cheese">🍰 Cream Cheese</option>
                            <option value="Ganache">🍫 Ganache</option>
                        </select>
                    </div>
                    <div style="margin-bottom:20px;">
                        <label style="font-weight:600;">Special Message</label>
                        <textarea id="cake-message" rows="2" placeholder="Happy Birthday! ..." style="width:100%; padding:12px; border-radius:12px; border:1px solid #FFD0BA;"></textarea>
                    </div>
                    <div class="price-preview" style="background:#FFE8E0; padding:15px; border-radius:15px; text-align:center; margin:15px 0;">
                        <p style="margin:5px 0;">Final Price: <strong id="final-price-display" style="font-size:24px;">R${basePrice}</strong></p>
                        ${studentVerification.isVerified ? '<p style="color:green; font-size:12px;">🎓 Student discount will be applied at checkout</p>' : ''}
                    </div>
                    <div style="display:flex; gap:15px;">
                        <button type="button" onclick="closeCustomizeModal()" style="flex:1; background:#FFE0D0; padding:12px; border:none; border-radius:40px;">Cancel</button>
                        <button type="submit" style="flex:1; background:#A0522D; color:white; padding:12px; border:none; border-radius:40px;">Add to Cart 🛒</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const sizeSelect = document.getElementById('cake-size');
    const finalPriceSpan = document.getElementById('final-price-display');
    
    sizeSelect.addEventListener('change', function() {
        let add = parseInt(this.options[this.selectedIndex]?.dataset.add || 0);
        finalPriceSpan.textContent = `R${basePrice + add}`;
    });
    
    document.getElementById('cake-customization-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const flavor = document.getElementById('cake-flavor').value;
        const size = document.getElementById('cake-size').value;
        const frosting = document.getElementById('cake-frosting').value;
        const message = document.getElementById('cake-message').value;
        
        if (!flavor || !size) {
            showNotification('Please select flavor and size!', 'error');
            return;
        }
        
        let add = parseInt(document.getElementById('cake-size').options[document.getElementById('cake-size').selectedIndex]?.dataset.add || 0);
        let finalPrice = basePrice + add;
        
        const cakeName = cakeType === 'celebration' ? '🎂 Celebration Cake' : '🎨 Custom Cake';
        addToCart(cakeName, finalPrice, 1, { flavor, size, frosting, message, finalPrice });
        closeCustomizeModal();
        openCartDrawer();
    });
}

function closeCustomizeModal() {
    const modal = document.getElementById('customize-modal-overlay');
    if (modal) modal.remove();
}

// ========================
// 6. CART DRAWER
// ========================

function createCartDrawer() {
    if (document.getElementById('cart-drawer')) return;
    
    const drawerHTML = `
        <div id="cart-drawer-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:1500;" onclick="closeCartDrawer()"></div>
        <div id="cart-drawer" style="display:none; position:fixed; top:0; right:0; width:100%; max-width:480px; height:100%; background:#FFFBF8; box-shadow:-2px 0 20px rgba(0,0,0,0.1); z-index:1501; flex-direction:column; transform:translateX(100%); transition:transform 0.3s ease;">
            <div style="padding:20px; border-bottom:2px solid #FFE0D0; display:flex; justify-content:space-between; align-items:center;">
                <h2 style="color:#A0522D;">🛒 Your Cart</h2>
                <button onclick="closeCartDrawer()" style="background:none; border:none; font-size:28px; cursor:pointer;">&times;</button>
            </div>
            <div id="cart-items-list" style="flex:1; overflow-y:auto; padding:20px;"></div>
            <div id="cart-summary" style="padding:20px; border-top:2px solid #FFE0D0; background:#FFF7F0;">
                <div id="student-discount-section" style="margin-bottom:15px;"></div>
                <div id="cart-totals" style="margin-bottom:15px;"></div>
                <button onclick="proceedToPayment()" style="width:100%; background:#A0522D; color:white; padding:14px; border:none; border-radius:40px; font-size:18px; cursor:pointer;">💳 Proceed to Payment</button>
                <button onclick="closeCartDrawer()" style="width:100%; background:#FFE0D0; color:#7B3F1A; padding:12px; border:none; border-radius:40px; margin-top:10px; cursor:pointer;">Continue Shopping</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', drawerHTML);
}

function openCartDrawer() {
    createCartDrawer();
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-drawer-overlay');
    if (drawer && overlay) {
        drawer.style.display = 'flex';
        overlay.style.display = 'block';
        setTimeout(() => { drawer.style.transform = 'translateX(0)'; }, 10);
        renderCartDrawer();
    }
}

function closeCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-drawer-overlay');
    if (drawer && overlay) {
        drawer.style.transform = 'translateX(100%)';
        setTimeout(() => {
            drawer.style.display = 'none';
            overlay.style.display = 'none';
        }, 300);
    }
}

function renderCartDrawer() {
    const cartList = document.getElementById('cart-items-list');
    if (!cartList) return;
    
    if (cart.length === 0) {
        cartList.innerHTML = '<p style="text-align:center; color:#999; padding:40px;">🛍️ Your cart is empty</p>';
        document.getElementById('cart-totals').innerHTML = '';
        return;
    }
    
    let html = '';
    cart.forEach(item => {
        html += `
            <div style="display:flex; align-items:center; gap:15px; margin-bottom:20px; padding:12px; background:white; border-radius:20px;">
                <div style="flex:1;">
                    <h4 style="margin:0; font-size:14px;">${item.name}</h4>
                    <p style="margin:0; font-size:12px; color:#999;">R${item.price.toFixed(2)} each</p>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})" style="width:30px; height:30px; border-radius:50%; border:1px solid #FFD0BA; background:white;">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})" style="width:30px; height:30px; border-radius:50%; border:1px solid #FFD0BA; background:white;">+</button>
                </div>
                <div style="min-width:70px; text-align:right;">
                    <b>R${(item.price * item.quantity).toFixed(2)}</b>
                    <button onclick="removeFromCart(${item.id})" style="background:none; border:none; color:#E74C3C; margin-left:8px;">🗑️</button>
                </div>
            </div>
        `;
    });
    cartList.innerHTML = html;
    
    const totals = calculateTotals();
    document.getElementById('cart-totals').innerHTML = `
        <div style="border-top:1px solid #FFE0D0; padding-top:15px;">
            <p>Subtotal: <span style="float:right;">R${totals.subtotal.toFixed(2)}</span></p>
            ${totals.discount > 0 ? `<p style="color:green;">🎓 Student Discount (10%): <span style="float:right;">-R${totals.discount.toFixed(2)}</span></p>` : ''}
            <p>Delivery: <span style="float:right;">R${totals.delivery.toFixed(2)}</span></p>
            <p style="font-size:20px; font-weight:bold;">Total: <span style="float:right;">R${totals.total.toFixed(2)}</span></p>
        </div>
    `;
    
    const studentSection = document.getElementById('student-discount-section');
    if (studentVerification.isVerified) {
        studentSection.innerHTML = `
            <div style="background:#E8F5E9; padding:12px; border-radius:15px; display:flex; justify-content:space-between;">
                <span>🎓 Student verified! 10% off</span>
                <button onclick="removeStudentDiscount()" style="background:#E74C3C; color:white; padding:5px 12px; border:none; border-radius:20px;">Remove</button>
            </div>
        `;
    } else {
        studentSection.innerHTML = `
            <button onclick="showStudentVerificationModal()" style="width:100%; background:#FFE0D0; color:#A0522D; padding:12px; border:none; border-radius:40px;">🎓 Verify Student & Save 10%</button>
        `;
    }
}

function updateQuantity(itemId, newQuantity) {
    if (newQuantity <= 0) {
        cart = cart.filter(i => i.id !== itemId);
    } else {
        const item = cart.find(i => i.id === itemId);
        if (item) item.quantity = newQuantity;
    }
    saveCart();
    renderCartDrawer();
}

function removeFromCart(itemId) {
    cart = cart.filter(i => i.id !== itemId);
    saveCart();
    renderCartDrawer();
    showNotification('Item removed', 'info');
}

// ========================
// 7. PAYMENT MODAL (COMPLETE WITH OPTIONS)
// ========================

function proceedToPayment() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    const totals = calculateTotals();
    
    const paymentHTML = `
        <div id="payment-modal-overlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:3000; display:flex; align-items:center; justify-content:center;">
            <div style="background:#FFFBF8; border-radius:30px; max-width:550px; width:90%; max-height:85vh; overflow-y:auto; padding:30px; animation:slideIn 0.3s ease;">
                <button onclick="closePaymentModal()" style="float:right; background:none; border:none; font-size:28px; cursor:pointer;">&times;</button>
                <h2 style="color:#A0522D; text-align:center;">💳 Complete Your Order</h2>
                
                <div style="background:#FFE8E0; border-radius:20px; padding:15px; margin:15px 0;">
                    <h3>Order Summary</h3>
                    ${cart.map(item => `<p style="font-size:13px;">${item.quantity}x ${item.name} - R${(item.price * item.quantity).toFixed(2)}</p>`).join('')}
                    <hr>
                    <p>Subtotal: R${totals.subtotal.toFixed(2)}</p>
                    ${totals.discount > 0 ? `<p style="color:green;">🎓 Student Discount: -R${totals.discount.toFixed(2)}</p>` : ''}
                    <p>Delivery: R${totals.delivery.toFixed(2)}</p>
                    <p style="font-size:22px; font-weight:bold;">Total: R${totals.total.toFixed(2)}</p>
                </div>
                
                <form id="payment-form">
                    <input type="text" id="pay-name" placeholder="Full Name *" required style="width:95%; padding:12px; margin:8px 0; border-radius:12px; border:1px solid #FFD0BA;">
                    <input type="email" id="pay-email" placeholder="Email *" required style="width:95%; padding:12px; margin:8px 0; border-radius:12px; border:1px solid #FFD0BA;">
                    <input type="tel" id="pay-phone" placeholder="Phone Number *" required style="width:95%; padding:12px; margin:8px 0; border-radius:12px; border:1px solid #FFD0BA;">
                    <textarea id="pay-address" rows="2" placeholder="Delivery Address *" required style="width:95%; padding:12px; margin:8px 0; border-radius:12px; border:1px solid #FFD0BA;"></textarea>
                    
                    <label style="font-weight:600;">Select Payment Method *</label>
                    <select id="pay-method" required style="width:98%; padding:12px; margin:8px 0; border-radius:12px; border:1px solid #FFD0BA;">
                        <option value="">-- Choose payment method --</option>
                        <option value="card">💳 Credit / Debit Card</option>
                        <option value="eft">🏦 EFT / Bank Transfer</option>
                        <option value="cash">💵 Cash on Delivery</option>
                        <option value="snapscan">📱 SnapScan</option>
                        <option value="whatsapp">💚 WhatsApp Pay</option>
                    </select>
                    
                    <div id="payment-details" style="background:#FFF2E9; border-radius:15px; padding:15px; margin:15px 0; display:none;"></div>
                    
                    <button type="submit" style="width:100%; background:#A0522D; color:white; padding:14px; border:none; border-radius:40px; font-size:18px; cursor:pointer;">✅ Place Order - R${totals.total.toFixed(2)}</button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', paymentHTML);
    
    const methodSelect = document.getElementById('pay-method');
    const paymentDetailsDiv = document.getElementById('payment-details');
    
    methodSelect.addEventListener('change', function() {
        const method = this.value;
        if (method === 'card') {
            paymentDetailsDiv.style.display = 'block';
            paymentDetailsDiv.innerHTML = `
                <p style="font-weight:bold;">💳 Card Details</p>
                <input type="text" placeholder="Card Number (XXXX-XXXX-XXXX-XXXX)" style="width:95%; padding:10px; margin:5px 0; border-radius:10px; border:1px solid #FFD0BA;">
                <div style="display:flex; gap:10px;">
                    <input type="text" placeholder="MM/YY" style="flex:1; padding:10px; border-radius:10px; border:1px solid #FFD0BA;">
                    <input type="text" placeholder="CVV" style="flex:1; padding:10px; border-radius:10px; border:1px solid #FFD0BA;">
                </div>
                <p style="font-size:12px; color:#666; margin-top:10px;">🔒 Secure payment powered by PayGate</p>
            `;
        } else if (method === 'eft') {
            paymentDetailsDiv.style.display = 'block';
            paymentDetailsDiv.innerHTML = `
                <p style="font-weight:bold;">🏦 Bank Transfer Details</p>
                <p>Bank: FNB<br>Account: Buttercup Bakes<br>Acc No: 628 456 7890<br>Ref: Order + Your Name</p>
                <p style="font-size:12px;">Please use your order number as reference. Send proof to hello@buttercupbakes.co.za</p>
            `;
        } else if (method === 'snapscan') {
            paymentDetailsDiv.style.display = 'block';
            paymentDetailsDiv.innerHTML = `
                <p style="font-weight:bold;">📱 SnapScan</p>
                <p>Scan the QR code below or use SnapCode: <strong>BUTTERCUP123</strong></p>
                <div style="background:#ccc; width:120px; height:120px; margin:10px auto; display:flex; align-items:center; justify-content:center; border-radius:15px;">📱 QR Code</div>
            `;
        } else if (method === 'whatsapp') {
            paymentDetailsDiv.style.display = 'block';
            paymentDetailsDiv.innerHTML = `
                <p style="font-weight:bold;">💚 WhatsApp Pay</p>
                <p>Click the button below to complete payment via WhatsApp:</p>
                <button type="button" onclick="window.open('https://wa.me/27761234567?text=I%20want%20to%20pay%20for%20my%20Buttercup%20order', '_blank')" style="background:#25D366; color:white; padding:10px; border:none; border-radius:40px;">📱 Pay with WhatsApp</button>
            `;
        } else {
            paymentDetailsDiv.style.display = 'none';
        }
    });
    
    document.getElementById('payment-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('pay-name').value;
        const email = document.getElementById('pay-email').value;
        const phone = document.getElementById('pay-phone').value;
        const address = document.getElementById('pay-address').value;
        const paymentMethod = document.getElementById('pay-method').value;
        
        if (!name || !email || !phone || !address || !paymentMethod) {
            showNotification('Please fill all fields', 'error');
            return;
        }
        
        const orderId = 'BB' + Date.now();
        const order = {
            orderId: orderId,
            date: new Date().toLocaleString(),
            customer: { name, email, phone, address },
            studentInfo: studentVerification.isVerified ? studentVerification : null,
            items: cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
            totals: calculateTotals(),
            paymentMethod: paymentMethod,
            status: 'confirmed'
        };
        
        localStorage.setItem('buttercupOrders', JSON.stringify([...(JSON.parse(localStorage.getItem('buttercupOrders') || '[]')), order]));
        cart = [];
        saveCart();
        closePaymentModal();
        closeCartDrawer();
        
        let paymentMsg = '';
        if (paymentMethod === 'whatsapp') {
            paymentMsg = ' Please complete WhatsApp payment.';
        } else if (paymentMethod === 'cash') {
            paymentMsg = ' Pay with cash upon delivery.';
        } else if (paymentMethod === 'eft') {
            paymentMsg = ' Please send proof of payment.';
        }
        
        showNotification(`✅ Order #${orderId} placed! Confirmation sent to ${email}.${paymentMsg}`, 'success');
        setTimeout(() => {
            alert(`🎉 Order Confirmed!\n\nOrder ID: ${orderId}\nTotal: R${order.totals.total.toFixed(2)}\nPayment: ${paymentMethod}\n\nWe'll contact you within 24 hours!`);
        }, 300);
    });
}

function closePaymentModal() {
    const modal = document.getElementById('payment-modal-overlay');
    if (modal) modal.remove();
}

// ========================
// 8. NOTIFICATION
// ========================

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed; bottom: 20px; right: 20px; background: ${type === 'success' ? '#4CAF50' : '#E74C3C'}; 
        color: white; padding: 12px 24px; border-radius: 50px; z-index: 3500; 
        animation: slideIn 0.3s ease; max-width: 320px; font-family: 'Poppins', sans-serif; font-size: 14px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3500);
}

// ========================
// 9. INITIALIZATION
// ========================

document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    createCartDrawer();
    
    const addButtons = document.querySelectorAll('.add-to-cart-btn');
    addButtons.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', function() {
            const name = this.getAttribute('data-name');
            const price = parseFloat(this.getAttribute('data-price'));
            if (name && price) addToCart(name, price);
        });
    });
    
    const customizeButtons = document.querySelectorAll('.customize-cake-btn');
    customizeButtons.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', function() {
            const cakeType = this.getAttribute('data-cake-type');
            const basePrice = parseFloat(this.getAttribute('data-base-price'));
            openCakeCustomization(cakeType, basePrice);
        });
    });
});

// Add animation style
if (!document.querySelector('#cart-styles')) {
    const style = document.createElement('style');
    style.id = 'cart-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

// Make functions global
window.openCartDrawer = openCartDrawer;
window.closeCartDrawer = closeCartDrawer;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.proceedToPayment = proceedToPayment;
window.showStudentVerificationModal = showStudentVerificationModal;
window.closeStudentModal = closeStudentModal;
window.removeStudentDiscount = removeStudentDiscount;
window.openCakeCustomization = openCakeCustomization;
window.closeCustomizeModal = closeCustomizeModal;
window.closePaymentModal = closePaymentModal;