/**
 * Utility functions for managing shopping cart operations using localStorage
 */

/**
 * Generates a unique storage key for cart items based on user ID
 * @param {string} userId - The user's ID (uses 'guest' if not provided)
 * @returns {string} The storage key for the cart
 */
const getCartStorageKey = (userId) => `medcare_cart_${userId || 'guest'}`;

/**
 * Retrieves all items from the cart in localStorage
 * @param {string} userId - The user's ID
 * @returns {Array} Array of cart items
 */
export const getCartItems = (userId) => {
    const cartItems = localStorage.getItem(getCartStorageKey(userId));
    return cartItems ? JSON.parse(cartItems) : [];
};

/**
 * Calculates the total number of items in the cart
 * @param {string} userId - The user's ID
 * @returns {number} Total quantity of all items in cart
 */
export const getCartCount = (userId) => {
    const cartItems = getCartItems(userId);
    return cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
};

/**
 * Adds a product to the cart or increases its quantity if already present
 * @param {Object} product - The product to add
 * @param {string} userId - The user's ID
 * @throws {Error} If product is out of stock or quantity limit exceeded
 * @returns {Array} Updated cart items
 */
export const addToCart = (product, userId) => {
    const cartItems = getCartItems(userId);
    const existingItem = cartItems.find(item => item._id === product._id);

    if (existingItem) {
        // Check if adding one more would exceed available quantity
        if ((existingItem.quantity || 1) + 1 > product.quantity) {
            throw new Error('Cannot add more items than available quantity');
        }
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        // Check if product has available quantity
        if (product.quantity < 1) {
            throw new Error('Product is out of stock');
        }
        // Add new item to cart with initial quantity of 1
        cartItems.push({
            _id: product._id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image,
            brand: product.brand,
            category: product.category,
            prescriptionRequired: product.prescriptionRequired,
            expiryDate: product.expiryDate,
            availableQuantity: product.quantity // Store available quantity
        });
    }

    localStorage.setItem(getCartStorageKey(userId), JSON.stringify(cartItems));
    // Dispatch cart update event
    window.dispatchEvent(new CustomEvent('cartUpdate'));
    return cartItems;
};

/**
 * Updates the quantity of a specific item in the cart
 * @param {string} productId - ID of the product to update
 * @param {number} quantity - New quantity value
 * @param {number} availableQuantity - Maximum available quantity
 * @param {string} userId - The user's ID
 * @throws {Error} If quantity exceeds available stock
 * @returns {Array} Updated cart items
 */
export const updateCartItemQuantity = (productId, quantity, availableQuantity, userId) => {
    if (quantity < 1) return getCartItems(userId);
    if (quantity > availableQuantity) {
        throw new Error('Cannot add more items than available quantity');
    }

    const cartItems = getCartItems(userId);
    const updatedItems = cartItems.map(item =>
        item._id === productId ? { ...item, quantity: quantity } : item
    );

    localStorage.setItem(getCartStorageKey(userId), JSON.stringify(updatedItems));
    // Dispatch cart update event
    window.dispatchEvent(new CustomEvent('cartUpdate'));
    return updatedItems;
};

/**
 * Removes a specific item from the cart
 * @param {string} productId - ID of the product to remove
 * @param {string} userId - The user's ID
 * @returns {Array} Updated cart items
 */
export const removeFromCart = (productId, userId) => {
    const cartItems = getCartItems(userId);
    const updatedItems = cartItems.filter(item => item._id !== productId);
    localStorage.setItem(getCartStorageKey(userId), JSON.stringify(updatedItems));
    // Dispatch cart update event
    window.dispatchEvent(new CustomEvent('cartUpdate'));
    return updatedItems;
};

/**
 * Clears all items from the cart
 * @param {string} userId - The user's ID
 * @returns {Array} Empty array
 */
export const clearCart = (userId) => {
    localStorage.removeItem(getCartStorageKey(userId));
    // Dispatch cart update event
    window.dispatchEvent(new CustomEvent('cartUpdate'));
    return [];
};

/**
 * Calculates the total price of all items in the cart
 * @param {string} userId - The user's ID
 * @returns {number} Total price of all items
 */
export const getCartTotal = (userId) => {
    const cartItems = getCartItems(userId);
    return cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
};

/**
 * Gets the quantity of a specific item in the cart
 * @param {string} productId - ID of the product to check
 * @param {string} userId - The user's ID
 * @returns {number} Quantity of the specified item (0 if not found)
 */
export const getCartItemQuantity = (productId, userId) => {
    const cartItems = getCartItems(userId);
    const item = cartItems.find(item => item._id === productId);
    return item ? (item.quantity || 1) : 0;
}; 