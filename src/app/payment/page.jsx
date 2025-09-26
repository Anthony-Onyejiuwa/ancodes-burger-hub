// app/checkout/page.jsx
"use client";
import { useEffect, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";

import "./payment.css";

export default function CheckoutPage() {
   const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [theme, setTheme] = useState("light");
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [delivery, setDelivery] = useState(700);
  const [total, setTotal] = useState(0);
  const [userInfo, setUserInfo] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [payMethod, setPayMethod] = useState("cash-on delivery");
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const timer = setTimeout(() => setLoading(false), 3000);
  return () => clearTimeout(timer);
}, []);


  // Load user info
   useEffect(() => {
    //  Only run in the browser
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
  }, []);


  // Load cart, coupon, theme on mount
  useEffect(() => {
  if (typeof window !== "undefined") {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);

    const storedCoupon = localStorage.getItem("appliedCoupon") || "";
    setAppliedCoupon(storedCoupon);

    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.body.setAttribute("data-theme", savedTheme);
  }
}, []);


  //  totals whenever cart or coupon changes
  useEffect(() => {
    const sub = cart.reduce(
      (acc, i) =>
        acc +
        i.price * i.quantity +
        (i.addons?.reduce((a, b) => a + b.price * b.quantity, 0) || 0),
      0
    );
    setSubtotal(sub);

    const disc = appliedCoupon === "BURGER10" ? Math.floor(sub * 0.1) : 0;
    setDiscount(disc);

    const del = sub > 0 ? 700 : 0;
    setDelivery(del);

    setTotal(sub - disc + del);

    // Update localStorage
    localStorage.setItem("cart", JSON.stringify(cart));
    if (appliedCoupon) localStorage.setItem("appliedCoupon", appliedCoupon);
    else localStorage.removeItem("appliedCoupon");
  }, [cart, appliedCoupon]);

  // Theme toggle
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.body.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Sign Out
   const signOut = () => {
    if (typeof window !== "undefined" && window.Swal) {
      window.Swal.fire({
        title: "Leaving already?",
        text: "You're about to log out of Ancodes Burger Hub 🍔",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#e63946",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, log me out",
        cancelButtonText: "Stay here",
         customClass: {
        title: 'swal-small-title',
        popup: 'swal-small-popup',
        htmlContainer: 'swal-small-text',
        confirmButton: 'swal-small-button',
        cancelButton: 'swal-small-button'
      }
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      });
    } else {
      // Fallback if Swal not loaded
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  // Apply coupon
  const applyCoupon = () => {
    if (!cart.length) {
      showToast("error", "❌ Cart is empty!");
      return;
    }
    setAppliedCoupon("BURGER10");
    showToast("success", "🎉 Coupon applied!");
  };

  // Remove coupon
  const removeCoupon = () => setAppliedCoupon("");

  // Confirm Payment
  const handleConfirm = () => {
    const { name, phone, address } = userInfo;
    if (!name || !phone || !address) return showToast("error", "❌ Fill all fields.");
    if (!cart.length) return showToast("error", "❌ Cart is empty.");

    const orderData = {
      name,
      phone,
      address,
      method: payMethod,
      items: cart,
      subtotal,
      discount,
      delivery,
      total,
      date: new Date().toLocaleString(),
    };

    if (payMethod === "card" && window.PaystackPop) {
      window.PaystackPop.setup({
        key: "pk_live_e82e097966836137743732256afdf1216a83f97c",
        email: "chibykeantonio95@gmail.com",
        amount: total * 100,
        metadata: {
          custom_fields: [{ display_name: "Phone", variable_name: "phone", value: phone }],
        },
        callback: (res) => finalizeOrder(orderData, res.reference),
        onClose: () => showToast("error", "❌ Payment cancelled"),
      }).openIframe();
    } else {
      finalizeOrder(orderData, null);
    }
  };

  const finalizeOrder = (orderData, payRef) => {
    orderData.payRef = payRef;
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    orders.push(orderData);
    localStorage.setItem("orders", JSON.stringify(orders));
    localStorage.setItem("customerInfo", JSON.stringify({ name: orderData.name, phone: orderData.phone, address: orderData.address }));
    localStorage.removeItem("cart");
    localStorage.removeItem("appliedCoupon");
    showToast("success", "✔️ Order confirmed!...prepare cash upon delivery");
    setTimeout(() => router.push("/order"), 1500);
  };

  const showToast = (type, msg) => {
    const t = document.getElementById(type === "error" ? "toast-error" : "toast-success");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t.timer);
    t.timer = setTimeout(() => t.classList.remove("show"), 3000);
  };
  if (loading) {
  return (
    <div className="preloader">
      <div className="card">
        <div className="chip"></div>
        <div className="card-number">1234 5678 9012 3456</div>
        <div className="card-info">
          <span>PAYMENT</span>
          <span className="card-lock">🔒</span>
        </div>
      </div>
      <p className="loading-text">Initializing secure payment...</p>
      <div className="progress-wrapper">
        <div className="progress-bar"></div>
      </div>
    </div>
  );
}


  return (
    <main data-theme={theme}>
      {/* Scripts */}
      <Script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js" strategy="afterInteractive" />
      <Script src="https://js.paystack.co/v1/inline.js" strategy="afterInteractive" />
      <Script src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.6.2/dist/dotlottie-wc.js" type="module" />
      <Script src="https://unpkg.com/aos@next/dist/aos.js" strategy="afterInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/sweetalert2@11" strategy="afterInteractive" />

      {/* Google Material Icons */}
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      {/* Font Awesome */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />

      {/* Header */}
      <header>
        <div className="container">
          {user && (
  <div id="user-info" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    {user.picture && (
      <img
        src={user.picture}
        alt="User Photo"
        style={{ width: "30px", borderRadius: "50%" }}
      />
    )}
    <span id="user-name"> 👋 Hi, {user.name ? user.name.split(" ")[0] : "Guest"}
    </span>
  </div>
)}
          <div id="theme-toggle" className="theme-toggle-btn" title="Theme toggle" aria-label="Toggle Theme" onClick={toggleTheme}>🌓</div>

          <nav className="nav" id="navbar">
            <ul>
              <li><Link href="/#home"><i className="fa fa-home"></i> Home</Link></li>
              <li>
                <Link href="/cart"><i className="fas fa-shopping-cart"></i> Cart
                  {cart.length > 0 && <span id="nav-badge-desktop" className="desktop-badge">{cart.length}</span>}
                </Link>
              </li>
              <li><Link href="/order"><i className="fa-solid fa-boxes-packing"></i> Track-orders</Link></li>
             <button className="signout-btn-desktop" onClick={signOut}>
        <i className="fas fa-sign-out-alt"></i> Sign-out
      </button>
            </ul>
          </nav>

          <div
            className="hamburger"
            id="hamburger"
            onClick={() => setIsMenuOpen(true)} //  open menu
          >
            &#9776;
            {cart.length > 0 && (
              <span id="nav-badge-mobile" className="badge">
                {cart.length}
              </span>
            )}
          </div>
        </div>

         {/* Slider menu */}
        <nav
          className={`slider-menu ${isMenuOpen ? "open" : ""}`} 
          id="slider-menu"
        >
          <button
            className="close-btn"
            id="close-btn"
            onClick={() => setIsMenuOpen(false)} // 
          >
            &times;
          </button>
          <ul>
            <li>
              <Link href="/#home">
                <i className="fa fa-home"></i> Home
              </Link>
            </li>
            <li>
              <Link href="/cart">
                <i className="fas fa-shopping-cart"></i> Cart
                {cart.length > 0 && (
                  <span
                    id="nav-badge-slider"
                    className="desktop-badge"
                  >
                    {cart.length}
                  </span>
                )}
              </Link>
            </li>
            <li>
              <Link href="/order">
                <i className="fa-solid fa-boxes-packing"></i> Track-orders
              </Link>
            </li>
            <button className="signout-btn-slider" onClick={signOut}>
        <i className="fas fa-sign-out-alt"></i> Sign-out
      </button>
          </ul>
          <div className="slider-footer-text">
            <div className="slider-contact-icons">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
            </div>
            &copy; Ancodes Burger Hub❤️
          </div>
        </nav>
      </header>

      {/* Hero */}
      <div className="hero">
        <h1>Checkout</h1>
        <p>You're one step away from juicy burger goodness. Complete your payment below.</p>
      </div>

      {/* Lottie */}
      <section className="lottie">
        <div className="lottie-wrapper" style={{ display: "flex", justifyContent: "center" }}>
          <dotlottie-wc
            src="https://lottie.host/daf21292-e3ef-408c-9e29-9f83ad118153/LYJejxk6wo.lottie"
            speed="1"
            autoplay
            loop
            style={{ width: "350px", height: "300px", maxWidth: "100%" }}
          />
        </div>
      </section>

      {/* Payment container */}
      <section className="payment-container">
        <div className="checkout-wrapper" data-aos="zoom-in" data-aos-easing="ease-out-cubic" data-aos-duration="500">

          {/* SUMMARY */}
          <div className="section-card summary-section">
            <h2>🧾 Order Summary</h2>
            <table className="summary-table">
              <thead><tr><th>Item</th><th>Subtotal</th></tr></thead>
              <tbody>
                {cart.length === 0 ? (
                  <tr><td colSpan="2">Your cart is empty.</td></tr>
                ) : (
                  cart.map((item, idx) => {
                    const addonTotal = item.addons?.reduce((a, b) => a + b.price * b.quantity, 0) || 0;
                    const itemTotal = item.price * item.quantity + addonTotal;
                    return (
                      <tr key={idx}>
                        <td>
                          {item.name} x {item.quantity}
                          {item.addons?.map((a, i) => (
                            <div key={i} style={{ fontSize: 12, marginLeft: 10, color: "gray" }}>
                              + {a.name} x{a.quantity} - ₦{(a.price * a.quantity).toLocaleString()}
                            </div>
                          ))}
                        </td>
                        <td>₦{itemTotal.toLocaleString()}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <div className="summary-breakdown">
              <p>Subtotal: ₦{subtotal.toLocaleString()}</p>
              {discount > 0 && (
                <p id="discount-line" style={{ display: "flex", justifyContent: "space-between" }}>
                  Discount (10%): −₦{discount.toLocaleString()}
                </p>
              )}
              <p>Delivery: ₦{delivery.toLocaleString()}</p>
              <p className="total">Total: ₦{total.toLocaleString()}</p>
            </div>
            <div className="coupon-section">
              {!appliedCoupon ? (
                <button className="btn secondary" onClick={applyCoupon}>Apply Coupon</button>
              ) : (
                <button className="btn secondary" onClick={removeCoupon}>Remove Coupon</button>
              )}
            </div>
          </div>

          {/* USER DETAILS */}
          <div className="section-card form-section">
            <h2>👤 Your Details</h2>
            <div className="field">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="Name for delivery"
                value={userInfo.name}
                onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                type="tel"
                placeholder="+2348012345678"
                value={userInfo.phone}
                onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                rows="3"
                placeholder="Your delivery address"
                value={userInfo.address}
                onChange={(e) => setUserInfo({ ...userInfo, address: e.target.value })}
              />
            </div>
          </div>

          {/* PAYMENT */}
          <div className="section-card payment-section">
            <h2>Payment Method</h2>
            <div className="field">
              <label>
                <input
                  type="radio"
                  name="payOpt"
                  value="cash-on delivery"
                  checked={payMethod === "cash-on delivery"}
                  onChange={() => setPayMethod("cash-on delivery")}
                /> <i className="fa-solid fa-money-bill"></i> Cash on delivery
              </label>
              <br />
              <label>
                <input
                  type="radio"
                  name="payOpt"
                  value="card"
                  checked={payMethod === "card"}
                  onChange={() => setPayMethod("card")}
                /> <i className="fa fa-credit-card"></i> (Paystack)
              </label>
            </div>
            <div className="btn-row">
              <Link href="/cart" className="btn secondary"><i className="fa-solid fa-arrow-left"></i> Back</Link>
              <button id="confirm-btn" className="btn primary" type="button" onClick={handleConfirm}>
                Confirm Payment <i className="fa-solid fa-thumbs-up"></i>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Toasts */}
      <div id="toast-success" className="toast"></div>
      <div id="toast-error" className="toast error"></div>
    </main>
  );
}
