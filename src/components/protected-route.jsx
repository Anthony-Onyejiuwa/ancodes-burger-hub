"use client";
import Link from "next/link";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";

export function GuestProtectedLink({ href, children, ...props }) {
  const [isGuest, setIsGuest] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const guestMode = localStorage.getItem("guestMode") === "true";
    const userData = localStorage.getItem("user");

    setIsGuest(guestMode);
    setIsLoggedIn(!!userData);
  }, []);

  const restrictedLinks = ["/cart", "/order"]; //  Guest restrictions only

  const handleClick = (e) => {
    // only block guests, not logged-in users
    if (isGuest && !isLoggedIn && restrictedLinks.includes(href)) {
      e.preventDefault();
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: "Sign in to access this feature",
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
      });
    }
  };

  return (
    <Link href={href} {...props} onClick={handleClick}>
      {children}
    </Link>
  );
}
