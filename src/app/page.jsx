"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import "aos/dist/aos.css";
import AOS from "aos";
import "./home.css";
import Script from "next/script";
import Link from "next/link"; 
import { GuestProtectedLink } from "@/components/protected-route";

// Counter component
function Counter({ target, suffix, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
            setCount(0);
          }
        });
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => ref.current && observer.unobserve(ref.current);
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const increment = target / (duration / 16);
    let raf;
    const update = () => {
      start += increment;
      if (start < target) {
        setCount(Math.floor(start));
        raf = requestAnimationFrame(update);
      } else {
        setCount(target);
        cancelAnimationFrame(raf);
      }
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [isVisible, target, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export default function IndexPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [guestMode, setGuestMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showMission, setShowMission] = useState(false);
  const modalRef = useRef(null);
  const autoCloseTimer = useRef(null);
  const modalState = useRef(false);

  // preload images
  useEffect(() => {
    const burgerImages = [
      "/images/classic-beef-burger.jpeg",
      "/images/grillrd-cheesy-smash-burger.jpeg",
      "/images/spicy-chcken-zinger-burger.jpeg",
      "/images/grilled-chicken-burger.jpeg",
      "/images/gourmet-veggie-burger.jpeg",
      "/images/falafel-burgers-1-4.jpg",
      "/images/bbq-bacon-burger.jpeg",
      "/images/breakfast-burger.jpeg",
      "/images/fillet-fish-burger.jpeg",
      "/images/garlic-butter-smash-burger.jpg",
      "/images/ghost-pepper-burger.jpg",
      "/images/double-bacon-cheese-burger.webp",
    ];
    const smoothieImages = [
      "/images/fruit-smoothie-recipes-healthy-768x1152.webp",
      "/images/summer-strawberry-watermelon-smoothie-recipe-2-1-768x1152.webp",
      "/images/chocolate-peanut-butter-smoothie-1-768x1152.webp",
      "/images/healthy-eggnog-smoothie-768x1152.webp",
      "/images/Peanut-Butter-Banana-Smoothie-5-500x500.webp",
      "/images/pina-colada-smoothie.jpeg",
      "/images/citrus-smoothie-6.jpg",
      "/images/blueberry-almond-smoothie-1.jpg",
    ];
    [...burgerImages, ...smoothieImages].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // open modal
  const openDiscountModal = useCallback(() => {
    if (modalState.current) return;
    modalState.current = true;
    setIsOpen(true);
    document.body.style.overflow = "hidden";
    if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current);
    autoCloseTimer.current = setTimeout(closeDiscountModal, 8000);
  }, []);

  // close modal
  const closeDiscountModal = useCallback(() => {
    modalState.current = false;
    setIsOpen(false);
    document.body.style.overflow = "";
    if (autoCloseTimer.current) {
      clearTimeout(autoCloseTimer.current);
      autoCloseTimer.current = null;
    }
  }, []);

  // show modal once per session
  useEffect(() => {
    if (sessionStorage.getItem("discountShown")) return;
    const openTimer = setTimeout(() => {
      openDiscountModal();
      sessionStorage.setItem("discountShown", "true");
    }, 20000);
    return () => clearTimeout(openTimer);
  }, [openDiscountModal]);

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        closeDiscountModal();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeDiscountModal]);

  // parse jwt
  function parseJwt(token) {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return {};
    }
  }

  // load user + guestMode
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const isGuest = localStorage.getItem("guestMode") === "true";
    if (!savedUser && !isGuest) {
      window.location.href = "/login";
      return;
    }
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.credential) {
        const now = Math.floor(Date.now() / 1000);
        const decoded = parseJwt(parsedUser.credential);
        if (decoded.exp && decoded.exp < now) {
          console.warn("JWT expired");
          localStorage.removeItem("user");
          if (window.Swal) {
            window.Swal.fire({
              toast: true,
              position: "top-end",
              icon: "info",
              title: "Session expired",
              text: "Please sign in again to continue",
              showConfirmButton: false,
              timer: 4000,
              background: "#fff8f0",
              color: "#333",
              timerProgressBar: true,
              didClose: () => (window.location.href = "/login"),
            });
          } else {
            window.location.href = "/login";
          }
          return;
        }
      }
      setUser(parsedUser);
      setGuestMode(false);
    }
    if (isGuest) {
      setGuestMode(true);
      setUser(null);
    }
  }, []);

  // preloader
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // testimonial slider
  useEffect(() => {
    const slides = document.querySelectorAll("#testimonialFadeSlider .testimonial-slide");
    let currentSlide = 0;
    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.classList.remove("active");
        if (i === index) slide.classList.add("active");
      });
    }
    const interval = setInterval(() => {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // hamburger menu
  useEffect(() => {
    const hamburger = document.getElementById("hamburger");
    const sliderMenu = document.getElementById("slider-menu");
    const closeBtn = document.getElementById("close-btn");
    const sliderLinks = sliderMenu?.querySelectorAll("a");
    if (!hamburger || !sliderMenu || !closeBtn) return;
    let lastScrollY = 0;
    const openMenu = () => {
      lastScrollY = window.scrollY;
      document.body.classList.add("no-scroll");
      document.body.style.position = "fixed";
      document.body.style.top = `-${lastScrollY}px`;
      document.body.style.width = "100%";
      sliderMenu.classList.add("open");
    };
    const closeMenu = () => {
      sliderMenu.classList.remove("open");
      const scrollY = parseInt(document.body.style.top || "0") * -1;
      document.body.style.removeProperty("position");
      document.body.style.removeProperty("top");
      document.body.style.removeProperty("width");
      document.body.classList.remove("no-scroll");
      window.requestAnimationFrame(() => window.scrollTo(0, scrollY));
    };
    const handleLinkClick = (e, link) => {
      const href = link.getAttribute("href");
      if (href.startsWith("#")) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          closeMenu();
          setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 350);
        }
      } else {
        e.preventDefault();
        closeMenu();
        setTimeout(() => (window.location.href = href), 350); 
      }
    };
    hamburger.addEventListener("click", openMenu);
    closeBtn.addEventListener("click", closeMenu);
    sliderLinks?.forEach((link) => link.addEventListener("click", (e) => handleLinkClick(e, link)));
    return () => {
      hamburger.removeEventListener("click", openMenu);
      closeBtn.removeEventListener("click", closeMenu);
      sliderLinks?.forEach((link) => link.removeEventListener("click", (e) => handleLinkClick(e, link)));
    };
  }, []);

  // init AOS
  useEffect(() => {
    AOS.init({ duration: 200, delay: 150 });
  }, []);

  // delayed modal
  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  // sign out
  const signOut = () => {
    if (window.Swal) {
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
          localStorage.removeItem("guestMode");
          localStorage.setItem("logoutSuccess", "true");
          window.location.href = "/login";
        }
      });
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("guestMode");
      localStorage.setItem("logoutSuccess", "true");
      window.location.href = "/login";
    }
  };

  const handleClose = () => setIsOpen(false);



  return (
    <>
      {/* Scripts */}
      <Script src="https://cdn.jsdelivr.net/npm/sweetalert2@11" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.js" strategy="beforeInteractive" />
      <Script src="/script.js" strategy="afterInteractive" onLoad={() => console.log("script.js loaded")} />
      <Script src="/auth.js" strategy="afterInteractive" />
      <Script type="module" src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.6.2/dist/dotlottie-wc.js" />

      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />

      {/* Preloader */}
      {loading && (
        <div id="preloader">
          <div className="burger-loader">
            <div className="bun-top"></div>
            <div className="lettuce"></div>
            <div className="patty"></div>
            <div className="bun-bottom"></div>
            <div className="sizzle"></div>
          </div>
        </div>
      )}

      <div id="content">
        {/* Toast */}
        <div className="toasts" id="toasts">
          <span className="toasts-message">✔️ Item added to cart!</span>
          <button className="toasts-cart-btn" id="proceed-btn">Proceed to Cart</button>
        </div>

      <header>
  <div className="container">
    {/* User Info */}
    {user ? (
      <div
        id="user-info"
        style={{ display: "flex" }}
        data-aos="slide-right"
        data-aos-easing="ease-out-cubic"
        data-aos-duration="3000"
      >
        {user.picture && (
          <img
            src={user.picture}
            alt="User Photo"
            style={{ width: "30px", borderRadius: "50%" }}
          />
        )}
        <span id="user-name"> 👋 Hi, {user.name?.split(" ")[0]}</span>
      </div>
    ) : guestMode ? (
      <div id="user-info" style={{ display: "flex" }}>
        <span id="user-name">👋 Hi, Guest</span>
      </div>
    ) : null}

    {/* Theme Toggle */}
    <div
      id="theme-toggle"
      className="themes-toggle-btn"
      title="theme toggle"
      aria-label="Toggle Theme"
      data-aos="zoom-in"
      data-aos-easing="ease-out-cubic"
      data-aos-duration="3000"
    >
      🌓
    </div>

    {/* Desktop Nav */}
    <nav
  className="nav"
  id="navbar"
  data-aos="fade-down"
  data-aos-easing="ease-out-cubic"
  data-aos-duration="3000"
>
  <ul>
    <li>
      <a href="#home">
        <i className="fa-solid fa-home"></i> Home
      </a>
    </li>
    <li>
      <a href="#menu">
        <i className="fa-solid fa-bars"></i> Menu
      </a>
    </li>
    <li>
      <a href="#about">
        <i className="fa fa-info-circle"></i> About
      </a>
    </li>

    {/* Cart */}
    <li>
      {guestMode ? (
        <GuestProtectedLink href="/cart" className="nav-link">
          <i className="fas fa-shopping-cart"></i> Cart
          <span id="nav-badge-desktop" className="desktop-badge" style={{ display: "none" }}>
            0
          </span>
        </GuestProtectedLink>
      ) : (
        <a href="/cart" className="nav-link">
          <i className="fas fa-shopping-cart"></i> Cart
          <span id="nav-badge-desktop" className="desktop-badge" style={{ display: "none" }}>
            0
          </span>
        </a>
      )}
    </li>

    {/* Orders */}
    <li>
      {guestMode ? (
        <GuestProtectedLink href="/order">
          <i className="fa-solid fa-boxes-packing"></i> Track-orders
        </GuestProtectedLink>
      ) : (
        <Link href="/order">
          <i className="fa-solid fa-boxes-packing"></i> Track-orders
        </Link>
      )}
    </li>

    <li>
      <a href="#contact">
        <i className="fas fa-envelope"></i> Contact
      </a>
    </li>

    {/* Auth Buttons */}
    {guestMode ? (
      <a href="/login" className="signout-btn">
        <i className="fas fa-sign-in-alt"></i> Sign-in
      </a>
    ) : user ? (
      <button onClick={signOut} className="signout-btn">
        <i className="fas fa-sign-out-alt"></i> Sign-out
      </button>
    ) : (
      <a href="/login" className="signout-btn">
        <i className="fas fa-sign-in-alt"></i> Sign-in
      </a>
    )}
  </ul>
</nav>

{/* Hamburger Menu */}
<div className="hamburger" id="hamburger" data-aos="fade-down" data-aos-easing="ease-out-cubic" data-aos-duration="3000">
  &#9776;
  <span id="nav-badge-mobile" className="badge" style={{ display: "none" }}>
    0
  </span>
</div>

{/* Sliding Mobile Menu */}
<nav className="slider-menu" id="slider-menu">
  <button className="close-btn" id="close-btn">
    &times;
  </button>
  <ul>
    {/* Same-page anchors */}
    <li>
      <a href="#home">Home</a>
    </li>
    <li>
      <a href="#menu">Menu</a>
    </li>
    <li>
      <a href="#about">About</a>
    </li>

    {/* Cart */}
    <li>
      {guestMode ? (
        <GuestProtectedLink href="/cart">
          <i className="fas fa-shopping-cart"></i> Cart
          <span id="nav-badge-slider" className="desktop-badge" style={{ display: "none" }}>
            0
          </span>
        </GuestProtectedLink>
      ) : (
        <a href="/cart">
          <i className="fas fa-shopping-cart"></i> Cart
          <span id="nav-badge-slider" className="desktop-badge" style={{ display: "none" }}>
            0
          </span>
        </a>
      )}
    </li>

    {/* Orders */}
    <li>
      {guestMode ? (
        <GuestProtectedLink href="/order">
          <i className="fa-solid fa-boxes-packing"></i> Track-orders
        </GuestProtectedLink>
      ) : (
        <Link href="/order">
          <i className="fa-solid fa-boxes-packing"></i> Track-orders
        </Link>
      )}
    </li>

    <li>
      <a href="#contact">Contact</a>
    </li>

    {/* Auth Buttons */}
    {guestMode ? (
      <a href="/login" className="signout-btn-slider">
        <i className="fas fa-sign-in-alt"></i> Sign-in
      </a>
    ) : user ? (
      <button className="signout-btn-slider" onClick={signOut}>
        <i className="fas fa-sign-out-alt"></i> Sign-out
      </button>
    ) : (
      <a href="/login" className="signout-btn-slider">
        <i className="fas fa-sign-in-alt"></i> Sign-in
      </a>
    )}
  </ul>

  <div className="slider-footer-text">
    <div className="slider-contact-icons">
      <a href="#">
        <i className="fab fa-facebook-f"></i>
      </a>
      <a href="#">
        <i className="fab fa-twitter"></i>
      </a>
      <a href="#">
        <i className="fab fa-instagram"></i>
      </a>
    </div>
    &copy; Ancodes Burger Hub❤️
  </div>
</nav>
</div>
</header>

   
{/* Hero Section */}
<section id="home" className="home-hero">

  <div className="hero-content">
    {/* Left: Text + CTA */}
    <div className="hero-text"  data-aos="zoom-in" data-aos-easing="ease-out-cubic"  data-aos-duration="3000">
      <h2 className="hero-text-animate">
        <span>Ancodes Burger Hub 🍔</span>
      </h2>
      <p className="hero-text-animate">
        <i>Making insanely delicious burgers is our core...</i>
      </p>
      <a href="#menu">
        <button className="button">
          🔥 Order Now 
          <span className="shimmer"></span>
        </button>
      </a>
    </div>

    {/* Right: Burger Image */}
    <div className="hero-image">
      <img src="images/47912-removebg-preview.png"   data-aos="slide-left" data-aos-easing="ease-out-cubic"  data-aos-duration="3000" alt="Juicy Burger" />
    </div>
  </div>
</section>


      </div>

            {/* Cart Slider */}
      <div id="cart-slider" className="cart-slider">
        <img id="slider-img" className="slider-img"  alt="" />
        <div className="slider-details">
          <div className="slider-header">
            <h2 id="slider-name"></h2>
          </div>
          <p className="slider-item-description"></p>

          <div className="qty-control">
            <button id="decrease-qty" className="qty-btn" title="Reduce Quantity">−</button>
            <span id="slider-quantity">Qty: 1</span>
            <button id="increase-qty" className="qty-btn" title="increase Quantity">+</button>
          </div>
                  {/* Burger Add-Ons */}
        <div id="burger-addon-section" className="addons-section" style={{ display: "none" }}>
          <div className="addon-header">
            <h3>Add-Ons</h3>
          </div>

          <div className="addon-item">
            <label>
              <input type="checkbox" className="addon-checkbox" data-name="Extra Cheese" data-price="300" />
               🧀 Extra-Cheese (+₦300)
            </label>
            <div className="addon-qty" style={{ display: "none" }}>
              <button className="decrease-addon" title="Reduce Quantity">−</button>
              <span className="addon-count">Qty: 0</span>
              <button className="increase-addon" title="Increase Quantity">+</button>
            </div>
          </div>
          
          <div className="addon-item">
            <label>
              <input type="checkbox" className="addon-checkbox" data-name="Bacon" data-price="400" />
               🥓 Extra-Bacon (+₦400)
            </label>
            <div className="addon-qty" style={{ display: "none" }}>
              <button className="decrease-addon"  title="Reduce Quantity">−</button>
              <span className="addon-count">Qty: 0</span>
              <button className="increase-addon"  title="Increase Quantity">+</button>
            </div>
          </div>
             
          <div className="addon-item">
            <label>
              <input type="checkbox" className="addon-checkbox" data-name="Fries" data-price="500" />
               🍟 Fries (+₦500)
            </label>
            <div className="addon-qty" style={{ display: "none" }}>
              <button className="decrease-addon"  title="Reduce Quantity">−</button>
              <span className="addon-count">Qty: 0</span>
              <button className="increase-addon"  title="Increase Quantity">+</button>
            </div>
          </div>
        </div>

        {/* Smoothie Add-Ons */}
        <div id="smoothie-addon-section" className="addons-section" style={{ display: "none" }}>
          <div className="addon-header">
            <h3>Add-Ons</h3>
          </div>

          <div className="addon-item">
            <label>
              <input type="checkbox" className="addon-checkbox" data-name="Honey" data-price="300" />
              🍯 Honey (+₦300)
            </label>
            <div className="addon-qty" style={{ display: "none" }}>
              <button className="decrease-addon">−</button>
              <span className="addon-count">Qty: 0</span>
              <button className="increase-addon">+</button>
            </div>
          </div>
      
          <div className="addon-item">
            <label>
              <input type="checkbox" className="addon-checkbox" data-name="Protein Powder" data-price="300" />
              💪 Protein Powder (+₦300)
            </label>
            <div className="addon-qty" style={{ display: "none" }}>
              <button className="decrease-addon">−</button>
              <span className="addon-count">Qty: 0</span>
              <button className="increase-addon">+</button>
            </div>
          </div>
          
          <div className="addon-item">
            <label>
              <input type="checkbox" className="addon-checkbox" data-name="Oats" data-price="300" />
              🌾 Oats (+₦300)
            </label>
            <div className="addon-qty" style={{ display: "none" }}>
              <button className="decrease-addon">−</button>
              <span className="addon-count">Qty: 0</span>
              <button className="increase-addon">+</button>
            </div>
          </div>
         </div>
        </div>
        <button className="close-slider" title="Close">×</button> 

          <div className="adding">
            <p id="slider-price" className="slider-price"></p>
           <button id="confirm-add">🛒 Add to cart</button>
          </div> 
      </div>

      {/* Menu Section */}
      <section id="menu" className="menu">
        <h2 className="menu-heading"><i className="fa-solid fa-burger"></i> Burgers</h2>
        <div className="menu-items">
          {/* All burger items */}
          <div className="menu-item" data-name="🥩 Classic Beef Burger" data-price="8000" data-type="burger" data-aos="zoom-in" data-aos-easing="ease-out-cubic" data-aos-duration="400">
            <img src="/images/classic-beef-burger.jpeg" alt="img" />
            <h3>🥩 Classic Beef Burger</h3>
            <p>Juicy beef patty, cheddar cheese, lettuce, tomato, onion, pickles & house sauce.</p>
            <span>₦8,000</span><br />
            <button className="add-to-cart-btn">🛒Select</button>
          </div>

          <div className="menu-item" data-name="🧀 Cheesy Smash Burger" data-price="7500" data-type="burger" data-aos="zoom-in" data-aos-easing="ease-out-cubic" data-aos-duration="400">
            <img src="/images/grillrd-cheesy-smash-burger.jpeg" alt="img" />
            <h3>🧀 Cheesy Smash Burger</h3>
            <p>Smashed beef patties, melted cheese, grilled onions & mustard mayo.</p>
            <span>₦7,500</span><br />
            <button className="add-to-cart-btn">🛒Select</button>
          </div>

          <div className="menu-item" data-name="🌶️ Spicy Zinger Burger" data-price="6500" data-type="burger" data-aos="zoom-in" data-aos-easing="ease-out-cubic" data-aos-duration="400">
            <img src="/images/spicy-chcken-zinger-burger.jpeg" alt="img" />
            <h3>🌶️ Spicy Zinger Burger</h3>
            <p>Crispy fried chicken fillet, spicy mayo, lettuce, pickles & jalapeños.</p>
            <span>₦6,500</span><br />
            <button className="add-to-cart-btn">🛒Select</button>
          </div>

          <div className="menu-item" data-name="🍗 Grilled Chicken Burger" data-price="7000" data-type="burger" data-aos="zoom-in" data-aos-easing="ease-out-cubic" data-aos-duration="400">
            <img src="/images/grilled-chicken-burger.jpeg" alt="img" />
            <h3>🍗 Grilled Chicken Burger</h3>
            <p>Marinated grilled chicken breast, garlic aioli, fresh greens & tomatoes.</p>
            <span>₦7,000</span><br />
            <button className="add-to-cart-btn">🛒Select</button>
          </div>

          <div className="menu-item" data-name="🥑 Gourmet Veggie Burger" data-price="7500" data-type="burger" data-aos="zoom-in" data-aos-easing="ease-out-cubic" data-aos-duration="400">
        <img src="/images/gourmet-veggie-burger.jpeg" alt="img" />
        <h3>🥑 Gourmet Veggie Burger</h3>
        <p>Black bean or chickpea patty, avocado, caramelized onions, lettuce & spicy vegan mayo.</p>
        <span>₦7,500</span><br />
        <button className="add-to-cart-btn">🛒select</button>
      </div>

      <div className="menu-item" data-name="🧆 Crispy Falafel Burger" data-price="7500" data-type="burger" data-aos="zoom-in" data-aos-easing="ease-out-cubic" data-aos-duration="400">
        <img src="/images/falafel-burgers-1-4.jpg" alt="img" />
        <h3>🧆 Crispy Falafel Burger</h3>
        <p>Crunchy falafel patty, tahini sauce, pickled veggies, lettuce & onion rings.</p>
        <span>₦7,500</span><br />
        <button className="add-to-cart-btn">🛒select</button>
      </div>

      <div className="menu-item" data-name="🥓 BBQ Bacon Beef Burger" data-price="7000" data-type="burger" data-aos="zoom-in" data-aos-easing="ease-out-cubic" data-aos-duration="400">
        <img src="/images/bbq-bacon-burger.jpeg" alt="img" />
        <h3>🥓 BBQ Bacon Beef Burger</h3>
        <p>Beef patty, smoked bacon, cheddar & BBQ sauce.</p>
        <span>₦7,000</span><br />
        <button className="add-to-cart-btn">🛒select</button>
      </div>

      <div className="menu-item" data-name="🍳 Breakfast Burger" data-price="6500" data-type="burger" data-aos="zoom-in" data-aos-easing="ease-out-cubic" data-aos-duration="400">
        <img src="/images/breakfast-burger.jpeg" alt="img" />
        <h3>🍳 Breakfast Burger</h3>
        <p>Beef or chicken patty, fried egg, hash brown, cheese, & spicy ketchup.</p>
        <span>₦6,500</span><br />
        <button className="add-to-cart-btn">🛒select</button>
      </div>

      <div className="menu-item" data-name="🐟 Fish Fillet Burger" data-price="8000" data-type="burger" data-aos="zoom-in" data-aos-easing="ease-out-cubic" data-aos-duration="400">
        <img src="/images/fillet-fish-burger.jpeg" alt="img" />
        <h3>🐟 Fish Fillet Burger</h3>
        <p>Crispy fish fillet, tartar sauce, lettuce, & cheese.</p>
        <span>₦8,000</span><br />
        <button className="add-to-cart-btn">🛒select</button>
      </div>


       <div className="menu-item" data-name="🧄 Garlic Butter Burger" data-price="7000" data-type="burger"data-aos="zoom-in" data-aos-easing="ease-out-cubic" data-aos-duration="400">
        <img src="/images/garlic-butter-smash-burger.jpg" alt="img" />
        <h3>🧄 Garlic Butter Burger</h3>
        <p>Rich garlic butter seeps into every bite of this cheesy, tender burger with beef, lettuce & caramelized onions.</p>
        <span>₦7,000</span><br />
        <button className="add-to-cart-btn">🛒select</button>
      </div>

       <div className="menu-item" data-name="🔥 Ghost Pepper Burger" data-price="8000" data-type="burger" data-aos="zoom-in" data-aos-easing="ease-out-cubic" data-aos-duration="400">
        <img src="/images/ghost-pepper-burger.jpg" alt="img" />
        <h3>🔥 Ghost Pepper Burger</h3>
        <p>Only for the brave. A fiery patty loaded with ghost pepper cheese, spicy aioli, & pickled jalapeños.</p>
        <span>8,000</span><br />
        <button className="add-to-cart-btn">🛒select</button>
      </div>

      <div className="menu-item" data-name="🧀 Double Bacon Cheeseburger" data-price="12000" data-type="burger" data-aos="zoom-in" data-aos-easing="ease-out-cubic" data-aos-duration="400">
        <img src="/images/double-bacon-cheese-burger.webp" alt="img" />
        <h3>🧀 Double Bacon Cheeseburger</h3>
        <p>Double the meat, double the cheese & crispy bacon stacked high for a rich, savory bite.</p>
        <span>₦12,000</span><br />
        <button className="add-to-cart-btn">🛒select</button>
      </div>
        </div>
         

         <br />
         <br />
         <br />
         <br />
         <br />
         <br />
        {/* Smoothies Section */}
        <h2 className="menu-heading"><i className="fas fa-blender"></i> Smoothies</h2>
        <div className="menu-items">
          <div className="menu-item" data-name="🥭 Tropical Bliss Smoothie" data-price="3500" data-type="smoothie" data-aos="zoom-in" data-aos-easing="ease-out-cubic" data-aos-duration="400">
            <img src="/images/fruit-smoothie-recipes-healthy-768x1152.webp" alt="img" />
            <h3>🥭 Tropical Bliss Smoothie</h3>
            <p>A refreshing tropical explosion with juicy mango & pineapple, blended to creamy perfection with coconut milk.</p>
            <span>₦3,500</span><br />
            <button className="add-to-cart-btn">🛒Select</button>
          </div>

          <div className="menu-item" data-name="🍓 Berry Power Smoothie" data-price="3000" data-type="smoothie" data-aos="zoom-in" data-aos-easing="ease-out-cubic" data-aos-duration="400">
            <img src="/images/summer-strawberry-watermelon-smoothie-recipe-2-1-768x1152.webp" alt="img" />
            <h3>🍓 Berry Power Smoothie</h3>
            <p>This mixed berry blend gives you a sweet-tart punch & a protein boost from creamy yogurt.</p>
            <span>₦3,000</span><br />
            <button className="add-to-cart-btn">🛒Select</button>
          </div>

          <div className="menu-item" data-name="🍫 Choco-Banana Protein Smoothie" data-price="3500" data-type="smoothie" data-aos="zoom-in" data-aos-easing="ease-out-cubic" data-aos-duration="200">
            <img src="/images/chocolate-peanut-butter-smoothie-1-768x1152.webp" alt="img" />
            <h3>🍫 Choco-Banana Protein Smoothie</h3>
            <p>A rich and satisfying smoothie, chocolatey, nutty & naturally sweet.</p>
            <span>₦3,500</span><br />
            <button className="add-to-cart-btn">🛒Select</button>
          </div>

            <div className="menu-item" data-name="🥥 Vanilla Coconut Smoothie" data-price="3500"  data-type="smoothie" data-aos="zoom-in" data-aos-easing="ease-out-cubic" data-aos-duration="400">
        <img src="/images/healthy-eggnog-smoothie-768x1152.webp" alt="img" />
        <h3>🥥 Vanilla Coconut Smoothie</h3>
        <p> Coconut milk, vanilla extract, banana, dates, ice, Creamy & subtly sweet with tropical coconut flavor</p>
        <span>₦3,500</span><br />
        <button className="add-to-cart-btn">🛒select</button>
      </div>

      <div className="menu-item" data-name="🍌 Peanut Butter Banana Smoothie" data-price="3000" data-type="smoothie"  data-aos="zoom-in" data-aos-easing="ease-out-cubic" data-aos-duration="400">
        <img src="/images/Peanut-Butter-Banana-Smoothie-5-500x500.webp" alt="img" />
        <h3>🍌 Peanut Butter Banana Smoothie</h3>
        <p>A creamy, protein-packed smoothie, with rich banana & nutty peanut butter.</p>
        <span>₦3,000</span><br />
        <button className="add-to-cart-btn">🛒select</button>
      </div>

      <div className="menu-item" data-name="🍍 Piña Colada Smoothie" data-price="3000"  data-type="smoothie" data-aos="zoom-in" data-aos-easing="ease-out-cubic" data-aos-duration="400">
        <img src="/images/pina-colada-smoothie.jpeg" alt="img" />
        <h3>🍍 Piña Colada Smoothie</h3>
        <p> A tropical, vacation-in-a-cup treat—sweet, creamy & refreshing with pineapple.</p>
        <span>₦3,000</span><br />
        <button className="add-to-cart-btn">🛒select</button>
      </div>
  
      <div className="menu-item" data-name="🍊 Citrus Sunrise Smoothie" data-price="3000"  data-type="smoothie" data-aos="zoom-in" data-aos-easing="ease-out-cubic" data-aos-duration="400">
        <img src="/images/citrus-smoothie-6.jpg" alt="img" />
        <h3>🍊 Citrus Sunrise Smoothie</h3>
        <p>A zesty, immune-boosting blend bursting with vitamin C, perfect for starting your day with a citrus kick.</p>
        <span>₦3,000</span><br />
        <button className="add-to-cart-btn">🛒select</button>
      </div>

      <div className="menu-item" data-name="🍇Blueberry Smoothie" data-price="3500"  data-type="smoothie" data-aos="zoom-in" data-aos-easing="ease-out-cubic" data-aos-duration="400">
        <img src="/images/blueberry-almond-smoothie-1.jpg" alt="img" />
        <h3>🍇Blueberry Smoothie</h3>
        <p>A rich, antioxidant-heavy smoothie with a nutty twist—great for energy & brain health.</p>
        <span>₦3,500</span><br />
        <button className="add-to-cart-btn">🛒select</button>
      </div>
   
        </div>
      </section>


    <section id="about" className="about-section">
      <h2 className="about-heading" data-aos="fade-down">
        <i className="fa fa-info-circle"></i> About Us
      </h2>
      <br />
      <div className="about-container">
        {/* Text */}
        <div className="about-text">
          <p data-aos="fade-in" data-aos-delay="500">
            At AncodesBurger hub, we’re passionate about crafting the juiciest, most flavorful burgers made from the freshest ingredients. Every burger you see here is made with premium ingredients, handcrafted sauces, and that flame-kissed touch that keeps you coming back.
          </p>
          <br />
          <p data-aos="zoom-in" data-aos-delay="500">
            Whether you're grabbing a quick bite or hanging out with friends, AncodesBurger is your go-to spot for great taste and good vibes.
          </p>
        </div>

       

        {/* Testimonial */}
        <div className="testimonial-card" data-aos="fade-right" data-aos-delay="100">
          <p data-aos="zoom-in" data-aos-delay="200">
            Meet the founder <i className="fa fa-user"></i>
          </p>
          <br />
          <img src="images/my pp.webp" alt="Founder" className="founder-img" />
          <blockquote data-aos="zoom-in" data-aos-delay="200">
            I’m Anthony Onyejiuwa, and I built this brand to turn ordinary meals into bold, crave-worthy experiences.
            <br />
            This isn’t just fast food — it’s flavor with purpose. We’re here to make every bite unforgettable.
            <br />
            Thanks for riding with us. Let’s make every bite count.
          </blockquote>
          <h4 data-aos="zoom-in" data-aos-delay="300">- Anthony Onyejiuwa, Founder & CEO</h4>
        </div>
      </div>

     {/* Counters */}
<div className="counter-section" id="about">
  <div className="counter-box" data-aos="zoom-in" data-aos-delay="100">
    <h3><Counter target={85000} suffix="+" /></h3>
    <p>Burgers Served</p>
  </div>

  <div className="counter-box" data-aos="zoom-in" data-aos-delay="200">
    <h3><Counter target={12000} suffix="+" /></h3>
    <p>Happy Customers</p>
  </div>

  <div className="counter-box" data-aos="zoom-in" data-aos-delay="300">
    <h3><Counter target={25} suffix="+" /></h3>
    <p>Passionate Team Members</p>
  </div>

  <div className="counter-box" data-aos="zoom-in" data-aos-delay="400">
    <h3><Counter target={99.5} suffix="%" /></h3>
    <p>One-time Delivery rate</p>
  </div>
</div>

{/* Mission & Vision Button */}
<div className="btn-container">
  <button
    className="btn-mission"
    data-aos="fade-left"
    data-aos-delay="500"
    onClick={() => setShowMission(true)}
  >
    🎯 Our Mission & Vision
  </button>
</div>

{/* Mission & Vision Modal */}
{showMission && (
  <div className="modal-mission">
    <div className="modal-mission-content">
      <button className="close-mission"  title="close" onClick={() => setShowMission(false)}>
        ✖
      </button>
      <h2>🎯 Our Mission</h2>
      <p>
        To craft unforgettable burger experiences by using the finest ingredients, creative recipes, and heartfelt service that brings communities together one bite at a time.💖
      </p>
      <br />
      <h2>🌟 Our Vision</h2>
      <p>
        To become the go-to destination for burgers across Africa, known for flavor, innovation, and an unshakable commitment to customer delight and quality.
      </p>
    </div>
  </div>
)}


      {/* Why Ancodes Burger Hub */}
      <section className="section-merged" data-aos="fade-up">
        <div className="container">
          <h2 className="section-title" data-aos="zoom-in" data-aos-easing="ease-out-cubic" data-aos-duration="400">
            <span>Why Ancodes Burger Hub?</span>
          </h2>

          <div className="card-grid">
            {/* Why Choose Us */}
            <div className="why-card" data-aos="zoom-in" data-aos-easing="ease-out-cubic" data-aos-duration="500">
              <h3><i className="fas fa-award"></i> Why Choose Us</h3>
              <ul>
                <li><i className="fas fa-leaf"></i> 100% Fresh Ingredients</li>
                <li><i className="fas fa-fire"></i> Flame-Grilled to Perfection</li>
                <li><i className="fas fa-percent"></i> Discount on orders</li>
                <li><i className="fas fa-bolt"></i> Reliable & Superfast Delivery</li>
                <li><i className="fas fa-smile"></i> Happy Customers Always</li>
              </ul>
            </div>

            {/* How It Works */}
            <div className="why-card" data-aos="zoom-in" data-aos-easing="ease-out-cubic" data-aos-duration="500">
              <h3><i className="fas fa-sync-alt"></i> How It Works</h3>
              <ol>
                <li>1. Pick your favorite item(s) <i className="fa-solid fa-burger"></i><i className="fas fa-blender"></i></li>
                <li>2. Add item(s) to cart <i className="fas fa-shopping-cart"></i></li>
                <li>3. Checkout securely <i className="fa fa-credit-card"></i></li>
                <li>4. Get it hot & fresh <i className="fas fa-fire"></i></li>
                <li>5. Review your orders & receipts <i className="fa-solid fa-boxes-packing"></i></li>
              </ol>
            </div>
             <div className="why-card" data-aos="zoom-in" data-aos-easing="ease-out-cubic" data-aos-duration="500">
      <h3><i className="fas fa-comment-dots"></i> Testimonials</h3>

      <div className="testimonial-slider-wrapper">
        <div className="testimonial-fade-slider" id="testimonialFadeSlider">
          <div className="testimonial-slide active">
            <p>"These burgers and smoothies are dangerously good 😍!"</p>
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <strong>- Tunde, Lagos</strong>
          </div>
          <div className="testimonial-slide">
            <p>"Delivery is always fast and the taste is 🔥."</p>
            <div className="stars">⭐⭐⭐⭐</div>
            <strong>- Amaka, Abuja</strong>
          </div>
          <div className="testimonial-slide">
            <p>"My kids love it every Friday night 🍟👨‍👩‍👧‍👦!"</p>
            <div className="stars">⭐⭐⭐</div>
            <strong>- Mr. Okonkwo, Enugu</strong>
          </div>
          <div className="testimonial-slide">
            <p>"The spicy deluxe is elite 🌶️❤️."</p>
            <div className="stars">⭐⭐⭐⭐</div>
            <strong>- Amina, Kano</strong>
          </div>
          <div className="testimonial-slide">
            <p>"Best buns in Nigeria. No cap. 🍞💯"</p>
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <strong>- Dayo, PH</strong>
          </div>
          <div className="testimonial-slide">
            <p>"Unbeatable taste and quick service. My go-to lunch spot every time! 👌🍔"</p>
            <div className="stars">⭐⭐⭐⭐</div>
            <strong>- Jennifer, Lekki</strong>
          </div>
          <div className="testimonial-slide">
            <p>"The cheesy smash burger and vanilla coconut smooothie melted my soul. I literally crave it daily 🧀🔥."</p>
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <strong>- Chuka, Owerri</strong>
          </div>
          <div className="testimonial-slide">
            <p>"I love how the packaging always arrives neat and hot. Professional! 📦✨"</p>
            <div className="stars">⭐⭐⭐⭐</div>
            <strong>- Ifeoma, Asaba</strong>
          </div>
          <div className="testimonial-slide">
            <p>"Tried it once at a friend’s place and I’ve never gone back to regular burgers 🤤🍟."</p>
            <div className="stars">⭐⭐⭐⭐</div>
            <strong>- Ugo, Benin City</strong>
          </div>
          <div className="testimonial-slide">
            <p>"I get the same premium quality every single time. Consistency is key 🔑❤️."</p>
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <strong>- Seyi, Ibadan</strong>
          </div>
          <div className="testimonial-slide">
            <p>"Amazing customer support and even better burgers! What a combo 🛎️🍔."</p>
            <div className="stars">⭐⭐⭐⭐</div>
            <strong>- Bukola, Ilorin</strong>
          </div>
          <div className="testimonial-slide">
            <p>"They remember my regular order. Personalized service like no other 🙌💬."</p>
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <strong>- Remi, Abeokuta</strong>
          </div>
          <div className="testimonial-slide">
            <p>"The grilled chicken burger? Absolute madness. Who thought of that genius? 🔥🍛🍔"</p>
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <strong>- Victor, Uyo</strong>
          </div>
          <div className="testimonial-slide">
            <p>"Even my grandma approves — and she doesn’t like fast food 😂👵."</p>
            <div className="stars">⭐⭐⭐⭐</div>
            <strong>- Fola, Makurdi</strong>
          </div>
          <div className="testimonial-slide">
            <p>"Rain or shine, Ancodes delivers. I’m hooked for life! ☔🍔☀️"</p>
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <strong>- Zainab, Calabar</strong>
          </div>
          <div className="testimonial-slide">
            <p>"The BBQ bacon beef burger is a national treasure. 🔥"</p>
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <strong>- Tosin, Yaba</strong>
          </div>
          <div className="testimonial-slide">
            <p>"Date night just got a lot more delicious. 💑🍔🥤"</p>
            <div className="stars">⭐⭐⭐⭐</div>
            <strong>- Tola, Gwarinpa</strong>
          </div>
          <div className="testimonial-slide">
            <p>"I ordered once and became a loyal fan."</p>
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <strong>- Kelvin, Owerri</strong>
          </div>
          <div className="testimonial-slide">
            <p>"The beef is juicy, buns are soft, everything’s perfect. 🥩🍞💯"</p>
            <div className="stars">⭐⭐⭐⭐</div>
            <strong>- Sandra, Warri</strong>
          </div>
          <div className="testimonial-slide">
            <p>"Great vibe, even greater taste. Feels gourmet. 🧑‍🍳✨"</p>
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <strong>- Michael, Ikeja</strong>
          </div>
          <div className="testimonial-slide">
            <p>"They know how to bring the heat! 🔥🔥🔥"</p>
            <div className="stars">⭐⭐⭐⭐</div>
            <strong>- Habiba, Kaduna</strong>
          </div>
          <div className="testimonial-slide">
            <p>"The vegetarian option is a winner too! 🌱🍔"</p>
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <strong>- Ada, Nsukka</strong>
          </div>
          <div className="testimonial-slide">
            <p>"My office orders lunch every Wednesday now. 😎📦"</p>
            <div className="stars">⭐⭐⭐⭐</div>
            <strong>- Segun, VI</strong>
          </div>
          <div className="testimonial-slide">
            <p>"Honestly, the best burger I’ve tasted in Nigeria. 🇳🇬🍔"</p>
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <strong>- Blessing, Jos</strong>
          </div>
          <div className="testimonial-slide">
            <p>"Quick delivery and warm burgers. 10/10. 🏍️🔥"</p>
            <div className="stars">⭐⭐⭐⭐</div>
            <strong>- Rachael, Umuahia</strong>
          </div>
          <div className="testimonial-slide">
            <p>"They made me love burgers again! 💘🍔"</p>
            <div className="stars">⭐⭐⭐⭐</div>
            <strong>- Ngozi, Sapele</strong>
          </div>
          <div className="testimonial-slide">
            <p>"I recommend them to anyone who eats food. 😂🍴"</p>
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <strong>- Bash, Gombe</strong>
          </div>
          <div className="testimonial-slide">
            <p>"So flavorful, it deserves a Michelin star! ⭐🍔"</p>
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <strong>- Nkem, Aba</strong>
          </div>
          <div className="testimonial-slide">
            <p>"When I’m feeling down, I order a burger. Works every time. 😌🍔"</p>
            <div className="stars">⭐⭐⭐⭐</div>
            <strong>- Halima, Lafia</strong>
          </div>
          <div className="testimonial-slide">
            <p>"My tastebuds are living their best life. 👅🍔"</p>
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <strong>- Dami, Akure</strong>
          </div>
          <div className="testimonial-slide">
            <p>"The burger sauce? Life changing. 🧄🍅🌶️"</p>
            <div className="stars">⭐⭐⭐⭐</div>
            <strong>- Chidera, Eket</strong>
          </div>
          <div className="testimonial-slide">
            <p>"Tasted it at a pop-up — hooked since then. 🎪🍔"</p>
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <strong>- Tomiwa, Lokoja</strong>
          </div>
          <div className="testimonial-slide">
            <p>"Support Nigerian brands that get it right 👏🇳🇬"</p>
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <strong>- Azeez, Ijebu Ode</strong>
          </div>
        </div>
      </div>
    </div>

          </div>
        </div>
      </section>
    </section>

   
    <section id="contact" className="contact">
        <h2 className="top" data-aos="fade-down">
          <i className="fas fa-envelope"></i> Contact Us
        </h2>

        <section className="lottie">
          <div className="lottie-wrapper">
            <dotlottie-wc
              src="https://lottie.host/8f69617c-09c1-4ada-90f3-ef9d793b3090/1wFTJ5Aziv.lottie"
              style={{ width: "320px", height: "300px" }}
              speed="1"
              autoplay
              loop
            ></dotlottie-wc>
          </div>
        </section>

        <div
          className="contact-container"
          data-aos="zoom-in"
          data-aos-easing="ease-out-cubic"
          data-aos-duration="500"
        >
          <div className="contact-form" style={{ margin: "0 auto", maxWidth: "600px" }}>
            <form action="#" noValidate>
              <input type="text" placeholder="Your Name" required />
              <input type="email" placeholder="Your Email" required />
              <textarea placeholder="Your Message" rows="5" required></textarea>
              <button type="submit">
                Send Message <i className="fa-solid fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer">
        <div className="footer-container">
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" aria-label="Facebook" className="social-link facebook" title="Facebook">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="#3b5998"
                width="30"
                height="30"
              >
                <path d="M22.675 0h-21.35C.596 0 0 .593 0 1.326v21.348C0 23.406.596 24 1.325 24h11.495v-9.294H9.691v-3.622h3.129V8.413c0-3.1 1.894-4.788 4.66-4.788 1.325 0 2.464.099 2.797.143v3.24l-1.92.001c-1.504 0-1.796.715-1.796 1.764v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.324-.594 1.324-1.326V1.326C24 .593 23.404 0 22.675 0z" />
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" aria-label="Twitter" className="social-link twitter"  title="twitter">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="#1da1f2"
                width="30"
                height="30"
              >
                <path d="M23.954 4.569c-.885.392-1.83.656-2.825.775 1.014-.608 1.794-1.574 2.163-2.724-.951.555-2.005.959-3.127 1.184-.897-.957-2.178-1.555-3.594-1.555-2.72 0-4.924 2.203-4.924 4.924 0 .39.045.765.127 1.124C7.691 8.095 4.066 6.13 1.64 3.161c-.427.732-.666 1.58-.666 2.476 0 1.708.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.825-.413.111-.849.171-1.296.171-.317 0-.626-.03-.927-.086.627 1.956 2.444 3.379 4.6 3.419-1.68 1.316-3.808 2.102-6.102 2.102-.397 0-.788-.023-1.175-.069 2.179 1.397 4.768 2.211 7.557 2.211 9.054 0 14-7.496 14-13.986 0-.21 0-.423-.015-.633.962-.695 1.8-1.562 2.46-2.549z" />
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" aria-label="Instagram" className="social-link instagram"  title="Instagram">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="#e4405f"
                width="30"
                height="30"
              >
                <path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zm8.75 2a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" />
              </svg>
            </a>
          </div>
          <p>&copy; 2025 Ancodesburger. All rights reserved.</p>
          <p>
            Developed by <span><a href="#">Ancodes</a></span>🤍
          </p>
        </div>
      </footer>

{/* Discount Modal */}
{isOpen && (
  <div className="discount-modal">
    <div className="modal-contents" ref={modalRef}>
      {/* Close button */}
      <button className="closes-btn" onClick={closeDiscountModal}>
        ✖
      </button>

      {/* Lottie animation */}
      <dotlottie-wc
        src="https://lottie.host/11dbbcbe-8b70-4dfe-809e-05fe7773d1a2/sOziJdONXc.lottie"
        style={{ width: "260px", height: "160px" }}
        speed="1"
        autoplay
        loop
      ></dotlottie-wc>

      <h2>🔥 Limited Time Offer!</h2>
      <p>
        Enjoy a juicy <strong>10% OFF</strong> your burger order today!
      </p>
      <p>
        Use code: <span className="highlight-code">BURGER10</span> at checkout!
      </p>

      <button id="close-modal-btn" onClick={closeDiscountModal}>
        Got it!
      </button>
    </div>
  </div>
)}



      {/* Scroll to Top Button */}
      <button id="scrollToTopBtn" className="scroll-top-btn" title="scroll to top" aria-label="Scroll to top">
        <span className="arrow">↑</span>
      </button>
    </>
  );
}
