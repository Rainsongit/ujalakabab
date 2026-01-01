// // server.js
// require("dotenv").config();

// const express = require("express");
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// const path = require("path");
// const cors = require("cors");

// const app = express();
// const PORT = process.env.PORT || 4242;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Serve static files (your current website)
// app.use(express.static(path.join(__dirname)));

// // Helper: sanitize and map items coming from frontend cart
// function buildLineItems(items) {
//   // In a real production app, DO NOT trust price from client.
//   // Instead, map item.id to server-side price.
//   // For now, we use the passed price for demo.
//   return items.map((item) => {
//     const price = typeof item.price === "string"
//       ? parseFloat(item.price)
//       : item.price;

//     return {
//       price_data: {
//         currency: "usd",
//         product_data: {
//           name: item.name,
//         },
//         unit_amount: Math.round(price * 100), // dollars -> cents
//       },
//       quantity: item.quantity,
//     };
//   });
// }

// // Create Checkout Session
// app.post("/create-checkout-session", async (req, res) => {
//   try {
//     const items = req.body.items;

//     if (!items || !Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({ error: "No items in cart" });
//     }

//     const lineItems = buildLineItems(items);

//     const session = await stripe.checkout.sessions.create({
//       mode: "payment",
//       payment_method_types: ["card"],
//       line_items: lineItems,
//       success_url: `${process.env.BASE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.BASE_URL}/cancel.html`,
//       billing_address_collection: "required",
//       phone_number_collection: {
//         enabled: true,
//       },
//       metadata: {
//         source: "ujala_kabab_website",
//       },
//     });

//     res.json({ url: session.url });
//   } catch (err) {
//     console.error("Error creating checkout session:", err);
//     res.status(500).json({ error: "Failed to create checkout session" });
//   }
// });

// // Fallback: serve index.html for root (optional, since static already)
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "index.html"));
// });

// app.listen(PORT, () => {
//   console.log(`Server listening on port ${PORT}`);
// });


// server.js
// require("dotenv").config();

// const express = require("express");
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// const path = require("path");
// const cors = require("cors");
// const nodemailer = require("nodemailer");

// const app = express();
// const PORT = process.env.PORT || 4242;
// // ---------- DEBUG HOOKS TO CATCH ERRORS ----------
// process.on("exit", (code) => {
//     console.log("Node process exiting with code:", code);
//   });
  
//   process.on("uncaughtException", (err) => {
//     console.error("UNCAUGHT EXCEPTION:", err);
//   });
  
//   process.on("unhandledRejection", (reason, promise) => {
//     console.error("UNHANDLED REJECTION:", reason);
//   });
  

// // ---------- EMAIL TRANSPORT (Gmail SMTP) ----------
// const mailTransport = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: parseInt(process.env.SMTP_PORT || "587", 10),
//   secure: false, // TLS with STARTTLS
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

// // ---------- WEBHOOK (MUST COME BEFORE express.json) ----------
// app.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   async (req, res) => {
//     const sig = req.headers["stripe-signature"];
//     const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

//     let event;

//     try {
//       event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//     } catch (err) {
//       console.error("Webhook signature verification failed:", err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     // When checkout is paid
//     if (event.type === "checkout.session.completed") {
//       const session = event.data.object;

//       try {
//         // Get line items of this checkout session
//         const lineItems = await stripe.checkout.sessions.listLineItems(
//           session.id,
//           { limit: 100 }
//         );

//         const order = buildOrderFromSession(session, lineItems);

//         await sendOrderEmailToOwner(order);

//         console.log("Order email sent for session:", session.id);
//       } catch (err) {
//         console.error("Error handling checkout.session.completed:", err);
//       }
//     }

//     res.json({ received: true });
//   }
// );

// // ---------- NORMAL MIDDLEWARE / STATIC ----------
// app.use(cors());
// app.use(express.json());

// // Serve static files (index.html, catering.html, assets, etc.)
// app.use(express.static(path.join(__dirname)));

// // ---------- HELPERS ----------

// function buildOrderFromSession(session, lineItems) {
//   const items = lineItems.data.map((item) => ({
//     name: item.description,
//     quantity: item.quantity,
//     // amount_total is per line; fallback to amount_subtotal if needed
//     amount: (item.amount_total || item.amount_subtotal || 0) / 100,
//   }));

//   const total = (session.amount_total || 0) / 100;

//   const shipping = session.shipping_details || {};
//   const customer = session.customer_details || {};

//   const addressObj = shipping.address || customer.address || {};
//   const addressParts = [
//     addressObj.line1,
//     addressObj.line2,
//     addressObj.city,
//     addressObj.state,
//     addressObj.postal_code,
//   ].filter(Boolean);

//   const address = addressParts.join(", ");

//   return {
//     orderId: session.id,
//     paymentStatus: session.payment_status,
//     items,
//     total,
//     customerName: shipping.name || customer.name || "Customer",
//     customerEmail: customer.email || "",
//     customerPhone:
//       (shipping.phone || customer.phone || "").replace("undefined", "") || "",
//     address,
//   };
// }

// async function sendOrderEmailToOwner(order) {
//   const ownerEmail = process.env.OWNER_EMAIL;
//   if (!ownerEmail) {
//     console.warn("OWNER_EMAIL not set in .env — cannot send order email.");
//     return;
//   }

//   const subject = `New Ujala Kabab Order - ${order.orderId}`;
//   const itemLines = order.items
//     .map(
//       (item) =>
//         `${item.name} x ${item.quantity} = $${item.amount.toFixed(2)}`
//     )
//     .join("\n");

//   const textBody = `
// New order received for Ujala Kabab

// Order ID: ${order.orderId}
// Payment Status: ${order.paymentStatus}

// Customer: ${order.customerName}
// Email: ${order.customerEmail || "N/A"}
// Phone: ${order.customerPhone || "N/A"}

// Delivery Address:
// ${order.address || "N/A"}

// Items:
// ${itemLines}

// Total: $${order.total.toFixed(2)}

// Please start preparing this order.
//   `.trim();

//   await mailTransport.sendMail({
//     from: `"Ujala Kabab Orders" <${process.env.SMTP_USER}>`,
//     to: ownerEmail,
//     subject,
//     text: textBody,
//   });
// }

// // ---------- BUILD LINE ITEMS FOR CHECKOUT (from cart.js items) ----------

// function buildLineItems(items) {
//   return items.map((item) => {
//     const price =
//       typeof item.price === "string" ? parseFloat(item.price) : item.price;

//     return {
//       price_data: {
//         currency: "usd",
//         product_data: {
//           name: item.name,
//         },
//         unit_amount: Math.round(price * 100),
//       },
//       quantity: item.quantity,
//     };
//   });
// }

// // ---------- CREATE CHECKOUT SESSION ----------
// app.post("/create-checkout-session", async (req, res) => {
//   try {
//     const items = req.body.items;

//     if (!items || !Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({ error: "No items in cart" });
//     }

//     const lineItems = buildLineItems(items);

//     const session = await stripe.checkout.sessions.create({
//       mode: "payment",
//       payment_method_types: ["card"],
//       line_items: lineItems,
//       success_url: `${process.env.BASE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.BASE_URL}/cancel.html`,
//       billing_address_collection: "required",
//       shipping_address_collection: {
//         allowed_countries: ["US"],
//       },
//       phone_number_collection: {
//         enabled: true,
//       },
//       metadata: {
//         source: "ujala_kabab_website",
//       },
//     });

//     res.json({ url: session.url });
//   } catch (err) {
//     console.error("Error creating checkout session:", err);
//     res.status(500).json({ error: "Failed to create checkout session" });
//   }
// });

// // ---------- ROOT ROUTE ----------
// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, "index.html"));
//   });
  
//   // Simple test route
//   app.get("/ping", (req, res) => {
//     res.send("Server is alive 🚀");
//   });
  
//   const server = app.listen(PORT, () => {
//     console.log(`Server listening on port ${PORT}`);
//   });
  
//   server.on("error", (err) => {
//     console.error("HTTP server error:", err);
//   });
  



// server.js
// require("dotenv").config();

// const express = require("express");
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// const path = require("path");
// const cors = require("cors");
// const nodemailer = require("nodemailer");

// const app = express();
// const PORT = process.env.PORT || 4242;
// /* ---------------------------------------------------
//    PROCESS LOGGING (to see crashes / port issues)
// --------------------------------------------------- */
// process.on("exit", (code) => {
//   console.log("Node process exiting with code:", code);
// });

// process.on("uncaughtException", (err) => {
//   console.error("UNCAUGHT EXCEPTION:", err);
// });

// process.on("unhandledRejection", (reason, promise) => {
//   console.error("UNHANDLED REJECTION:", reason);
// });

// /* ---------------------------------------------------
//    EMAIL TRANSPORT (Gmail SMTP via Nodemailer)
// --------------------------------------------------- */
// // Uses environment variables:
// // SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
// const mailTransport = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: parseInt(process.env.SMTP_PORT || "587", 10),
//   secure: false, // STARTTLS on 587
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

// /* ---------------------------------------------------
//    STRIPE WEBHOOK (must be BEFORE express.json)
//    URL: POST /webhook
// --------------------------------------------------- */
// app.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   async (req, res) => {
//     const sig = req.headers["stripe-signature"];
//     const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

//     let event;

//     try {
//       event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//     } catch (err) {
//       console.error("Webhook signature verification failed:", err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     // Handle successful checkout
//     if (event.type === "checkout.session.completed") {
//       const session = event.data.object;

//       try {
//         // Get line items from this checkout session
//         const lineItems = await stripe.checkout.sessions.listLineItems(
//           session.id,
//           { limit: 100 }
//         );

//         const order = buildOrderFromSession(session, lineItems);

//         await sendOrderEmailToOwner(order);

//         console.log("✅ Order email sent for session:", session.id);
//       } catch (err) {
//         console.error("Error handling checkout.session.completed:", err);
//       }
//     }

//     res.json({ received: true });
//   }
// );

// /* ---------------------------------------------------
//    NORMAL MIDDLEWARE & STATIC FILES
// --------------------------------------------------- */
// app.use(cors());
// // Important: after /webhook which uses express.raw
// app.use(express.json());

// // Serve your static site (index.html, assets, etc.)
// app.use(express.static(path.join(__dirname)));

// /* ---------------------------------------------------
//    HELPER: Build Order Object from Stripe Session
// --------------------------------------------------- */
// function buildOrderFromSession(session, lineItems) {
//   const items = lineItems.data.map((item) => ({
//     name: item.description,
//     quantity: item.quantity,
//     amount: (item.amount_total || item.amount_subtotal || 0) / 100,
//   }));

//   const total = (session.amount_total || 0) / 100;

//   const shipping = session.shipping_details || {};
//   const customer = session.customer_details || {};

//   const addressObj = shipping.address || customer.address || {};
//   const addressParts = [
//     addressObj.line1,
//     addressObj.line2,
//     addressObj.city,
//     addressObj.state,
//     addressObj.postal_code,
//   ].filter(Boolean);

//   const address = addressParts.join(", ");

//   return {
//     orderId: session.id,
//     paymentStatus: session.payment_status,
//     items,
//     total,
//     customerName: shipping.name || customer.name || "Customer",
//     customerEmail: customer.email || "",
//     customerPhone:
//       (shipping.phone || customer.phone || "").replace("undefined", "") || "",
//     address,
//   };
// }

// /* ---------------------------------------------------
//    HELPER: Send Order Email To Restaurant Owner
// --------------------------------------------------- */
// async function sendOrderEmailToOwner(order) {
//   const ownerEmail = process.env.OWNER_EMAIL;
//   if (!ownerEmail) {
//     console.warn("OWNER_EMAIL not set in .env — cannot send order email.");
//     return;
//   }

//   const subject = `New Ujala Kabab Order - ${order.orderId}`;

//   const itemLines = order.items
//     .map(
//       (item) =>
//         `${item.name} x ${item.quantity} = $${item.amount.toFixed(2)}`
//     )
//     .join("\n");

//   const textBody = `
// New order received for Ujala Kabab

// Order ID: ${order.orderId}
// Payment Status: ${order.paymentStatus}

// Customer: ${order.customerName}
// Email: ${order.customerEmail || "N/A"}
// Phone: ${order.customerPhone || "N/A"}

// Delivery Address:
// ${order.address || "N/A"}

// Items:
// ${itemLines}

// Total: $${order.total.toFixed(2)}

// Please start preparing this order.
//   `.trim();

//   await mailTransport.sendMail({
//     from: `"Ujala Kabab Orders" <${process.env.SMTP_USER}>`,
//     to: ownerEmail,
//     subject,
//     text: textBody,
//   });
// }

// /* ---------------------------------------------------
//    HELPER: Build Stripe line_items from cart.js items
// --------------------------------------------------- */
// function buildLineItems(items) {
//   return items.map((item) => {
//     const price =
//       typeof item.price === "string" ? parseFloat(item.price) : item.price;

//     return {
//       price_data: {
//         currency: "usd",
//         product_data: {
//           name: item.name,
//         },
//         unit_amount: Math.round(price * 100),
//       },
//       quantity: item.quantity,
//     };
//   });
// }

// /* ---------------------------------------------------
//    CREATE CHECKOUT SESSION (called from cart.js)
//    URL: POST /create-checkout-session
// --------------------------------------------------- */
// app.post("/create-checkout-session", async (req, res) => {
//   try {
//     const items = req.body.items;

//     if (!items || !Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({ error: "No items in cart" });
//     }

//     const lineItems = buildLineItems(items);

//     const session = await stripe.checkout.sessions.create({
//       mode: "payment",
//       payment_method_types: ["card"],
//       line_items: lineItems,
//       success_url: `${process.env.BASE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.BASE_URL}/cancel.html`,
//       billing_address_collection: "required",
//       shipping_address_collection: {
//         allowed_countries: ["US"],
//       },
//       phone_number_collection: {
//         enabled: true,
//       },
//       metadata: {
//         source: "ujala_kabab_website",
//       },
//     });

//     res.json({ url: session.url });
//   } catch (err) {
//     console.error("Error creating checkout session:", err);
//     res.status(500).json({ error: "Failed to create checkout session" });
//   }
// });

// /* ---------------------------------------------------
//    ROOT ROUTE (index.html)
// --------------------------------------------------- */
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "index.html"));
// });

// /* ---------------------------------------------------
//    START SERVER
// --------------------------------------------------- */
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`Server listening on port ${PORT}`);
// });


// server.js
require("dotenv").config();

const express = require("express");
const stripeLib = require("stripe");
const path = require("path");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 4242;

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ Missing STRIPE_SECRET_KEY in environment.");
  process.exit(1);
}
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  console.error("❌ Missing STRIPE_WEBHOOK_SECRET in environment.");
  process.exit(1);
}
if (!process.env.BASE_URL) {
  console.error("❌ Missing BASE_URL in environment (example: https://yourdomain.com).");
  process.exit(1);
}

const stripe = stripeLib(process.env.STRIPE_SECRET_KEY);

/* ---------------------------------------------------
   PROCESS LOGGING
--------------------------------------------------- */
process.on("exit", (code) => console.log("Node process exiting with code:", code));
process.on("uncaughtException", (err) => console.error("UNCAUGHT EXCEPTION:", err));
process.on("unhandledRejection", (reason) => console.error("UNHANDLED REJECTION:", reason));

/* ---------------------------------------------------
   EMAIL TRANSPORT (SMTP via Nodemailer)
--------------------------------------------------- */
const mailTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: parseInt(process.env.SMTP_PORT || "587", 10) === 465, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP on startup (helps catch bad creds right away)
mailTransport.verify((err) => {
  if (err) {
    console.error("❌ SMTP verify failed. Emails will NOT send until fixed:", err);
  } else {
    console.log("✅ SMTP transport verified and ready.");
  }
});

/* ---------------------------------------------------
   BASIC MIDDLEWARE
--------------------------------------------------- */
app.use(cors());

// IMPORTANT: DO NOT put express.json() before /webhook.
// Stripe needs the raw body to verify signature.

/* ---------------------------------------------------
   STRIPE WEBHOOK (RAW BODY)
   URL: POST /webhook
--------------------------------------------------- */

// Simple idempotency to prevent duplicate emails due to Stripe retries.
// NOTE: This resets on server restart; for perfect idempotency use DB/Redis.
const processedSessions = new Set();

app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // prevent duplicates
      if (processedSessions.has(session.id)) {
        console.log("↩️ Duplicate webhook ignored for session:", session.id);
        return res.json({ received: true, duplicate: true });
      }
      processedSessions.add(session.id);

      // Fetch line items
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        limit: 100,
      });

      const order = buildOrderFromSession(session, lineItems);

      await sendOrderEmailToOwner(order);

      console.log("✅ Order email sent for session:", session.id);
    }

    // Always acknowledge receipt quickly
    return res.json({ received: true });
  } catch (err) {
    // Log error but still return 200 so Stripe doesn't spam retries forever
    console.error("❌ Error handling webhook event:", err);
    return res.json({ received: true, error: true });
  }
});

/* ---------------------------------------------------
   JSON PARSER AFTER WEBHOOK
--------------------------------------------------- */
app.use(express.json());

/* ---------------------------------------------------
   STATIC FILES
--------------------------------------------------- */
app.use(express.static(path.join(__dirname)));

/* ---------------------------------------------------
   HEALTH CHECK
--------------------------------------------------- */
app.get("/health", (req, res) => res.json({ ok: true }));

/* ---------------------------------------------------
   SUCCESS ROUTE (Clears cart client-side)
   Stripe will redirect here after successful payment.
   This page clears localStorage cart and then redirects to success.html
--------------------------------------------------- */
app.get("/success", (req, res) => {
  // If your cart key is different, change it here (common keys: "cart", "cartItems")
  const CART_KEY = process.env.CART_STORAGE_KEY || "cart";

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Order Success</title>
  </head>
  <body>
    <p>Finalizing your order…</p>
    <script>
      try {
        // Clear cart storage
        localStorage.setItem(${JSON.stringify(CART_KEY)}, JSON.stringify([]));

        // If you store a total/qty separately, clear those too:
        localStorage.setItem("cartTotal", "0");
        localStorage.setItem("cartCount", "0");
      } catch (e) {}

      // Keep session_id in the URL if you want to show details on success.html
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");

      const redirectUrl = sessionId
        ? "/success.html?session_id=" + encodeURIComponent(sessionId)
        : "/success.html";

      window.location.replace(redirectUrl);
    </script>
  </body>
</html>
  `);
});

/* ---------------------------------------------------
   CANCEL ROUTE (Optional)
--------------------------------------------------- */
app.get("/cancel", (req, res) => {
  res.redirect("/cancel.html");
});

/* ---------------------------------------------------
   HELPER: Build Order Object from Stripe Session
--------------------------------------------------- */
function buildOrderFromSession(session, lineItems) {
  const items = (lineItems?.data || []).map((item) => ({
    name: item.description,
    quantity: item.quantity,
    amount: ((item.amount_total ?? item.amount_subtotal ?? 0) / 100),
  }));

  const total = (session.amount_total || 0) / 100;

  const shipping = session.shipping_details || {};
  const customer = session.customer_details || {};

  const addressObj = shipping.address || customer.address || {};
  const addressParts = [
    addressObj.line1,
    addressObj.line2,
    addressObj.city,
    addressObj.state,
    addressObj.postal_code,
  ].filter(Boolean);

  const address = addressParts.join(", ");

  const rawPhone = shipping.phone || customer.phone || "";
  const customerPhone =
    (typeof rawPhone === "string" ? rawPhone : "").replace("undefined", "").trim();

  return {
    orderId: session.id,
    paymentStatus: session.payment_status,
    items,
    total,
    customerName: shipping.name || customer.name || "Customer",
    customerEmail: customer.email || "",
    customerPhone: customerPhone || "",
    address,
  };
}

/* ---------------------------------------------------
   HELPER: Send Order Email To Owner
--------------------------------------------------- */
async function sendOrderEmailToOwner(order) {
  const ownerEmail = process.env.OWNER_EMAIL;

  if (!ownerEmail) {
    console.warn("⚠️ OWNER_EMAIL not set in .env — cannot send order email.");
    return;
  }

  const subject = `New Ujala Kabab Order - ${order.orderId}`;

  const itemLines = (order.items || [])
    .map((item) => `${item.name} x ${item.quantity} = $${item.amount.toFixed(2)}`)
    .join("\n");

  const textBody = `
New order received for Ujala Kabab

Order ID: ${order.orderId}
Payment Status: ${order.paymentStatus}

Customer: ${order.customerName}
Email: ${order.customerEmail || "N/A"}
Phone: ${order.customerPhone || "N/A"}

Delivery Address:
${order.address || "N/A"}

Items:
${itemLines || "N/A"}

Total: $${order.total.toFixed(2)}

Please start preparing this order.
  `.trim();

  try {
    const info = await mailTransport.sendMail({
      from: `"Ujala Kabab Orders" <${process.env.SMTP_USER}>`,
      to: ownerEmail,
      subject,
      text: textBody,
      replyTo: order.customerEmail || undefined,
    });

    console.log("📨 Email sent. MessageId:", info.messageId);
  } catch (err) {
    console.error("❌ Failed to send email:", err);
    throw err; // so webhook logs show failure clearly
  }
}

/* ---------------------------------------------------
   HELPER: Build Stripe line_items from cart.js items
--------------------------------------------------- */
function buildLineItems(items) {
  return items.map((item) => {
    const price = typeof item.price === "string" ? parseFloat(item.price) : item.price;

    return {
      price_data: {
        currency: "usd",
        product_data: { name: item.name },
        unit_amount: Math.round(price * 100),
      },
      quantity: item.quantity,
    };
  });
}

/* ---------------------------------------------------
   CREATE CHECKOUT SESSION
   URL: POST /create-checkout-session
--------------------------------------------------- */
app.post("/create-checkout-session", async (req, res) => {
  try {
    const items = req.body.items;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items in cart" });
    }

    const lineItems = buildLineItems(items);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,

      // IMPORTANT: send to /success (server route) so we can clear cart
      success_url: `${process.env.BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/cancel`,

      billing_address_collection: "required",
      shipping_address_collection: { allowed_countries: ["US"] },
      phone_number_collection: { enabled: true },

      metadata: { source: "ujala_kabab_website" },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("❌ Error creating checkout session:", err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

/* ---------------------------------------------------
   ROOT ROUTE
--------------------------------------------------- */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* ---------------------------------------------------
   START SERVER
--------------------------------------------------- */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server listening on port ${PORT}`);
});



