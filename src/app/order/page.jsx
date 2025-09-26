"use client";
import { useEffect, useState } from "react";
import Link from "next/link";  
import Script from "next/script";
import Swal from "sweetalert2";
import './order.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faShoppingCart, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import useAuthRedirect from "@/hooks/useAuthRedirect";

export default function OrdersPage() {
    useAuthRedirect("Orders");
  const [orders, setOrders] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [undoData, setUndoData] = useState(null);
  const [theme, setTheme] = useState("light");
  const [user, setUser] = useState(null);
  const [preloaderVisible, setPreloaderVisible] = useState(true);
  const [preloadText, setPreloadText] = useState("Preparing your receipts...");

  const toastDuration = 3000;

  // ---------- Load data ----------
  useEffect(() => {
    document.body.classList.add("no-scroll");

    const textTimer = setTimeout(() => {
      setPreloadText("Loading your receipts...");
    }, 2000);

    const hideTimer = setTimeout(() => {
      setPreloaderVisible(false);
      document.body.classList.remove("no-scroll");
    }, 5000);

    const localOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    setOrders(localOrders);

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(cart.reduce((total, item) => total + (item.quantity || 1), 0));

    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.body.setAttribute("data-theme", savedTheme);

    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // ---------- Helpers ----------
  const showToast = (msg, ok = true) => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: ok ? "success" : "error",
      title: msg,
      showConfirmButton: false,
      timer: toastDuration,
      background: ok ? "#e6f4ea" : "#fce8e6",
      color: "#333",
      timerProgressBar: true,
    });
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.body.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleSignOut = () => {
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
        title: 'swal-small-title',
        popup: 'swal-small-popup',
        htmlContainer: 'swal-small-text',
        confirmButton: 'swal-small-button',
        cancelButton: 'swal-small-button'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("user");
        localStorage.setItem("logoutSuccess", "true");
        window.location.href = "/login";
      }
    });
  };

  const deleteOrder = (idx) => {
    const deleted = orders[idx];
    const newOrders = orders.filter((_, i) => i !== idx);
    setUndoData({ data: deleted, index: idx });
    setOrders(newOrders);
    localStorage.setItem("orders", JSON.stringify(newOrders));
    showToast("Deleted. Tap to undo?", false);
  };

  const undoDelete = () => {
    if (!undoData) return;
    const newOrders = [...orders];
    newOrders.splice(undoData.index, 0, undoData.data);
    setOrders(newOrders);
    localStorage.setItem("orders", JSON.stringify(newOrders));
    setUndoData(null);
    showToast("Undo successful");
  };

  const toggleDetails = (idx) => {
    const body = document.getElementById(`card-body-${idx}`);
    const btn = document.getElementById(`toggle-btn-${idx}`);
    if (body.style.display === "block") {
      body.style.display = "none";
      btn.textContent = "👁️ View details";
    } else {
      body.style.display = "block";
      btn.textContent = "🙈 Hide details";
    }
  };
 

https://github.com/Anthony-Onyejiuwa/ancodes-burger-hub.git
  const printReceipt = async (idx) => {
    const card = document.getElementById(`card-${idx}`);
    if (!card) return showToast("Order not found", false);

    card.classList.add("print-target");
    const clone = card.cloneNode(true);
    clone.style.background = "#fff";
    clone.style.color = "#000";
    clone.querySelectorAll(".card-foot, .btn, .stars, img").forEach(el => el.remove());

    const temp = document.createElement("div");
    temp.style.position = "absolute";
    temp.style.left = "-9999px";
    temp.appendChild(clone);
    document.body.appendChild(temp);

    await new Promise(r => setTimeout(r, 200));

    const html2pdf = (await import("html2pdf.js")).default;
    const fileName = `Receipt-card-${idx}-${Date.now()}.pdf`;
    await html2pdf().from(clone).set({
      margin: 0.4,
      filename: fileName,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 10, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
    }).save();

    showToast("📄 Receipt downloaded");
    document.body.removeChild(temp);
    card.classList.remove("print-target");
  };

  const clearAll = () => {
    if (!orders.length) return;
    setUndoData({ data: [...orders] });
    setOrders([]);
    localStorage.removeItem("orders");
    showToast("All orders cleared. Tap to undo?", false);
  };

  // ---------- Cart Badge ----------
  const updateCartBadge = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    setCartCount(count);
  };

  useEffect(() => {
    updateCartBadge();
  }, []);

  // ---------- Mobile Slider ----------
  useEffect(() => {
    const hamburger = document.getElementById('hamburger');
    const sliderMenu = document.getElementById('slider-menu');
    const closeBtn = document.getElementById('close-btn');
    const sliderLinks = sliderMenu?.querySelectorAll('a');
    let lastScrollY = 0;

    if (!hamburger || !sliderMenu || !closeBtn) return;

    const openSlider = () => {
      lastScrollY = window.scrollY;
      document.body.classList.add('no-scroll');
      document.body.style.position = 'fixed';
      document.body.style.top = `-${lastScrollY}px`;
      document.body.style.width = '100%';
      sliderMenu.classList.add('open');
    };

    const closeSlider = () => {
      sliderMenu.classList.remove('open');
      const scrollY = parseInt(document.body.style.top || '0') * -1;
      document.body.style.removeProperty('position');
      document.body.style.removeProperty('top');
      document.body.style.removeProperty('width');
      document.body.classList.remove('no-scroll');
      window.requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    };

    hamburger.addEventListener('click', openSlider);
    closeBtn.addEventListener('click', closeSlider);
    sliderLinks?.forEach(link => {
      link.addEventListener('click', () => closeSlider());
    });

    return () => {
      hamburger.removeEventListener('click', openSlider);
      closeBtn.removeEventListener('click', closeSlider);
    };
  }, []);

  // ---------- Render ----------
  return (
    <>
      <Script src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.6.2/dist/dotlottie-wc.js" type="module"></Script>

      {/* Preloader */}
      {preloaderVisible && (
        <div className="receipts-preloader">
          <div className="spinner-box">
            <div className="circle-spin"></div>
            <div className="pop-icons">
              <span className="bag">🛍️</span>
              <span className="receipt">🧾</span>
            </div>
          </div>
          <p id="preloadText">{preloadText}</p>
        </div>
      )}

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
          <div id="themes-toggle" className="theme-toggle-btn" title="Theme toggle" onClick={toggleTheme} aria-label="Toggle Theme">🌓</div>

          <nav className="nav" id="navbar">
            <ul>
              <li><Link href="/#home"><FontAwesomeIcon icon={faHome} /> Home</Link></li>
              <li>
                <Link href="/cart">
                  <FontAwesomeIcon icon={faShoppingCart} /> Cart
                  {cartCount > 0 && <span className="desktop-badge">{cartCount}</span>}
                </Link>
              </li>
             
              <li><div className="sign-out-btn" onClick={handleSignOut}><FontAwesomeIcon icon={faSignOutAlt} /> Sign-out</div></li>
            </ul>
          </nav>

          {/* Hamburger */}
          <div className="hamburger" id="hamburger">&#9776; {cartCount>0 && <span className="badge">{cartCount}</span>}</div>
        </div>

        {/* Slider menu */}
        <nav className="slider-menu" id="slider-menu">
          <button className="close-btn" id="close-btn">&times;</button>
          <ul>
            <li><Link href="/#home"><FontAwesomeIcon icon={faHome} /> Home</Link></li>
            <li>
              <Link href="/cart"><FontAwesomeIcon icon={faShoppingCart} /> Cart {cartCount>0 && <span className="desktop-badge">{cartCount}</span>}</Link>
            </li>
            <li><div className="sign-out-btn" onClick={handleSignOut}><FontAwesomeIcon icon={faSignOutAlt} /> Sign-out</div></li>
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

      {/* Controls */}
      <div className="controls">
        <select onChange={(e) => {
          const sorted = [...orders].sort((a,b) => e.target.value==="oldest"?new Date(b.date)-new Date(a.date):new Date(a.date)-new Date(b.date));
          setOrders(sorted);
        }}>
          <option value="oldest">Oldest First</option>
          <option value="newest">Newest First</option>
        </select>
      </div>
      <div class="order-head">
       <h2 className="order-heading">🛍️ Your Orders (Receipts)</h2>
      </div>
      {/* Lottie */}
      <section className="lottie">
        <div className="lottie-wrapper">
          <dotlottie-wc
            src="https://lottie.host/8add928d-300b-4061-9f16-6d7c15985699/OeuJXftsqb.lottie"
            style={{ width: "320px", height: "300px" }}
            speed="1"
            autoplay
            loop
          ></dotlottie-wc>
        </div>
      </section>

      {/* Orders */}
      <div id="orders-wrapper" className="orders">
        {orders.length === 0 && <p style={{ textAlign: "center" }}>No orders found.</p>}
        {orders.map((o, idx) => (
          <div key={idx} className="order-card" id={`card-${idx}`}>
            <div className="receipt-banner">🧾 Order Receipt</div>
          <div className="meta">
  {/* Render image only if it exists */}
  {o.items?.[0]?.img && (
    <img src={o.items[0].img} alt="Burger image" />
  )}

  <div>
    {/* Name with fallback */}
    <h3>#{idx + 1} — {o.name || "No Name"}</h3>

    {/* Star rating */}
    <div className="stars">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className={i < (o.rating || 0) ? "filled" : ""}
          onClick={() => {
            if (o.rating) return;
            const newOrders = [...orders];
            newOrders[idx].rating = i + 1;
            setOrders(newOrders);
            localStorage.setItem("orders", JSON.stringify(newOrders));
            showToast("Thanks for rating!");
          }}
        >
          ★
        </span>
      ))}
    </div>

    {/* Date with fallback */}
    <small>{o.date ? new Date(o.date).toLocaleString() : "No Date"}</small>
  </div>

  <button
    className="btn toggle"
    id={`toggle-btn-${idx}`}
    onClick={() => toggleDetails(idx)}
  >
    👁️ View details
  </button>
</div>

            <div className="card-body" id={`card-body-${idx}`} style={{ display: "none" }}>
             {o.items?.map((it, i) => (
                <div className="item-row" key={i}>
                  {it.name} ×{it.quantity} — ₦{(it.price*it.quantity).toLocaleString()}
                  {it.addons?.length>0 && (
                    <div className="addon-list">
                      {it.addons.map((ad,j)=>(
                        <div className="addon-row" key={j}>
                          + {ad.name} ×{ad.quantity} — ₦{(ad.price*ad.quantity).toLocaleString()}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            <div className="total-row">Total: ₦{(o.total ?? 0).toLocaleString()}</div>

            </div>

            <div className="card-foot">
              <button className="btn del"  onClick={()=>deleteOrder(idx)}>🗑️ Delete</button>
              <button className="btn print" onClick={()=>printReceipt(idx)}>🖨️ Print</button>
            </div>
          </div>
        ))}
      </div>

      {/* Undo */}
      {undoData && (
        <button className="btn undo" onClick={undoDelete}>Undo</button>
      )}
    </>
  );
}
