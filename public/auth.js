const CLIENT_ID = "467816540214-g8fuotcnncrqsvognl5n7atsdoc0e86c.apps.googleusercontent.com";

// Wait until the Google API is loaded
function initGoogleSignIn() {
  if (typeof google === "undefined") {
    // Try again after 100ms
    setTimeout(initGoogleSignIn, 100);
    return;
  }

  google.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: handleCredentialResponse,
    ux_mode: "popup",
    auto_select: false,
  });

  google.accounts.id.renderButton(
    document.getElementById("google-signin-btn"),
    {
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "pill",
      position: "center",
      width: 200,
    }
  );
}

// Start polling immediately
window.onload = initGoogleSignIn;

//
function handleCredentialResponse(response) {
  const data = parseJwt(response.credential);
  const existingUser = JSON.parse(localStorage.getItem("user"));
  const currentDate = new Date().toLocaleDateString();

  const user = {
    name: data.name,
    email: data.email,
    picture: data.picture,
    joinDate: existingUser?.joinDate || currentDate,
    credential: response.credential,
  };

  //  Save user details
  localStorage.setItem("user", JSON.stringify(user));

  //  Force guestMode OFF when logged in with Google
  localStorage.setItem("guestMode", "false");

  if (!localStorage.getItem("hasLoggedInBefore")) {
    localStorage.setItem("firstTimeLogin", "true");
    localStorage.setItem("hasLoggedInBefore", "true");
  } else {
    localStorage.setItem("loginSuccess", "true");
  }

  showToast(`Login Success🔓`, "success");

  setTimeout(() => {
    window.location.replace("index.html");
  }, 3000);
}

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
  } catch (e) {
    console.error("JWT parse error", e);
    return {};
  }
}

function showToast(message, icon = "success") {
  Swal.fire({
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 4000,
    icon,
    title: message,
    background: "#333",
    color: "#fff",
    width: "auto",
    customClass: { popup: "fit-toast" },
  });
}

document.getElementById("start-btn")?.addEventListener("click", () => {
  document.getElementById("google-signin-btn").style.display = "block";
  document.getElementById("start-btn").style.display = "none";
});
