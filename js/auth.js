import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

/* ===========================
   LOGIN FUNCTION
=========================== */
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "admin.html";
    } catch (err) {
      document.getElementById("errorMsg").textContent =
        "Invalid login details";
    }
  });
}

/* ===========================
   PROTECT ADMIN PAGE
=========================== */
onAuthStateChanged(auth, (user) => {
  const isAdminPage = window.location.pathname.includes("admin.html");

  if (isAdminPage && !user) {
    window.location.href = "login.html";
  }
});