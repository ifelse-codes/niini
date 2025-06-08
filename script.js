// Global stores
let allProducts = [];
let allUsers = [];
let allStores = [];
let allOrders = []; // For orders
let userSession = null; // To store the loggedInUser object

// Sample Product Data (Fallback or initial structure idea - will be replaced by fetch)
const sampleProducts = [
    { id: "sample1", name: 'Sample Product 1', price: 10, imagePlaceholderUrl: 'https://placehold.co/300x200/ccc/fff?text=Sample1' },
    { id: "sample2", name: 'Sample Product 2', price: 20, imagePlaceholderUrl: 'https://placehold.co/300x200/ccc/fff?text=Sample2' }
];

// Function to fetch products from JSON file
async function fetchProducts() {
    try {
        const response = await fetch('json/products.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allProducts = await response.json();
        console.log("Products loaded:", allProducts);
        return allProducts;
    } catch (error) {
        console.error("Could not fetch products:", error);
        // Keep allProducts as empty array or handle error as appropriate
        allProducts = sampleProducts; // Fallback to sample products if you have them defined
        return []; // Or return allProducts
    }
}

// Function to fetch users from JSON file
async function fetchUsers() {
    try {
        const response = await fetch('json/users.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allUsers = await response.json();
        console.log("Users loaded:", allUsers);

        // Augment with users registered in this session (simulation)
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        allUsers = allUsers.concat(registeredUsers);

        return allUsers;
    } catch (error) {
        console.error("Could not fetch users:", error);
        return [];
    }
}

// Function to fetch stores from JSON file
async function fetchStores() {
    try {
        const response = await fetch('json/stores.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allStores = await response.json();
        console.log("Stores loaded:", allStores);

        // Augment with stores created in this session (simulation from localStorage)
        // This iterates through all localStorage keys, which might be slow if many keys exist.
        // A more targeted approach or a single localStorage key for all user-created stores would be better.
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('user_store_')) {
                const store = JSON.parse(localStorage.getItem(key));
                // Avoid duplicates if already fetched from a (hypothetical) updated json/stores.json
                if (!allStores.find(s => s.id === store.id)) {
                    allStores.push(store);
                }
            }
        }
        return allStores;
    } catch (error) {
        console.error("Could not fetch stores:", error);
        return [];
    }
}

// Function to fetch orders from JSON file
async function fetchOrders() {
    try {
        const response = await fetch('json/orders.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allOrders = await response.json();
        console.log("Orders loaded:", allOrders);
        return allOrders;
    } catch (error) {
        console.error("Could not fetch orders:", error);
        return [];
    }
}

// Function to render products on index.html, optionally filtered by storeId
function renderProducts(filterStoreId = null) {
    const productListContainer = document.querySelector('.product-list');
    const productListHeading = document.getElementById('product-list-heading');

    if (!productListContainer) {
        console.log("Product list container not found for rendering.");
        return;
    }
    if (!productListHeading) {
        console.log("Product list heading element not found.");
    }

    productListContainer.innerHTML = ''; // Clear existing products
    let productsToDisplay = allProducts;
    let headingText = "All Products";

    if (filterStoreId) {
        productsToDisplay = allProducts.filter(p => p.storeId === filterStoreId);
        const store = allStores.find(s => s.id === filterStoreId);
        if (store) {
            headingText = `Products from ${store.name}`;
        } else {
            headingText = `Products from Store ID: ${filterStoreId}`;
        }
    } else if (allProducts.length === 0) {
         headingText = "Welcome to our Marketplace!";
    }

    if (productListHeading) {
        productListHeading.textContent = headingText;
    }

    if (!productsToDisplay || productsToDisplay.length === 0) {
        if (filterStoreId) {
            productListContainer.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <div class="text-gray-500 mb-4"><i class="fas fa-store-slash text-4xl"></i></div>
                    <p class="text-gray-600 text-lg">This store has no products listed currently.</p>
                    <p class="text-gray-500 mt-2">Check back later or browse other stores.</p>
                </div>`;
        } else {
            productListContainer.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <div class="text-gray-500 mb-4"><i class="fas fa-shopping-basket text-4xl"></i></div>
                    <p class="text-gray-600 text-lg">No products available at the moment.</p>
                    <p class="text-gray-500 mt-2">Please check back later or create your own store!</p>
                </div>`;
        }
        return;
    }

    productsToDisplay.forEach(product => {
        const productItem = document.createElement('div');
        // Modern card styling with hover effects
        productItem.className = 'card animate-fade-in hover:shadow-lg transition';
        
        // Get store info for the product
        const store = allStores.find(s => s.id === product.storeId);
        const storeName = store ? store.name : 'Unknown Store';
        
        productItem.innerHTML = `
            <a href="product.html?id=${product.id}" class="block">
                <img src="${product.imagePlaceholderUrl || 'https://placehold.co/300x200/ccc/fff?text=No+Image'}" 
                     alt="${product.name}" 
                     class="card-image transition hover:scale-105 duration-300">
            </a>
            <div class="card-content">
                <a href="product.html?id=${product.id}" class="block">
                    <h3 class="card-title">${product.name}</h3>
                </a>
                <p class="card-description">${product.description || 'No description available.'}</p>
                <div class="flex items-center justify-between mb-3">
                    <p class="card-price">$${product.price.toFixed(2)}</p>
                    <span class="text-sm text-gray-500">
                        <i class="fas fa-store mr-1"></i> ${storeName}
                    </span>
                </div>
                <div class="card-footer">
                    <button onclick="addToCart('${product.id}')" class="btn btn-primary w-full">
                        <i class="fas fa-shopping-cart mr-2"></i> Add to Cart
                    </button>
                </div>
            </div>
        `;
        productListContainer.appendChild(productItem);
    });
}

// Function to add product to cart
function addToCart(productId) {
    if (allProducts.length === 0) {
        console.error('Product list not loaded yet. Cannot add to cart.');
        // Optionally, you could try to fetch products here if `allProducts` is empty,
        // but ideally, it should be loaded before any "Add to Cart" button is clickable.
        alert('Products are still loading, please try again in a moment.');
        return;
    }

    const product = allProducts.find(p => p.id === productId);
    if (!product) {
        console.error(`Product with ID ${productId} not found in allProducts!`);
        alert('Error: Product not found.');
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProductIndex = cart.findIndex(item => item.id === productId);

    if (existingProductIndex > -1) {
        cart[existingProductIndex].quantity += 1;
    } else {
        // Add full product details to cart for easier rendering on cart page
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            imagePlaceholderUrl: product.imagePlaceholderUrl,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    // Simple alert, can be replaced with a Tailwind styled modal later
    alert(`${product.name} added to cart!`);
    updateCartCount();
}

// Function to display cart items on cart.html
function displayCart() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    if (!cartItemsContainer) {
        console.log("Cart items container not found.");
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cartItemsContainer.innerHTML = ''; // Clear existing items
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-gray-600">Your cart is empty.</p>';
        if(cartTotalElement) cartTotalElement.textContent = '$0.00';
        return;
    }

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        const cartItem = document.createElement('div');
        // Tailwind classes for cart item
        cartItem.className = 'cart-item flex justify-between items-center p-4 border-b border-gray-200';
        cartItem.innerHTML = `
            <div class="flex items-center">
                <img src="${item.imagePlaceholderUrl || 'https://placehold.co/100x100/ccc/fff?text=No+Image'}" alt="${item.name}" class="w-16 h-16 object-cover rounded mr-4">
                <div>
                    <h4 class="text-lg font-semibold">${item.name}</h4>
                    <p class="text-gray-600">Quantity: ${item.quantity}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="text-lg font-semibold">$${itemTotal.toFixed(2)}</p>
                <button onclick="removeFromCart('${item.id}')" class="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    if (cartTotalElement) {
        cartTotalElement.textContent = `$${total.toFixed(2)}`;
    }
}

// Function to remove item from cart
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
    updateCartCount();
}

// Function to display product details on product.html
async function displayProductDetails() {
    const productDetailsContainer = document.querySelector('.product-details');
    if (!productDetailsContainer) {
        console.log("Product details container not found.");
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId) {
        productDetailsContainer.innerHTML = '<p class="text-red-500">No product ID specified in URL.</p>';
        return;
    }

    if (allProducts.length === 0) {
        await fetchProducts(); // Ensure products are loaded
    }

    const product = allProducts.find(p => p.id === productId);

    if (product) {
        // Tailwind classes for product details layout
        productDetailsContainer.innerHTML = `
            <div class="md:flex md:space-x-8">
                <div class="md:w-1/2">
                    <img src="${product.imagePlaceholderUrl || 'https://placehold.co/600x400/ccc/fff?text=No+Image'}" alt="${product.name}" class="w-full h-auto object-cover rounded-lg shadow-lg mb-4 md:mb-0">
                </div>
                <div class="md:w-1/2 mt-4 md:mt-0 flex flex-col">
                    <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-3">${product.name}</h1>
                    <p class="text-gray-600 mb-4 text-md leading-relaxed flex-grow">${product.description || 'No description available.'}</p>
                    <p class="text-3xl font-bold text-indigo-600 mb-6">$${product.price.toFixed(2)}</p>
                    <button onclick="addToCart('${product.id}')" class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out text-lg shadow-md hover:shadow-lg">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
    } else {
        productDetailsContainer.innerHTML = '<p class="text-red-500 text-center py-10">Product not found.</p>';
    }
}


// Function to handle checkout form submission
function handleCheckout(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;

    if (!name || !email || !address) {
        alert('Please fill in all required fields.');
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Your cart is empty. Add some products before checking out.');
        return;
    }

    // Determine storeId from the first product in cart (simplification)
    let storeIdForOrder = null;
    if (cart[0] && cart[0].id) { // Check if cart[0] and its id exist
        const firstProductFullDetails = allProducts.find(p => p.id === cart[0].id);
        if (firstProductFullDetails) {
            storeIdForOrder = firstProductFullDetails.storeId;
        }
    }

    if (!storeIdForOrder) {
        alert('Could not determine the store for this order. Please try again or contact support.');
        console.error("Error: storeIdForOrder could not be determined for the order.", cart);
        return;
    }

    const storeForOrder = allStores.find(s => s.id === storeIdForOrder);
    const storeWhatsappNumber = storeForOrder ? storeForOrder.whatsappNumber : "+1234567890"; // Fallback if store not found (should not happen if storeIdForOrder is valid)


    let orderSummaryText = `New Order for ${storeForOrder ? storeForOrder.name : 'Store'}:\n`;
    orderSummaryText += `Customer: ${name}\nEmail: ${email}\nAddress: ${address}\n\nItems:\n`;
    let total = 0;
    const orderItems = [];

    cart.forEach(item => {
        orderSummaryText += `- ${item.name} (ID: ${item.id}) x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
        total += item.price * item.quantity;
        orderItems.push({ // Store detailed item info for the order
            productId: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
        });
    });
    orderSummaryText += `\nTotal: $${total.toFixed(2)}`;

    // Create new order object
    const newOrder = {
        id: `order_${Date.now()}`,
        storeId: storeIdForOrder,
        customerName: name,
        customerAddress: address,
        customerEmail: email,
        items: orderItems,
        totalAmount: parseFloat(total.toFixed(2)),
        status: "Pending Confirmation via WhatsApp",
        timestamp: new Date().toISOString() // Add timestamp for sorting
    };

    allOrders.push(newOrder); // Add to in-memory global orders

    // Persist this new order to a session-specific localStorage item for the store
    let sessionStoreOrders = JSON.parse(localStorage.getItem('session_orders_store_' + storeIdForOrder)) || [];
    sessionStoreOrders.push(newOrder);
    localStorage.setItem('session_orders_store_' + storeIdForOrder, JSON.stringify(sessionStoreOrders));

    console.log("New order created:", newOrder);
    console.log(`Order Summary for WhatsApp:\n${orderSummaryText}`);

    const encodedOrderSummary = encodeURIComponent(orderSummaryText);
    window.location.href = `https://wa.me/${storeWhatsappNumber}?text=${encodedOrderSummary}`;

    localStorage.removeItem('cart');
    updateCartCount();
    alert('You will be redirected to WhatsApp to send your order. Your cart has been cleared and the order has been recorded.');
}

// Function to update cart count in header
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) { // Ensure element exists before trying to update
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
}

// Authentication Functions
function handleLoginFormSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const user = allUsers.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        alert('Login successful! Redirecting to home page.');
        updateNavigation(); // Update nav immediately
        window.location.href = 'index.html';
    } else {
        alert('Invalid email or password.');
    }
}

function handleRegisterFormSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (allUsers.find(u => u.email === email)) {
        alert('Email already registered. Please login or use a different email.');
        return;
    }

    // Simulate new user creation (in a real app, this would be a backend call)
    const newUser = {
        id: `newUser${Date.now()}`, // Temporary unique ID for session
        name: name,
        email: email,
        password: password // In a real app, hash the password
    };
    allUsers.push(newUser);

    // Store newly registered users in localStorage to persist them for the session (simulation)
    let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    registeredUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

    alert('Registration successful! Please login.');
    window.location.href = 'login.html';
}

function logout() {
    localStorage.removeItem('loggedInUser');
    alert('You have been logged out.');
    updateNavigation(); // Update nav immediately
    window.location.href = 'login.html';
}

// Function to update navigation based on login status
function updateNavigation() {
    const navContainer = document.getElementById('main-nav');
    if (!navContainer) return;

    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    let navHTML = '';

    // Common links for all pages (Home, Cart, Checkout)
    // Cart count span needs to be handled carefully if it's part of this dynamic nav
    // It's currently separate in the HTML structure, which is fine.

    if (loggedInUser) {
        navHTML = `
            <a href="index.html" class="hover:text-gray-300">Home</a>
            <a href="dashboard.html" class="hover:text-gray-300">Dashboard</a>
            <a href="cart.html" class="hover:text-gray-300">Cart (<span id="cart-count">0</span>)</a>
            <a href="checkout.html" class="hover:text-gray-300">Checkout</a>
            <span class="text-gray-400">Hi, ${loggedInUser.name.split(' ')[0]}!</span>
            <button onclick="logout()" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm">Logout</button>
        `;
    } else {
        navHTML = `
            <a href="index.html" class="hover:text-gray-300">Home</a>
            <a href="login.html" class="hover:text-gray-300">Login</a>
            <a href="register.html" class="hover:text-gray-300">Register</a>
            <a href="cart.html" class="hover:text-gray-300">Cart (<span id="cart-count">0</span>)</a>
            <a href="checkout.html" class="hover:text-gray-300">Checkout</a>
        `;
    }
    navContainer.innerHTML = navHTML;
    updateCartCount(); // Ensure cart count is updated after nav rebuild
}


// Main initialization logic
async function initApp() {
    userSession = JSON.parse(localStorage.getItem('loggedInUser')); // Populate userSession early

    await fetchProducts(); // Load products
    await fetchUsers();    // Load users
    await fetchStores();   // Load stores
    await fetchOrders();   // Load orders

    updateNavigation(); // Setup navigation based on login state
    updateCartCount();  // Initial cart count update (called within updateNavigation too)

    const page = window.location.pathname.split("/").pop();

    // Route protection for authenticated pages
    const authRequiredPages = ['dashboard.html', 'create-store.html', 'dashboard-products.html', 'dashboard-orders.html'];
    if (authRequiredPages.includes(page) && !userSession) {
        alert('You must be logged in to view this page. Redirecting to login...');
        window.location.href = 'login.html';
        return; // Stop further execution for this page
    }

    // Specific check for pages requiring a store
    const storeRequiredPages = ['dashboard-products.html', 'dashboard-orders.html'];
    if (storeRequiredPages.includes(page) && userSession) { // userSession check already done for authRequiredPages
        let userStore = JSON.parse(localStorage.getItem('user_store_' + userSession.id));
        if (!userStore) {
            userStore = allStores.find(store => store.userId === userSession.id);
        }
        if (!userStore) {
            alert('You need to have a store to access this page. Redirecting to dashboard...');
            window.location.href = 'dashboard.html';
            return;
        }
    }

    if (page === 'index.html' || page === '') {
        const urlParams = new URLSearchParams(window.location.search);
        const storeIdFromQuery = urlParams.get('store_id');
        renderProducts(storeIdFromQuery);
        displayStoreList(); // Display list of stores
    } else if (page === 'product.html') {
        displayProductDetails();
    } else if (page === 'cart.html') {
        displayCart();
    } else if (page === 'checkout.html') {
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', handleCheckout);
        }
    } else if (page === 'login.html') {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLoginFormSubmit);
        }
    } else if (page === 'register.html') {
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegisterFormSubmit);
        }
    } else if (page === 'create-store.html') {
        const createStoreForm = document.getElementById('create-store-form');
        if (createStoreForm) {
            createStoreForm.addEventListener('submit', handleCreateStoreFormSubmit);
        }
    } else if (page === 'dashboard.html') {
        displayDashboard();
    } else if (page === 'dashboard-products.html') {
        const addProductForm = document.getElementById('add-product-form');
        if (addProductForm) {
            addProductForm.addEventListener('submit', handleAddProductFormSubmit);
        }
        displayStoreProducts();
    } else if (page === 'dashboard-orders.html') {
    // displayStoreOrders();
    }
}

// Function to display store list on index.html
function displayStoreList() {
    const storeListContainer = document.getElementById('store-list-container');
    if (!storeListContainer) {
        // console.log("Store list container not found on this page.");
        return;
    }

    if (!allStores || allStores.length === 0) {
        storeListContainer.innerHTML = '<p class="text-gray-600 text-center">No stores available right now.</p>';
        return;
    }

    storeListContainer.innerHTML = ''; // Clear existing content
    
    // Create section title
    const sectionTitle = document.createElement('h2');
    sectionTitle.className = 'section-title mb-8';
    sectionTitle.textContent = 'Browse Our Stores';
    storeListContainer.appendChild(sectionTitle);
    
    // Create store grid
    const storeGrid = document.createElement('div');
    storeGrid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6';
    
    allStores.forEach(store => {
        const storeCard = document.createElement('div');
        storeCard.className = 'store-card animate-fade-in';
        
        storeCard.innerHTML = `
            <a href="index.html?store_id=${store.id}" class="block h-full">
                <div class="store-card-header">
                    <img src="${store.logo || 'https://cdn.pixabay.com/photo/2014/04/03/00/41/house-309113_1280.png'}" 
                         alt="${store.name}" 
                         class="store-logo mx-auto transition-transform duration-300 hover:scale-105">
                </div>
                <div class="store-card-content">
                    <h3 class="store-card-title">${store.name}</h3>
                    <p class="store-card-description">${store.description || 'Visit our store to see our products.'}</p>
                    <div class="store-card-footer">
                        <span class="text-sm text-primary-600 font-medium">
                            <i class="fas fa-arrow-right mr-1"></i> Browse Products
                        </span>
                    </div>
                </div>
            </a>
        `;
        
        storeGrid.appendChild(storeCard);
    });
    
    storeListContainer.appendChild(storeGrid);
}


// Store Management Functions
function handleCreateStoreFormSubmit(event) {
    event.preventDefault();
    if (!userSession) {
        alert('Error: No user logged in. Cannot create store.');
        window.location.href = 'login.html'; // Should not happen due to route protection
        return;
    }

    const storeName = document.getElementById('storeName').value;
    const whatsappNumber = document.getElementById('whatsappNumber').value;

    // Check if user already has a store (using userId from userSession)
    const existingStore = allStores.find(store => store.userId === userSession.id);
    if (existingStore) {
        alert(`You already have a store: "${existingStore.name}". Redirecting to your dashboard.`);
        window.location.href = 'dashboard.html';
        return;
    }

    // Basic WhatsApp number validation (starts with +, then digits)
    if (!/^\+\d+$/.test(whatsappNumber)) {
        alert('Invalid WhatsApp number format. It must start with a + and include the country code (e.g., +1234567890).');
        return;
    }


    const newStore = {
        id: `store_${userSession.id}_${Date.now()}`, // More unique store ID
        userId: userSession.id,
        name: storeName,
        whatsappNumber: whatsappNumber
    };

    allStores.push(newStore); // Add to in-memory array
    // Simulate persistence for this user's store for the session
    localStorage.setItem('user_store_' + userSession.id, JSON.stringify(newStore));

    alert('Store created successfully! Redirecting to your dashboard.');
    window.location.href = 'dashboard.html';
}

function displayDashboard() {
    const dashboardContent = document.getElementById('dashboard-content');
    if (!dashboardContent) return;

    if (!userSession) { // Should be caught by initApp redirect, but defensive check
        dashboardContent.innerHTML = '<p class="text-red-500 text-center">You are not logged in.</p>';
        return;
    }

    // Try to find store from localStorage first (session created), then from allStores (pre-existing)
    let userStore = JSON.parse(localStorage.getItem('user_store_' + userSession.id));
    if (!userStore) {
        userStore = allStores.find(store => store.userId === userSession.id);
    }

    if (userStore) {
        dashboardContent.innerHTML = `
            <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Welcome to ${userStore.name} Dashboard</h2>
            <div class="space-y-6">
                <div>
                    <h3 class="text-xl font-semibold text-gray-700 mb-2">Store Details</h3>
                    <p class="text-md"><span class="font-semibold">Store Name:</span> ${userStore.name}</p>
                    <div class="mt-2">
                        <label for="storeWhatsappNumber" class="block text-md font-semibold text-gray-700">WhatsApp Number:</label>
                        <div class="mt-1 flex rounded-md shadow-sm">
                            <input type="tel" id="storeWhatsappNumber" value="${userStore.whatsappNumber || ''}" class="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 p-2">
                            <button id="updateWhatsappBtn" class="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                                Update
                            </button>
                        </div>
                         <p class="text-xs text-gray-500 mt-1">Include country code, e.g., +1234567890. This number will be used for WhatsApp order notifications.</p>
                    </div>
                </div>
                <div class="mt-8 pt-6 border-t border-gray-200">
                    <h3 class="text-xl font-semibold text-gray-700 mb-4">Store Management</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a href="dashboard-products.html" class="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 px-5 rounded-lg text-center transition duration-300 ease-in-out shadow-md hover:shadow-lg">Manage Products</a>
                        <a href="dashboard-orders.html" class="bg-green-500 hover:bg-green-700 text-white font-semibold py-3 px-5 rounded-lg text-center transition duration-300 ease-in-out shadow-md hover:shadow-lg">View Orders</a>
                    </div>
                </div>
            </div>
        `;
        // Attach event listener for the update button
        const updateBtn = document.getElementById('updateWhatsappBtn');
        if (updateBtn) {
            updateBtn.addEventListener('click', handleUpdateWhatsappSubmit);
        }
    } else {
        dashboardContent.innerHTML = `
            <h2 class="text-2xl font-semibold text-gray-800 mb-6 text-center">My Dashboard</h2>
            <p class="text-center text-gray-600 mb-6">You don't have a store yet.</p>
            <div class="text-center">
                <a href="create-store.html" class="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out text-lg">
                    Create Your Store Now
                </a>
            </div>
        `;
    }
}

// Event Listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', initApp);

// Product Management for Store Owners
function displayStoreProducts() {
    const productListContainer = document.getElementById('store-product-list');
    if (!productListContainer) return;

    if (!userSession) {
        productListContainer.innerHTML = '<p class="text-red-500 text-center">You must be logged in.</p>';
        return;
    }

    let userStore = JSON.parse(localStorage.getItem('user_store_' + userSession.id));
    if (!userStore) {
        userStore = allStores.find(store => store.userId === userSession.id);
    }

    if (!userStore) {
        productListContainer.innerHTML = '<p class="text-red-500 text-center">No store found for your account. Please create one first.</p>';
        // Optionally redirect to create-store or dashboard
        // window.location.href = 'dashboard.html';
        return;
    }

    const storeId = userStore.id;
    const productsOfStore = allProducts.filter(product => product.storeId === storeId);

    productListContainer.innerHTML = ''; // Clear current list

    if (productsOfStore.length === 0) {
        productListContainer.innerHTML = '<p class="text-gray-600 col-span-full text-center">You have not added any products to your store yet.</p>';
        return;
    }

    productsOfStore.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'bg-white p-4 shadow-md rounded-lg flex flex-col space-y-3';
        productCard.innerHTML = `
            <img src="${product.imagePlaceholderUrl || 'https://placehold.co/300x200/ccc/fff?text=Product'}" alt="${product.name}" class="w-full h-40 object-cover rounded-md mb-3">
            <h3 class="text-xl font-semibold text-gray-800">${product.name}</h3>
            <p class="text-gray-600 text-sm flex-grow">${product.description || 'No description.'}</p>
            <p class="text-lg font-bold text-blue-600 mt-auto">$${product.price.toFixed(2)}</p>
            <div class="mt-3 space-x-2">
                 <button onclick="editProduct('${product.id}')" class="text-sm bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-3 rounded-md transition duration-150">Edit</button>
                 <button onclick="deleteProduct('${product.id}')" class="text-sm bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-md transition duration-150">Delete</button>
            </div>
        `;
        productListContainer.appendChild(productCard);
    });
}

function handleAddProductFormSubmit(event) {
    event.preventDefault();
    if (!userSession) {
        alert('You must be logged in to add products.');
        return;
    }

    let userStore = JSON.parse(localStorage.getItem('user_store_' + userSession.id));
    if (!userStore) {
        userStore = allStores.find(store => store.userId === userSession.id);
    }

    if (!userStore) {
        alert('Error: Could not find your store. Please ensure you have created one.');
        // Potentially redirect to dashboard or create-store
        window.location.href = 'dashboard.html';
        return;
    }
    const storeId = userStore.id;

    const productName = document.getElementById('productName').value;
    const productDescription = document.getElementById('productDescription').value;
    const productPrice = parseFloat(document.getElementById('productPrice').value);
    let productImageUrl = document.getElementById('productImageUrl').value;

    if (!productImageUrl) {
        productImageUrl = `https://placehold.co/300x200/E0E0E0/757575?text=${encodeURIComponent(productName)}`;
    }

    if (productPrice <= 0) {
        alert('Price must be a positive value.');
        return;
    }

    const newProduct = {
        id: `prod_${userStore.id}_${Date.now()}`, // Unique ID incorporating storeId
        storeId: storeId,
        name: productName,
        description: productDescription,
        price: productPrice,
        imagePlaceholderUrl: productImageUrl
    };

    allProducts.push(newProduct); // Add to the global in-memory product list

    // Optional: Persist session-added products to localStorage for more robust simulation
    // This is a simple way; a better approach might be to update a single localStorage item
    // that holds all user-added products for their store.
    let sessionAddedProducts = JSON.parse(localStorage.getItem('session_added_products_store_' + storeId)) || [];
    sessionAddedProducts.push(newProduct);
    localStorage.setItem('session_added_products_store_' + storeId, JSON.stringify(sessionAddedProducts));


    alert(`Product "${productName}" added successfully!`);
    displayStoreProducts(); // Refresh the list
    document.getElementById('add-product-form').reset(); // Clear the form
}

// Placeholder for edit/delete functions - not part of this subtask
function editProduct(productId) {
    alert(`Edit functionality for product ${productId} is not yet implemented.`);
}
function deleteProduct(productId) {
    alert(`Delete functionality for product ${productId} is not yet implemented.`);
    // In a real app:
    // allProducts = allProducts.filter(p => p.id !== productId);
    // Update localStorage if simulating persistence
    // displayStoreProducts();
}

function displayStoreOrders() {
    const orderListContainer = document.getElementById('store-order-list');
    if (!orderListContainer) return;

    if (!userSession) {
        orderListContainer.innerHTML = '<p class="text-red-500 text-center">You must be logged in.</p>';
        return;
    }

    let userStore = JSON.parse(localStorage.getItem('user_store_' + userSession.id));
    if (!userStore) {
        userStore = allStores.find(store => store.userId === userSession.id);
    }

    if (!userStore) {
        orderListContainer.innerHTML = '<p class="text-red-500 text-center">No store found for your account.</p>';
        return;
    }

    const storeId = userStore.id;

    // Combine orders from allOrders (json loaded) and session-specific localStorage
    let sessionStoreOrders = JSON.parse(localStorage.getItem('session_orders_store_' + storeId)) || [];

    // Filter allOrders for the current storeId and then combine with session orders, ensuring no duplicates
    let combinedOrders = allOrders.filter(o => o.storeId === storeId);

    sessionStoreOrders.forEach(sessionOrder => {
        if (!combinedOrders.find(o => o.id === sessionOrder.id)) {
            combinedOrders.push(sessionOrder);
        }
    });

    // Sort by timestamp, newest first
    combinedOrders.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));


    orderListContainer.innerHTML = ''; // Clear current list

    if (combinedOrders.length === 0) {
        orderListContainer.innerHTML = '<p class="text-gray-600 text-center">You have no orders for your store yet.</p>';
        return;
    }

    combinedOrders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'bg-white p-5 shadow-md rounded-lg border border-gray-200';

        let itemsHtml = '<ul class="list-disc list-inside pl-4 text-sm text-gray-600 mt-1">';
        order.items.forEach(item => {
            itemsHtml += `<li>${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}</li>`;
        });
        itemsHtml += '</ul>';

        orderCard.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <h3 class="text-lg font-semibold text-indigo-600">Order ID: ${order.id}</h3>
                <span class="text-sm font-medium ${order.status === 'Pending Confirmation via WhatsApp' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'} py-1 px-3 rounded-full">${order.status}</span>
            </div>
            <p class="text-sm text-gray-500 mb-3">Date: ${new Date(order.timestamp || Date.now()).toLocaleString()}</p>
            <div class="mb-3">
                <p class="font-medium text-gray-700">Customer: ${order.customerName}</p>
                <p class="text-sm text-gray-600">Email: ${order.customerEmail}</p>
                <p class="text-sm text-gray-600">Address: ${order.customerAddress}</p>
            </div>
            <div class="mb-3">
                <p class="font-medium text-gray-700">Items:</p>
                ${itemsHtml}
            </div>
            <p class="text-right text-xl font-bold text-gray-800 mt-3">Total: $${order.totalAmount.toFixed(2)}</p>
            <div class="mt-4 text-right">
                <button onclick="updateOrderStatus('${order.id}', 'Confirmed')" class="text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-md transition duration-150 mr-2">Mark Confirmed</button>
                <button onclick="updateOrderStatus('${order.id}', 'Shipped')" class="text-sm bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-3 rounded-md transition duration-150">Mark Shipped</button>
            </div>
        `;
        orderListContainer.appendChild(orderCard);
    });
}

function updateOrderStatus(orderId, newStatus) {
    alert(`Order status update for ${orderId} to ${newStatus} is not fully implemented in this simulation.`);
    // In a real app:
    // Find order in allOrders or specific localStorage
    // Update its status
    // Re-save to localStorage / send to backend
    // displayStoreOrders(); // to refresh the view
}

function handleUpdateWhatsappSubmit() {
    if (!userSession) {
        alert('Error: Not logged in.');
        return;
    }
    const newWhatsappNumber = document.getElementById('storeWhatsappNumber').value;

    // Basic validation
    if (!/^\+\d{10,15}$/.test(newWhatsappNumber)) {
        alert('Invalid WhatsApp number format. Please use format like +1234567890 (10-15 digits after +).');
        return;
    }

    let userStore = JSON.parse(localStorage.getItem('user_store_' + userSession.id));
    if (!userStore) {
        userStore = allStores.find(store => store.userId === userSession.id);
    }

    if (userStore) {
        userStore.whatsappNumber = newWhatsappNumber;
        // Update in allStores array (if it's the same object reference)
        const storeIndexInAllStores = allStores.findIndex(s => s.id === userStore.id);
        if (storeIndexInAllStores > -1) {
            allStores[storeIndexInAllStores].whatsappNumber = newWhatsappNumber;
        }
        // Update in localStorage for session persistence
        localStorage.setItem('user_store_' + userSession.id, JSON.stringify(userStore));
        alert('WhatsApp number updated successfully (for this session).');
    } else {
        alert('Error: Could not find your store to update.');
    }
}
