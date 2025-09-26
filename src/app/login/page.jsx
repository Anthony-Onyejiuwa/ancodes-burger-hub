"use client";
import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "./login.css";
import jwt_decode from "jwt-decode";
import Swal from "sweetalert2";
import HandPointer from "@/components/HandPointer";


export default function LoginPage() {
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [showGoogleBtn, setShowGoogleBtn] = useState(false);

  const CLIENT_ID =
    "467816540214-g8fuotcnncrqsvognl5n7atsdoc0e86c.apps.googleusercontent.com";

  //  Initialize AOS and floating emojis
  useEffect(() => {
    AOS.init({ duration: 200, delay: 150 });

    const container = document.getElementById("emoji-bg");
    if (container) {
      for (let i = 0; i < 40; i++) {
        const emoji = document.createElement("span");
        emoji.innerText = "🍔";
        emoji.style.left = Math.random() * 100 + "vw";
        emoji.style.top = Math.random() * 100 + "vh";
        emoji.style.fontSize = 1 + Math.random() * 1.5 + "rem";
        emoji.style.animationDelay = Math.random() * 20 + "s";
        emoji.style.animationDuration = 15 + Math.random() * 10 + "s";
        container.appendChild(emoji);
      }
    }
  }, []);

  //  Load Google SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleLoaded(true);
    document.body.appendChild(script);

    return () => document.body.removeChild(script);
  }, []);

  //  Theme toggle
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    const toggleBtn = document.getElementById("themes-toggle");
    if (!toggleBtn) return;

    toggleBtn.textContent = savedTheme === "dark" ? "🌗" : "🌗";
    toggleBtn.onclick = () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      toggleBtn.textContent = next === "dark" ? "🌗" : "🌗";
    };
  }, []);

  //  Logout success toast
useEffect(() => {
  if (localStorage.getItem("logoutSuccess") === "true") {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "🍔 You’ve logged out of Ancodes Burger Hub!",
      text: "Come back for more sizzling burgers 🔥",
      showConfirmButton: false,
      timer: 7000,
      background: "#fff8f0",
      color: "#333",
      timerProgressBar: true,
    });
    localStorage.removeItem("logoutSuccess");
  }
}, []);

  //  Google Sign-In callback
const handleCredentialResponse = (response) => {
  const decoded = jwt_decode(response.credential);
  const { name, email, picture } = decoded;

  localStorage.setItem(
    "user",
    JSON.stringify({ name, email, picture, credential: response.credential })
  );

  //  Ensure guest mode is OFF when user logs in
  localStorage.setItem("guestMode", "false");

  localStorage.setItem("loginSuccess", "true");
  localStorage.setItem("welcomeBack", "true");

  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title: `Welcome back, ${name}! 😎`,
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
  });

  window.location.href = "/#home";
};


  //  Handle "Get Started" button click
  const handleGetStarted = () => {
    setShowGoogleBtn(true);

    const btnContainer = document.getElementById("google-signin-btn");
    btnContainer.style.display = "block";

    if (googleLoaded && window.google && btnContainer) {
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
      });

      window.google.accounts.id.renderButton(btnContainer, {
        theme: "outline",
        size: "large",
        shape: "pill",
        width: 250,
        text: "continue_with",
      });
    }

    const audio = document.getElementById("clickSound");
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
  };

  //  Guest mode
  const handleGuestMode = () => {
    localStorage.setItem("guestMode", "true");
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "info",
      title: "Guest mode enabled",
      text: "Some features will be restricted",
      showConfirmButton: false,
      timer: 10000,
      timerProgressBar: true,
    });
    window.location.href = "/#home";
  };

  const handleTooltip = (e) => {
  const tooltip = document.createElement("div");
  tooltip.className = "mobile-tooltip";
  tooltip.innerText = "Find other burger shops near you";
  document.body.appendChild(tooltip);

  const rect = e.currentTarget.getBoundingClientRect();
  tooltip.style.position = "absolute";
  tooltip.style.top = `${rect.bottom + 8}px`;
  tooltip.style.left = `${rect.left + rect.width/2}px`;
  tooltip.style.transform = "translateX(-50%)";
  tooltip.style.background = "#333";
  tooltip.style.color = "#fff";
  tooltip.style.padding = "5px 10px";
  tooltip.style.borderRadius = "6px";
  tooltip.style.fontSize = "0.65rem";
  tooltip.style.opacity = "0";
  tooltip.style.transition = "opacity 0.3s";

  requestAnimationFrame(() => tooltip.style.opacity = "1");

  setTimeout(() => {
    tooltip.style.opacity = "0";
    setTimeout(() => tooltip.remove(), 300);
  }, 2000);
};




  return (
    <div className="outter">
      {/* Floating Burger Background */}
      <div className="emoji-bg" id="emoji-bg"></div>
      

      {/* Click Audio */}
      <audio id="clickSound" preload="auto">
        <source src="/audio/button-click-sound.mp3" type="audio/mpeg" />
      </audio>


{/* HandPointer for light & dark mode */}
<HandPointer
  targetId="start-btn"
  scale={0.8}
  lightImage="/images/handpointer11 (1).webp"
  darkImage="/images/handpointer13 (1).webp"
/>


      <div className="login-container">
        {/* Logo */}
        <div className="header-logo" data-aos="fade-in" data-aos-easing="ease-out-cubic"  data-aos-duration="700">
          <img src="/images/header logo.png" alt="logo" height="80" width="80" />
        </div>
 <div className="guest-mode" >
  <button className="btn guest-btn"  data-aos="fade-in" data-aos-easing="ease-out-cubic"  data-aos-duration="700" onClick={handleGuestMode}>
    <span>👤Visit as guest</span>
  </button>
</div>
  <a
      href="https://www.google.com/maps/search/burger+shop+near+me"
      target="_blank"
      rel="noopener noreferrer"
      className="find-burger-btn"
      data-aos="fade-in" data-aos-easing="ease-out-cubic"  data-aos-duration="700"
      title="Find other burger shops near you"
       onClick={handleTooltip}
    >
      🔎🍔
    </a>

        {/* Theme Toggle */}
        <div className="mode-toggle"  data-aos="fade-down" data-aos-easing="ease-out-cubic" data-aos-duration="1500"   title="theme toggle">
          <button id="themes-toggle" aria-label="Toggle Light/Dark Mode">
            🌗
          </button>
        </div>

       


        {/* Left Side */}
        <div className="login-left"  data-aos="zoom-in" data-aos-easing="ease-out-cubic" data-aos-duration="1000">
          <div className="burger-container">
            <h1 className="burger-heading">Ancodes Burger Hub</h1>
            <img
              src="/images/burger_pin_white_clean.png"
              alt="logo"
              height="60"
              width="60"
              className="logo-img"
            />
          </div>
          <strong className="text">Choosing Quality & Fresh Food</strong>
          <p className="subtext">Login effortlessly. Your burgers, your way.</p>

        {/* Buttons container */}
<div
  className="button-wrapper"
  style={{ position: "relative", height: "40px", marginTop: "15px" }}
>
  {/* Get Started Button */}
  {!showGoogleBtn && (
    <button
      id="start-btn"
      className="btn neon-pulse"
      onClick={handleGetStarted}
    >
      <span>Get Started 🚀</span>
    </button>
  )}

  {/* Google Sign-In */}
  <div className="google-b">
    <div
      id="google-signin-btn"
      style={{
        display: showGoogleBtn ? "block" : "none",
      }}
    ></div>
  </div>
</div>
          <small className="privacy-note">
            Your information is securely handled, we respect your privacy.🔐
          </small>
        </div>

        {/* Right Side */}
       <div className="login-right"  data-aos="zoom-out" data-aos-easing="ease-out-cubic" data-aos-duration="1000">
  <div className="hero-img">
    <img
      src="/images/double-bacon-cheeseburger_compressed_compressed_compressed_compressed_compressed (1).webp"
      alt="Juicy Burger"
      className="burger-img"
    />

    {/* Labels on image */}
    <div className="label top-left"  data-aos="fade-in" data-aos-easing="ease-out-cubic" data-aos-delay="2400"  data-aos-duration="700">⚡ Fast Delivery</div>
    <div className="label bottom-left"  data-aos="fade-in" data-aos-duration="700" data-aos-easing="ease-out-cubic" data-aos-delay="1900" >👨‍🍳 Crafted With Care </div>
     <div className="label bottom-right"  data-aos="fade-in" data-aos-easing="ease-out-cubic" data-aos-delay="3000"  data-aos-duration="700">💸 Exclusive Discount</div>
  </div>
</div>

      </div>
    </div>
  );
}
