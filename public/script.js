
  window.addEventListener('beforeunload', () => {
    window.scrollTo(0, 0);
  });


  localStorage.removeItem('lastScrollY');

  const savedScroll = localStorage.getItem('lastScrollY');

if (!window.location.hash && savedScroll !== null && !document.body.classList.contains('no-scroll')) {
  window.scrollTo({ top: parseInt(savedScroll) });
}

  let selectedItem = {};
  let sliderQty = 1;
  let toastTimeout;
  let selectedAddons = [];

  document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', () => {
      document.getElementById("toasts").classList.remove("show");
      const parent = button.closest('.menu-item');
      const name = parent.getAttribute('data-name');
      const price = parseFloat(parent.getAttribute('data-price'));
      const description = parent.querySelector('p')?.innerText || '';
      const img = parent.querySelector('img').getAttribute('src');
      const itemType = parent.getAttribute('data-type');
const burgerAddons = document.getElementById('burger-addon-section');
const smoothieAddons = document.getElementById('smoothie-addon-section');

if (itemType === 'burger') {
  burgerAddons.style.display = 'block';
  smoothieAddons.style.display = 'none';
} else if (itemType === 'smoothie') {
  smoothieAddons.style.display = 'block';
  burgerAddons.style.display = 'none';
} else {
  smoothieAddons.style.display = 'none';
  burgerAddons.style.display = 'none';
}


      selectedItem = { name, price, description, img };
      sliderQty = 1;
      selectedAddons = []; // reset

      document.getElementById('slider-name').textContent = name;
      document.getElementById('slider-price').textContent = `₦${price.toLocaleString()}`;
      document.querySelector('.slider-item-description').textContent = description;
      document.getElementById('slider-img').src = img;
    document.getElementById('slider-quantity').textContent = `Qty: ${sliderQty}`;


      // Reset add-ons
      document.querySelectorAll('.addon-checkbox').forEach(cb => {
        cb.checked = false;
        cb.closest('.addon-item').querySelector('.addon-qty').style.display = 'none';
        cb.closest('.addon-item').querySelector('.addon-count').textContent = '0';
      });

      document.getElementById('cart-slider').classList.add('show');
      document.body.style.overflow = 'hidden';
      updateSliderPrice();
    });
  });

  document.querySelector('.close-slider').addEventListener('click', () => {
    document.getElementById('cart-slider').classList.remove('show');
    document.body.style.overflow = '';
  });

  document.getElementById('increase-qty').addEventListener('click', () => {
    sliderQty++;
   document.getElementById('slider-quantity').textContent = `Qty: ${sliderQty}`;

    updateSliderPrice();
  });

  document.getElementById('decrease-qty').addEventListener('click', () => {
    if (sliderQty > 1) {
      sliderQty--;
     document.getElementById('slider-quantity').textContent = `Qty: ${sliderQty}`;

      updateSliderPrice();
    }
  });

  document.getElementById('confirm-add').addEventListener('click', () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    const fullItem = {
      ...selectedItem,
      quantity: sliderQty,
      addons: selectedAddons.filter(addon => addon.quantity > 0)
    };

    cart.push(fullItem);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    showToastWithUpdate(selectedItem.name, sliderQty);
    document.getElementById('cart-slider').classList.remove('show');
    document.body.style.overflow = '';
  });

  function updateSliderPrice() {
    const base = selectedItem?.price || 0;
    let addonTotal = 0;

    selectedAddons = []; // reset

    document.querySelectorAll('.addon-item').forEach(item => {
      const checkbox = item.querySelector('.addon-checkbox');
      const qty = parseInt(item.querySelector('.addon-count').textContent);
      const price = parseInt(checkbox.dataset.price);
      const name = checkbox.dataset.name;

      if (checkbox.checked && qty > 0) {
        addonTotal += price * qty;
        selectedAddons.push({ name, price, quantity: qty });
      }
    });

    const total = (base * sliderQty) + addonTotal;
    document.getElementById('slider-price').textContent = `Total price:  ₦${total.toLocaleString()}`;
  }


  function showToastWithUpdate(itemName, quantity) {
    const toast = document.querySelector(".toasts");
    const toastMsg = toast.querySelector(".toasts-message");
    toastMsg.textContent = `✔️ ${itemName} (x${quantity}) added to cart`;
    toast.classList.add("show");

    if (toastTimeout) clearTimeout(toastTimeout);
    if (window.toastDismissTimeout) clearTimeout(window.toastDismissTimeout);

    toastTimeout = setTimeout(() => {
      toastMsg.classList.add("fade-out");
      setTimeout(() => {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        toastMsg.textContent = `🛒 Total of ${totalItems} item(s) in cart`;
        toastMsg.classList.remove("fade-out");
      }, 400);
    }, 4000);

    window.toastDismissTimeout = setTimeout(() => {
      toast.classList.remove("show");
    }, 120000);
  }

  document.getElementById('proceed-btn').addEventListener('click', () => {
    document.querySelector(".toasts").classList.remove("show");
    window.location.href = '/cart';
  });

  // Add-on behavior
  document.querySelectorAll('.addon-checkbox').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const container = checkbox.closest('.addon-item');
      const qtySection = container.querySelector('.addon-qty');
      const count = container.querySelector('.addon-count');

      if (checkbox.checked) {
        qtySection.style.display = 'flex';
        count.textContent = '1';
      } else {
        qtySection.style.display = 'none';
        count.textContent = '0';
      }
      updateSliderPrice();
    });
  });

  document.querySelectorAll('.increase-addon').forEach(btn => {
    btn.addEventListener('click', () => {
      const count = btn.parentElement.querySelector('.addon-count');
      count.textContent = parseInt(count.textContent) + 1;
      updateSliderPrice();
    });
  });

  document.querySelectorAll('.decrease-addon').forEach(btn => {
    btn.addEventListener('click', () => {
      const count = btn.parentElement.querySelector('.addon-count');
      const checkbox = btn.closest('.addon-item').querySelector('.addon-checkbox');
      let value = parseInt(count.textContent);
      if (value > 1) {
        count.textContent = value - 1;
      } else {
        count.textContent = "0";
        checkbox.checked = false;
        btn.closest('.addon-qty').style.display = 'none';
      }
      updateSliderPrice();
    });
  });

function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  const mobileBadge = document.getElementById('nav-badge-mobile');
  const desktopBadge = document.getElementById('nav-badge-desktop');
  const sliderBadge = document.getElementById('nav-badge-slider');

  [mobileBadge, desktopBadge, sliderBadge].forEach(badge => {
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
  });
}

document.addEventListener('DOMContentLoaded', updateCartBadge);


document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const sliderMenu = document.getElementById('slider-menu');
  const closeBtn = document.getElementById('close-btn');
  const sliderLinks = sliderMenu.querySelectorAll('a');

 let lastScrollY = 0;

// Open slider
hamburger.addEventListener('click', () => {
  lastScrollY = window.scrollY;

  document.body.classList.add('no-scroll');
  document.body.style.position = 'fixed';
  document.body.style.top = `-${lastScrollY}px`;
  document.body.style.width = '100%';

  sliderMenu.classList.add('open');
});

// Close slider
closeBtn.addEventListener('click', () => {
  sliderMenu.classList.remove('open');

  // Delay unfixing body to prevent scroll jump
  const scrollY = parseInt(document.body.style.top || '0') * -1;

  document.body.style.removeProperty('position');
  document.body.style.removeProperty('top');
  document.body.style.removeProperty('width');
  document.body.classList.remove('no-scroll');

  // Allow time for layout to update before restoring scroll
  window.requestAnimationFrame(() => {
    window.scrollTo(0, scrollY);
  });
});


sliderLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');

    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (!target) return;

      sliderMenu.classList.remove('open');
      document.body.classList.remove('no-scroll');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';

      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth' });
      }, 350);
    } else {
    
      sliderMenu.classList.remove('open');
      document.body.classList.remove('no-scroll');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    }
  });
});

  

});

document.addEventListener('DOMContentLoaded', () => {
  const preloader = document.getElementById('preloader');
  const content = document.getElementById('content');

  // Lock scroll
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  document.body.style.height = '100vh';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';

  content.style.opacity = '0';
  content.style.pointerEvents = 'none';

  // Get previous scroll position from localStorage
  const savedScroll = localStorage.getItem('lastScrollY');

  setTimeout(() => {
    preloader.style.transition = 'opacity 0.5s ease';
    preloader.style.opacity = '0';

    setTimeout(() => {
      preloader.style.display = 'none';
      content.style.opacity = '1';
      content.style.pointerEvents = 'auto';

      //  Unlock scroll
      document.documentElement.style.overflow = 'auto';
      document.body.style.overflow = 'auto';
      document.body.style.height = '';
      document.body.style.position = '';
      document.body.style.width = '';

     // Only restore scroll if slider/modal did NOT already handle it
if (savedScroll !== null && !document.body.classList.contains('no-scroll')) {
  window.scrollTo({ top: parseInt(savedScroll) });
}


      // Re-trigger animations
      const allAnimated = document.querySelectorAll(
        '.hero-image, .hero-text-animate, #theme-toggle, header nav ul, .logo, .hamburger'
      );
      allAnimated.forEach(elem => {
        elem.style.animation = 'none';
        void elem.offsetWidth;
        elem.style.animation = '';
      });
    }, 500);
  }, 4000);

  
});

  const themeToggleBtn = document.getElementById('theme-toggle');
  const body = document.body;

  // Load saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    body.setAttribute('data-theme', 'dark');
    themeToggleBtn.textContent = '🌗';
  }

  themeToggleBtn.addEventListener('click', () => {
    if (body.getAttribute('data-theme') === 'dark') {
      body.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      themeToggleBtn.textContent = '🌗';
    } else {
      body.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      themeToggleBtn.textContent = '🌗';
    }
  });

  function toggleVisionModal() {
    const modal = document.getElementById('visionModal');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
  }

  window.addEventListener('click', (e) => {
    const modal = document.getElementById('visionModal');
    if (e.target === modal) modal.style.display = 'none';
  });

  let lastScrollY = 0;

  let scrollY = 0;

  function openMissionModal() {
    scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.classList.add('no-scroll');

    document.getElementById("missionModal").style.display = "block";
  }

  function closeMissionModal() {
    document.getElementById("missionModal").style.display = "none";

    // Restore scroll position 
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.classList.remove('no-scroll');
    window.scrollTo(0, scrollY);
  }

  //  Close modal when clicking outside
window.addEventListener("click", function(event) {
  const modal = document.getElementById("missionModal");
  if (modal && event.target === modal) { // <-- add this check
    closeMissionModal();
  }
});


  document.addEventListener("DOMContentLoaded", () => {
    const counters = document.querySelectorAll(".counter");
    const counterSection = document.querySelector("#about");
    let isVisible = false;

    const animateCounter = (counter) => {
      const target = +counter.getAttribute("data-target");
      const speed = 200;
      const increment = Math.ceil(target / speed);
      let current = 0;

      const updateCount = () => {
        if (current < target) {
          current += increment;
          counter.innerText = current > target ? target : current;
          requestAnimationFrame(updateCount);
        } else {
          counter.innerText = target;
        }
      };

      updateCount();
    };

    const resetCounters = () => {
      counters.forEach(counter => {
        counter.innerText = "0";
      });
    };

    const handleScroll = () => {
      const box = counterSection.getBoundingClientRect();
      const inView = box.top <= window.innerHeight && box.bottom >= 0;

      if (inView && !isVisible) {
        isVisible = true;
        counters.forEach(counter => animateCounter(counter));
      } else if (!inView && isVisible) {
        isVisible = false;
        resetCounters();
      }
    };

    // Also allow About nav click to trigger it
    document.querySelectorAll('a[href=""]').forEach(link => {
      link.addEventListener("click", () => {
        setTimeout(() => {
          handleScroll(); // manually recheck on nav click
        }, 600); // after scroll completes
      });
    });

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // check on load
  });

  const slides = document.querySelectorAll("#testimonialFadeSlider .testimonial-slide");
  let currentSlide = 0;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.remove("active");
      if (i === index) {
        slide.classList.add("active");
      }
    });
  }

  setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }, 7000); // 7 seconds

  function disableScroll() {
  document.body.classList.add('no-scroll');
}

function enableScroll() {
  document.body.classList.remove('no-scroll');
}

 document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('cart-slider');

  // Close cart slider on any link click
  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (slider?.classList.contains('show')) {
        slider.classList.remove('show');
        document.body.style.overflow = ''; // Enable scroll again
      }
    });
  });
});



  const scrollBtn = document.getElementById("scrollToTopBtn");

  // Show/hide on scroll
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      scrollBtn.classList.add("show");
    } else {
      scrollBtn.classList.remove("show");
    }
  });

  // Scroll to top
  scrollBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  function parseJwt(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Failed to parse JWT:", error);
      return {};
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    const userData = localStorage.getItem("user");
    const userInfoDiv = document.getElementById("user-info");

     //  Redirect if not logged in
  if (!userData) {
      window.location.href = "login.html";
      return;
  }

    const user = JSON.parse(userData);

     //  JWT expiration check
    const now = Math.floor(Date.now() / 1000);
    if (user.credential) {
      const decoded = parseJwt(user.credential);
    if (decoded.exp && decoded.exp < now) {
  console.warn("JWT expired");
  localStorage.removeItem("user");

  // Show toast before redirecting
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "info",
    title: "Session expired",
    text: "Please sign in again to continue",
    showConfirmButton: false,
    timer: 3000,
    background: "#fff8f0",
    color: "#333",
    timerProgressBar: true,
    didClose: () => {
      window.location.href = "login.html";
    },
  });

  return;
}
    }
    
    const name = user?.name?.split(" ")[0] || "burger fan";

   // 🖼️ Display user info
if (user?.name && user?.picture && userInfoDiv) {
  const firstName = user.name.split(" ")[0]; // 
  document.getElementById("user-name").innerText = `👋Hi, ${firstName}`;
  document.getElementById("user-pic").src = user.picture;
  userInfoDiv.style.display = "flex";
}
  });

window.addEventListener("DOMContentLoaded", () => {
  const name = JSON.parse(localStorage.getItem("user"))?.name?.split(" ")[0] || "Guest";
  const toast = document.getElementById("welcome-toast");

  if (localStorage.getItem("loginSuccess") === "true" && toast) {
    toast.textContent = `🍔 Welcome back, ${name}! Ready for more juicy bites?`;
    toast.classList.add("show");

    // Auto hide after 4 seconds
    setTimeout(() => {
      toast.classList.remove("show");
    }, 10000);

    // Clear flag to prevent repeat
    localStorage.removeItem("loginSuccess");
  }
});



  function signOut() {
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
        localStorage.setItem("logoutSuccess", "true");
        localStorage.removeItem("user");
        window.location.href = "login.html";
      }
    });
  }