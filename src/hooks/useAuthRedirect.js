"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function useAuthRedirect(pageName) {
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const guestMode = localStorage.getItem("guestMode") === "true";

    if (!user && !guestMode) {
      // Not signed in at all → force login
      router.replace("/login");
    } else if (guestMode) {
      // Guest trying to access restricted pages
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: "Sign in to access " + pageName,
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
      });
      router.replace("/"); // back to homepage
    }
  }, [router, pageName]);
}
