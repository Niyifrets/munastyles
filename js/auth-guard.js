import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

const ADMIN_EMAILS = [
  "favourmuna0606@gmail.com",
  "adesokan297@gmail.com"
];

onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Not logged in
    window.location.href = "login.html";
    return;
  }

  if (!ADMIN_EMAILS.includes(user.email)) {
    alert("Access denied. Admins only.");
    signOut(auth);
    window.location.href = "login.html";
  }
});