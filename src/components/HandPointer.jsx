
"use client"; 

import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

export default function HandPointer({
  targetId,
  scale = 1,
  lightImage = "/images/handpointer5.png",
  darkImage = "/images/handpointer7.png",
}) {
  const [show, setShow] = useState(false);
  const [theme, setTheme] = useState("light"); // default
  const controls = useAnimation();

  // Sync theme after mount
  useEffect(() => {
    const currentTheme =
      document.documentElement.getAttribute("data-theme") || "light";
    setTheme(currentTheme);

    const observer = new MutationObserver(() => {
      const updatedTheme =
        document.documentElement.getAttribute("data-theme") || "light";
      setTheme(updatedTheme);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  // Show only on desktop width
  useEffect(() => {
    const handleResize = () => setShow(window.innerWidth >= 901);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Animation run once after page load
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        controls
          .start({
            x: "-50px",
            transition: { duration: 1.5, ease: "easeOut" },
          })
          .then(() => {
            controls.start({
              x: ["-50px", "-42px", "-50px", "-42px", "-50px"],
              transition: {
                duration: 3,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 7,
              },
            });
          });
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [show, controls]);

  if (!show) return null;

  const imageSrc = theme === "dark" ? darkImage : lightImage;

  return (
    <motion.div
      initial={{ x: "-100%", opacity: 1 }}
      animate={controls}
      style={{
        position: "fixed",
        top: "47%",
        left: 0,
        zIndex: 2000,
        pointerEvents: "none",
      }}
    >
      <img
        key={theme}
        src={imageSrc}
        alt="Hand pointer"
        style={{
          width: `${268 * scale}px`,
           height: "auto",
          objectFit: "contain",
          transform: "translateX(-0%)",
          transition: "opacity 0.3s ease",
        }}
      />
    </motion.div>
  );
}

