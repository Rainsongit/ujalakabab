// // assets/js/cart.js
// // Simple cart + checkout review, stored in localStorage

// // assets/js/cart.js
// // Cart + Stripe Checkout, stored in localStorage

// (function () {
//   const cartKey = "ujala_kabab_cart_v1";

//   let cart = [];

//   const cartBtn = document.getElementById("cart-btn");
//   const cartOverlay = document.getElementById("cart-overlay");
//   const cartPanel = document.getElementById("cart-panel");
//   const cartCloseBtn = document.getElementById("cart-close-btn");
//   const cartItemsEl = document.getElementById("cart-items");
//   const cartSubtotalEl = document.getElementById("cart-subtotal");
//   const cartCountEl = document.getElementById("cart-count");
//   const checkoutBtn = document.getElementById("checkout-btn");
//   const addToCartButtons = document.querySelectorAll(".add-to-cart");

//   // If this page doesn't have cart UI, do nothing
//   if (
//     !cartBtn ||
//     !cartOverlay ||
//     !cartPanel ||
//     !cartCloseBtn ||
//     !cartItemsEl ||
//     !cartSubtotalEl ||
//     !cartCountEl
//   ) {
//     return;
//   }

//   function loadCart() {
//     try {
//       const raw = localStorage.getItem(cartKey);
//       cart = raw ? JSON.parse(raw) : [];
//     } catch (e) {
//       console.error("Error loading cart from localStorage:", e);
//       cart = [];
//     }
//   }

//   function saveCart() {
//     try {
//       localStorage.setItem(cartKey, JSON.stringify(cart));
//     } catch (e) {
//       console.error("Error saving cart to localStorage:", e);
//     }
//   }

//   function formatPrice(num) {
//     return "$" + num.toFixed(2);
//   }

//   function getSubtotal() {
//     return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
//   }

//   function getItemCount() {
//     return cart.reduce((sum, item) => sum + item.quantity, 0);
//   }

//   function renderCart() {
//     cartItemsEl.innerHTML = "";

//     if (cart.length === 0) {
//       cartItemsEl.innerHTML = '<li class="body-4">Your cart is empty.</li>';
//     } else {
//       cart.forEach((item, index) => {
//         const li = document.createElement("li");
//         li.className = "cart-item";
//         li.innerHTML = `
//           <div class="cart-item-details">
//             <div class="cart-item-name">${item.name}</div>
//             <div class="cart-item-meta">${formatPrice(item.price)} each</div>
//           </div>
//           <div class="cart-item-actions">
//             <div class="cart-qty-controls">
//               <button class="cart-qty-btn" data-action="decrease" data-index="${index}">-</button>
//               <span class="cart-qty-value">${item.quantity}</span>
//               <button class="cart-qty-btn" data-action="increase" data-index="${index}">+</button>
//             </div>
//             <div class="cart-item-meta">${formatPrice(item.price * item.quantity)}</div>
//             <button class="cart-remove-btn" data-index="${index}">Remove</button>
//           </div>
//         `;
//         cartItemsEl.appendChild(li);
//       });
//     }

//     cartSubtotalEl.textContent = formatPrice(getSubtotal());
//     cartCountEl.textContent = getItemCount();
//   }

//   function openCart() {
//     cartOverlay.classList.add("open");
//     cartPanel.classList.add("open");
//   }

//   function closeCart() {
//     cartOverlay.classList.remove("open");
//     cartPanel.classList.remove("open");
//   }

//   // Open / close
//   cartBtn.addEventListener("click", function (e) {
//     e.preventDefault();
//     openCart();
//   });

//   cartCloseBtn.addEventListener("click", closeCart);
//   cartOverlay.addEventListener("click", closeCart);

//   // Add to cart buttons
//   addToCartButtons.forEach((btn) => {
//     btn.addEventListener("click", function () {
//       const id = this.dataset.id;
//       const name = this.dataset.name;
//       const price = parseFloat(this.dataset.price ?? "0");

//       // Allow price 0, only reject if NaN
//       if (!id || !name || Number.isNaN(price)) {
//         console.warn("Invalid cart item data:", { id, name, price: this.dataset.price });
//         return;
//       }

//       const existing = cart.find((item) => item.id === id);
//       if (existing) {
//         existing.quantity += 1;
//       } else {
//         cart.push({
//           id,
//           name,
//           price,
//           quantity: 1,
//         });
//       }

//       saveCart();
//       renderCart();
//       openCart();
//     });
//   });

//   // Quantity change & remove
//   cartItemsEl.addEventListener("click", function (e) {
//     const target = e.target;

//     if (target.classList.contains("cart-qty-btn")) {
//       const index = parseInt(target.dataset.index, 10);
//       const action = target.dataset.action;
//       const item = cart[index];
//       if (!item) return;

//       if (action === "increase") {
//         item.quantity += 1;
//       } else if (action === "decrease") {
//         item.quantity -= 1;
//         if (item.quantity <= 0) {
//           cart.splice(index, 1);
//         }
//       }

//       saveCart();
//       renderCart();
//     }

//     if (target.classList.contains("cart-remove-btn")) {
//       const index = parseInt(target.dataset.index, 10);
//       if (!Number.isNaN(index)) {
//         cart.splice(index, 1);
//         saveCart();
//         renderCart();
//       }
//     }
//   });

//   // Checkout → send cart to backend (Stripe)
//   if (checkoutBtn) {
//     checkoutBtn.addEventListener("click", async function () {
//       if (cart.length === 0) {
//         alert("Your cart is empty.");
//         return;
//       }

//       try {
//         const response = await fetch("/create-checkout-session", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ items: cart }),
//         });

//         if (!response.ok) {
//           alert("Could not start checkout. Please try again or call the restaurant.");
//           return;
//         }

//         const data = await response.json();

//         if (data.url) {
//           window.location = data.url; // Stripe Checkout
//         } else {
//           alert("Something went wrong with checkout.");
//         }
//       } catch (err) {
//         console.error("Checkout error:", err);
//         alert("Unable to connect to payment server. Please try again later.");
//       }
//     });
//   }

//   // Init
//   loadCart();
//   renderCart();
// })();





// (function () {
//   const cartKey = "ujala_kabab_cart_v1";

//   let cart = [];

//   const cartBtn = document.getElementById("cart-btn");
//   const cartOverlay = document.getElementById("cart-overlay");
//   const cartPanel = document.getElementById("cart-panel");
//   const cartCloseBtn = document.getElementById("cart-close-btn");
//   const cartItemsEl = document.getElementById("cart-items");
//   const cartSubtotalEl = document.getElementById("cart-subtotal");
//   const cartCountEl = document.getElementById("cart-count");
//   const checkoutBtn = document.getElementById("checkout-btn");

//   // If this page doesn't have cart UI, do nothing
//   if (
//     !cartBtn ||
//     !cartOverlay ||
//     !cartPanel ||
//     !cartCloseBtn ||
//     !cartItemsEl ||
//     !cartSubtotalEl ||
//     !cartCountEl
//   ) {
//     return;
//   }

//   function loadCart() {
//     try {
//       const raw = localStorage.getItem(cartKey);
//       cart = raw ? JSON.parse(raw) : [];
//     } catch (e) {
//       console.error("Error loading cart from localStorage:", e);
//       cart = [];
//     }
//   }

//   function saveCart() {
//     try {
//       localStorage.setItem(cartKey, JSON.stringify(cart));
//     } catch (e) {
//       console.error("Error saving cart to localStorage:", e);
//     }
//   }

//   function formatPrice(num) {
//     return "$" + num.toFixed(2);
//   }

//   function getSubtotal() {
//     return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
//   }

//   function getItemCount() {
//     return cart.reduce((sum, item) => sum + item.quantity, 0);
//   }

//   function renderCart() {
//     cartItemsEl.innerHTML = "";

//     if (cart.length === 0) {
//       cartItemsEl.innerHTML = '<li class="body-4">Your cart is empty.</li>';
//     } else {
//       cart.forEach((item, index) => {
//         const li = document.createElement("li");
//         li.className = "cart-item";
//         li.innerHTML = `
//           <div class="cart-item-details">
//             <div class="cart-item-name">${item.name}</div>
//             <div class="cart-item-meta">${formatPrice(item.price)} each</div>
//           </div>
//           <div class="cart-item-actions">
//             <div class="cart-qty-controls">
//               <button class="cart-qty-btn" data-action="decrease" data-index="${index}">-</button>
//               <span class="cart-qty-value">${item.quantity}</span>
//               <button class="cart-qty-btn" data-action="increase" data-index="${index}">+</button>
//             </div>
//             <div class="cart-item-meta">${formatPrice(item.price * item.quantity)}</div>
//             <button class="cart-remove-btn" data-index="${index}">Remove</button>
//           </div>
//         `;
//         cartItemsEl.appendChild(li);
//       });
//     }

//     cartSubtotalEl.textContent = formatPrice(getSubtotal());
//     cartCountEl.textContent = getItemCount();
//   }

//   function openCart() {
//     cartOverlay.classList.add("open");
//     cartPanel.classList.add("open");
//   }

//   function closeCart() {
//     cartOverlay.classList.remove("open");
//     cartPanel.classList.remove("open");
//   }

//   // Open / close
//   cartBtn.addEventListener("click", function (e) {
//     e.preventDefault();
//     openCart();
//   });

//   cartCloseBtn.addEventListener("click", closeCart);
//   cartOverlay.addEventListener("click", closeCart);

//   // ========= ADD TO CART (WORKS WITH DYNAMIC BUTTONS) =========
//   // Use event delegation so it also works for items injected by loadMenu()
//   document.addEventListener("click", function (e) {
//     const btn = e.target.closest(".add-to-cart");
//     if (!btn) return;

//     const id = btn.dataset.id;
//     const name = btn.dataset.name;
//     const price = parseFloat(btn.dataset.price ?? "0");

//     // Allow price 0, only reject if NaN
//     if (!id || !name || Number.isNaN(price)) {
//       console.warn("Invalid cart item data:", { id, name, price: btn.dataset.price });
//       return;
//     }

//     const existing = cart.find((item) => item.id === id);
//     if (existing) {
//       existing.quantity += 1;
//     } else {
//       cart.push({
//         id,
//         name,
//         price,
//         quantity: 1,
//       });
//     }

//     saveCart();
//     renderCart();
//     openCart();
//   });

//   // Quantity change & remove
//   cartItemsEl.addEventListener("click", function (e) {
//     const target = e.target;

//     if (target.classList.contains("cart-qty-btn")) {
//       const index = parseInt(target.dataset.index, 10);
//       const action = target.dataset.action;
//       const item = cart[index];
//       if (!item) return;

//       if (action === "increase") {
//         item.quantity += 1;
//       } else if (action === "decrease") {
//         item.quantity -= 1;
//         if (item.quantity <= 0) {
//           cart.splice(index, 1);
//         }
//       }

//       saveCart();
//       renderCart();
//     }

//     if (target.classList.contains("cart-remove-btn")) {
//       const index = parseInt(target.dataset.index, 10);
//       if (!Number.isNaN(index)) {
//         cart.splice(index, 1);
//         saveCart();
//         renderCart();
//       }
//     }
//   });

//   // Checkout → send cart to backend (Stripe)
//   if (checkoutBtn) {
//     checkoutBtn.addEventListener("click", async function () {
//       if (cart.length === 0) {
//         alert("Your cart is empty.");
//         return;
//       }

//       try {
//         const response = await fetch("/create-checkout-session", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ items: cart }),
//         });

//         if (!response.ok) {
//           alert("Could not start checkout. Please try again or call the restaurant.");
//           return;
//         }

//         const data = await response.json();

//         if (data.url) {
//           window.location = data.url; // Stripe Checkout
//         } else {
//           alert("Something went wrong with checkout.");
//         }
//       } catch (err) {
//         console.error("Checkout error:", err);
//         alert("Unable to connect to payment server. Please try again later.");
//       }
//     });
//   }

//   // Init
//   loadCart();
//   renderCart();
// })();




// assets/js/cart.js
(function () {
  const cartKey = "ujala_kabab_cart_v1";
  localStorage.removeItem(cartKey);
  let cart = [];

  const cartBtn = document.getElementById("cart-btn");
  const cartOverlay = document.getElementById("cart-overlay");
  const cartPanel = document.getElementById("cart-panel");
  const cartCloseBtn = document.getElementById("cart-close-btn");
  const cartItemsEl = document.getElementById("cart-items");
  const cartSubtotalEl = document.getElementById("cart-subtotal");
  const cartCountEl = document.getElementById("cart-count");
  const checkoutBtn = document.getElementById("checkout-btn");

  // If this page doesn't have cart UI, do nothing
  if (
    !cartBtn ||
    !cartOverlay ||
    !cartPanel ||
    !cartCloseBtn ||
    !cartItemsEl ||
    !cartSubtotalEl ||
    !cartCountEl
  ) {
    return;
  }

  function loadCart() {
    try {
      const raw = localStorage.getItem(cartKey);
      cart = raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Error loading cart from localStorage:", e);
      cart = [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(cartKey, JSON.stringify(cart));
    } catch (e) {
      console.error("Error saving cart to localStorage:", e);
    }
  }

  function formatPrice(num) {
    return "$" + num.toFixed(2);
  }

  function getSubtotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  function getItemCount() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  function renderCart() {
    cartItemsEl.innerHTML = "";

    if (cart.length === 0) {
      cartItemsEl.innerHTML = '<li class="body-4">Your cart is empty.</li>';
    } else {
      cart.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = "cart-item";
        li.innerHTML = `
          <div class="cart-item-details">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-meta">${formatPrice(item.price)} each</div>
          </div>
          <div class="cart-item-actions">
            <div class="cart-qty-controls">
              <button class="cart-qty-btn" data-action="decrease" data-index="${index}">-</button>
              <span class="cart-qty-value">${item.quantity}</span>
              <button class="cart-qty-btn" data-action="increase" data-index="${index}">+</button>
            </div>
            <div class="cart-item-meta">${formatPrice(item.price * item.quantity)}</div>
            <button class="cart-remove-btn" data-index="${index}">Remove</button>
          </div>
        `;
        cartItemsEl.appendChild(li);
      });
    }

    cartSubtotalEl.textContent = formatPrice(getSubtotal());
    cartCountEl.textContent = getItemCount();
  }

  function openCart() {
    cartOverlay.classList.add("open");
    cartPanel.classList.add("open");
  }

  function closeCart() {
    cartOverlay.classList.remove("open");
    cartPanel.classList.remove("open");
  }

  // Open / close
  cartBtn.addEventListener("click", function (e) {
    e.preventDefault();
    openCart();
  });

  cartCloseBtn.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);

  // 🔥 UNIVERSAL ADD-TO-CART HANDLER (works for catering + normal menu)
  // Uses event delegation so *any* .add-to-cart button on the page works
  document.addEventListener("click", function (e) {
    const btn = e.target.closest(".add-to-cart");
    if (!btn) return; // not an add-to-cart click

    const id = btn.dataset.id;
    const name = btn.dataset.name;
    const price = parseFloat(btn.dataset.price ?? "0");

    if (!id || !name || Number.isNaN(price)) {
      console.warn("Invalid cart item data:", { id, name, price: btn.dataset.price });
      return;
    }

    const existing = cart.find((item) => item.id === id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id,
        name,
        price,
        quantity: 1,
      });
    }

    saveCart();
    renderCart();
    openCart();
  });

  // Quantity change & remove
  cartItemsEl.addEventListener("click", function (e) {
    const target = e.target;

    if (target.classList.contains("cart-qty-btn")) {
      const index = parseInt(target.dataset.index, 10);
      const action = target.dataset.action;
      const item = cart[index];
      if (!item) return;

      if (action === "increase") {
        item.quantity += 1;
      } else if (action === "decrease") {
        item.quantity -= 1;
        if (item.quantity <= 0) {
          cart.splice(index, 1);
        }
      }

      saveCart();
      renderCart();
    }

    if (target.classList.contains("cart-remove-btn")) {
      const index = parseInt(target.dataset.index, 10);
      if (!Number.isNaN(index)) {
        cart.splice(index, 1);
        saveCart();
        renderCart();
      }
    }
  });

  // Checkout → send cart to backend (Stripe)
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", async function () {
      if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
      }

      try {
        const response = await fetch("/create-checkout-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ items: cart }),
        });

        if (!response.ok) {
          alert("Could not start checkout. Please try again or call the restaurant.");
          return;
        }

        const data = await response.json();

        if (data.url) {
          window.location = data.url; // Stripe Checkout
        } else {
          alert("Something went wrong with checkout.");
        }
      } catch (err) {
        console.error("Checkout error:", err);
        alert("Unable to connect to payment server. Please try again later.");
      }
    });
  }

  // Init
  loadCart();
  renderCart();
})();
