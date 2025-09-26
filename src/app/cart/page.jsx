"use client";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Script from "next/script";
import "./cart.css";
import Link from "next/link"; 
import useAuthRedirect from "@/hooks/useAuthRedirect";

export default function CartPage() {
  useAuthRedirect("Cart");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");
  const [cartItems, setCartItems] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(""); 
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");
  const [sliderOpen, setSliderOpen] = useState(false);

  // Load user, cart, theme
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) setUser(userData);

    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(storedCart);

    const storedCoupon = localStorage.getItem("appliedCoupon") || "";
    setAppliedCoupon(storedCoupon);

    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.body.setAttribute("data-theme", savedTheme);

    const timer = setTimeout(() => setLoading(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Update localStorage whenever cart or coupon changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
    if (appliedCoupon) localStorage.setItem("appliedCoupon", appliedCoupon);
    else localStorage.removeItem("appliedCoupon");
  }, [cartItems, appliedCoupon]);

  // Toast helper
  const toast = (type, msg) => {
    setToastType(type);
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // Theme toggle
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.body.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Sign out
  const signOut = () => {
    Swal.fire({
      title: "Leaving already?",
      text: "You're about to log out of Ancodes Burger Hub 🍔",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e63946",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, log me out",
      cancelButtonText: "Stay here",
      customClass: {
        title: "swal-small-title",
        popup: "swal-small-popup",
        htmlContainer: "swal-small-text",
        confirmButton: "swal-small-button",
        cancelButton: "swal-small-button",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    });
  };

  // Cart computations
  const getAddonTotal = (item) =>
    item.addons?.reduce((acc, a) => acc + a.price * a.quantity, 0) || 0;

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity + getAddonTotal(item),
    0
  );
  const discount = appliedCoupon === "BURGER10" ? subtotal * 0.1 : 0;
  const grandTotal = subtotal - discount;

  // Coupon functions
  const applyCoupon = () => {
    if (cartItems.length === 0) {
      toast("error", "Cart is empty!");
      return;
    }
    setAppliedCoupon("BURGER10");
    toast("success", "🎉 Coupon applied!");
  };
  const removeCoupon = () => setAppliedCoupon("");

  // Remove single item
  const removeItem = (idx) => {
    const removed = cartItems[idx].name;
    const newCart = cartItems.filter((_, i) => i !== idx);
    setCartItems(newCart);
    toast("success", `✔️ Removed ${removed}`);
  };

  // Clear cart
  const clearCart = () => {
    Swal.fire({
      title: "🗑️ This action cannot be undone",
      showCancelButton: true,
      confirmButtonText: "Proceed",
      cancelButtonText: "Cancel",
      icon: "warning",
      confirmButtonColor: "#e63946",
      cancelButtonColor: "#3085d6",
    }).then((result) => {
      if (result.isConfirmed) {
        setCartItems([]);
        setAppliedCoupon("");
        toast("success", "✔️ Cart cleared");
      }
    });
  };

  // Handle payment
  const handlePay = () => {
    if (typeof window !== "undefined" && window.confetti) {
      window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    // Full reload navigation
    setTimeout(() => {
      window.location.href = "/payment";
    }, 800);
  };

  // Hamburger slider open/close
  const openSlider = () => setSliderOpen(true);
  const closeSlider = () => setSliderOpen(false);

  return (
    <>
      {/* Scripts */}
      <Script src="https://cdn.jsdelivr.net/npm/sweetalert2@11" />
      <Script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1" />
      <Script
        type="module"
        src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.6.2/dist/dotlottie-wc.js"
      />
      <Script src="/auth.js" strategy="afterInteractive" />

      {/* Google Material Icons */}
      <link
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
        rel="stylesheet"
      />

      {/* Font Awesome */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />

      {/* Preloader */}
      {loading && (
        <div className="preloader">
          <div className="shopping-cart">
            <div className="basket">
              <div className="grid"></div>
            </div>
            <div className="handle"></div>
            <div className="wheels">
              <div className="wheel left"></div>
              <div className="wheel right"></div>
            </div>
          </div>
          <p className="loading-text">Loading your cart...</p>
        </div>
      )}

      {/* Header */}
      <header>
        <div className="container">
          {user && (
            <div id="user-info" style={{ display: "flex" }}>
              {user.picture && (
                <img
                  src={user.picture}
                  alt="User Photo"
                  style={{ width: "30px", borderRadius: "50%" }}
                />
              )}
              <span id="user-name"> 👋 Hi, {user.name.split(" ")[0]}</span>
            </div>
          )}
          <div
            id="theme-toggle"
            className="theme-toggle-btn"
            onClick={toggleTheme}
             title="theme toggle"
          >
            🌓
          </div>

{/* Desktop Nav */}
<nav className="nav" id="navbar">
  <ul>
    <li>
      <a href="/#home">
        <i className="fa fa-home"></i> Home
      </a>
    </li>
    <li>
      <Link href="/order">
        <i className="fa-solid fa-boxes-packing"></i> Track-orders
      </Link>
    </li>
    <li>
      <div className="sign-out-btn" onClick={signOut}>
        <i className="fas fa-sign-out-alt"></i> Sign-out
      </div>
    </li>
  </ul>
</nav>

{/* Hamburger */}
<div className="hamburger" onClick={openSlider}>
  &#9776;
  {cartItems.length > 0 && (
    <span id="nav-badge-mobile" className="badge">
      {cartItems.length}
    </span>
  )}
</div>

{/* Slider Menu */}
<nav className={`slider-menu ${sliderOpen ? "open" : ""}`}>
  <button className="close-btn" onClick={closeSlider}>
    &times;
  </button>
  <ul>
    <li>
      <a href="/#home">
        <i className="fa fa-home"></i> Home
      </a>
    </li>

    <li>
      <Link href="/order">
        <i className="fa-solid fa-boxes-packing"></i> Track-orders
      </Link>
    </li>
    <li>
      <div className="sign-out-btn" onClick={signOut}>
        <i className="fas fa-sign-out-alt"></i> Sign-out
      </div>
    </li>
  </ul>
  <div className="slider-footer-text">
    <div className="slider-contact-icons">
      <a href="#"><i className="fab fa-facebook-f" title="Facebook"></i></a>
      <a href="#"><i className="fab fa-twitter" title="Twitter"></i></a>
      <a href="#"><i className="fab fa-instagram" title="Instagram"></i></a>
    </div>
    &copy; Ancodes Burger Hub❤️
  </div>
</nav>

        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <h1>Your Shopping Basket🛒</h1>
        <p>Review your tasty picks before checkout.</p>
      </section>

      {/* Lottie */}
      <section className="lottie">
        <div className="lottie-wrapper">
          <dotlottie-wc
            src="https://lottie.host/ee68e87e-53a7-4499-a579-a9303db17cce/n2TEh8dY3a.lottie"
            style={{ width: "350px", height: "230px" }}
            speed="1"
            autoplay
            loop
          />
        </div>
      </section>

      {/* Cart Section */}
      <div className="allcart">
        <section className="cart">
          {cartItems.length === 0 ? (
            <div id="empty-msg" style={{ textAlign: "center" }}>
              <p>Your cart is empty.</p>
              <br />
             <Link href="/#menu" className="btn-outline">
  ← Back to Menu
</Link>
            </div>
          ) : (
            <>
              <div className="table-wrapper">
                <table id="cart-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Name</th>
                      <th>Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item, idx) => {
                      const addonTotal = getAddonTotal(item);
                      const total = item.price * item.quantity + addonTotal;
                      return (
                        <tr key={idx}>
                          <td>
                            <img
                              src={item.img || "https://via.placeholder.com/60"}
                              alt={item.name}
                              width="50"
                              style={{ borderRadius: "6px" }}
                            />
                          </td>
                          <td>
                            {item.name} × {item.quantity}
                            {item.addons?.map((a, i) => (
                              <div key={i}>
                                + {a.name} (₦{a.price} × {a.quantity}) = ₦
                                {a.price * a.quantity}
                              </div>
                            ))}
                          </td>
                          <td>₦{total.toLocaleString()}</td>
                          <td>
                            <button
                              className="remove-btn" title="Remove"
                              onClick={() => removeItem(idx)}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="summary">
                <span>
                  Subtotal: ₦<span>{subtotal.toLocaleString()}</span>
                </span>
                {appliedCoupon === "BURGER10" && (
                  <span>
                    Discount: ₦<span>{discount.toLocaleString()}</span>
                  </span>
                )}
                <span>
                  Total: ₦<span>{grandTotal.toLocaleString()}</span>
                </span>
              </div>

              {/* Coupon */}
              <div className="coupon-section">
                <input
                  type="text"
                  placeholder="Enter coupon code - 10% off"
                  disabled={appliedCoupon === "BURGER10"}
                />
                <br /><br />
                {appliedCoupon !== "BURGER10" && (
                  <button className="btn btn-primary2" onClick={applyCoupon}>
                    Apply Coupon
                  </button>
                )}
                {appliedCoupon === "BURGER10" && (
                  <>
                    <p style={{ color: "green" }}>🎉 Coupon applied! 10% off.</p>
                    <button className="btn-outline" onClick={removeCoupon}>
                      ✖ Remove Coupon
                    </button>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="actions">
                <button className="btn-outline" onClick={clearCart}>
                  Clear Cart
                </button>
                <button className="btn btn-primary" onClick={handlePay}>
                  Pay <i className="fa fa-credit-card"></i>
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      {/* Toast */}
      {toastMsg && <div className={`toast toast-${toastType}`}>{toastMsg}</div>}
    </>
  );
}
