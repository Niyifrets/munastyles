/* =====================================================
   ADMIN.JS — Muna Styles (Cloudinary + Firestore)
===================================================== */

import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

import {
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

/* =======================
   CLOUDINARY CONFIG
======================= */
const CLOUD_NAME = "dwiayhyx3";
const UPLOAD_PRESET = "muna_unsigned_upload";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

/* =======================
   AUTH GUARD
======================= */
onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "login.html";
});

/* =======================
   DOM ELEMENTS
======================= */
const form = document.getElementById("productForm");
const productsList = document.getElementById("adminProducts");
const logoutBtn = document.getElementById("logoutBtn");
const resetPasswordBtn = document.getElementById("resetPasswordBtn");
const adminSearch = document.getElementById("adminSearch");
const messageBox = document.getElementById("adminMessage");

const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const categoryInput = document.getElementById("category");
const descriptionInput = document.getElementById("description");
const imageFileInput = document.getElementById("imageFile");

/* =======================
   STATE
======================= */
let editId = null;
let existingImageUrl = null;
let productsCache = [];

/* =======================
   MESSAGE HANDLER
======================= */
function showMessage(text, type = "success") {
  messageBox.textContent = text;
  messageBox.className = `admin-message ${type}`;
  messageBox.style.display = "block";

  setTimeout(() => {
    messageBox.style.display = "none";
  }, 3500);
}

/* =======================
   CLOUDINARY UPLOAD
======================= */
async function uploadImageToCloudinary(file) {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Unsupported image format");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(CLOUDINARY_URL, {
    method: "POST",
    body: formData
  });

  const data = await res.json();

  if (!data.secure_url) {
    throw new Error("Image upload failed");
  }

  return data.secure_url;
}

/* =======================
   ADD / UPDATE PRODUCT
======================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const price = Number(priceInput.value);
  const category = categoryInput.value;
  const description = descriptionInput.value.trim();
  const imageFile = imageFileInput.files[0];

  if (!name || !price || !category) {
    showMessage("Please fill all required fields.", "error");
    return;
  }

  try {
    let imageUrl = existingImageUrl;

    if (imageFile) {
      showMessage("Uploading image...", "success");
      imageUrl = await uploadImageToCloudinary(imageFile);
    }

    if (!imageUrl) {
      showMessage("Please upload a product image.", "error");
      return;
    }

    const productData = {
      name,
      price,
      category,
      description,
      imageUrl,
      status: "active",
      updatedAt: Date.now()
    };

    if (editId) {
      await updateDoc(doc(db, "products", editId), productData);
      showMessage("Product updated successfully.");
    } else {
      await addDoc(collection(db, "products"), {
        ...productData,
        createdAt: Date.now()
      });
      showMessage("Product added successfully.");
    }

    form.reset();
    editId = null;
    existingImageUrl = null;
    form.querySelector("button").innerText = "Add Product";
    loadAdminProducts();

  } catch (err) {
    console.error(err);
    showMessage(err.message || "Operation failed.", "error");
  }
});

/* =======================
   LOAD PRODUCTS
======================= */
async function loadAdminProducts() {
  productsList.innerHTML = "<p>Loading products...</p>";

  try {
    const snapshot = await getDocs(collection(db, "products"));
    productsCache = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    renderAdminProducts(productsCache);
  } catch (err) {
    console.error(err);
    productsList.innerHTML = "<p>Failed to load products.</p>";
  }
}

/* =======================
   RENDER PRODUCTS
======================= */
function renderAdminProducts(products) {
  productsList.innerHTML = "";

  if (!products.length) {
    productsList.innerHTML = "<p>No products found.</p>";
    return;
  }

  products.forEach(product => {
    const row = document.createElement("div");
    row.className = "admin-product";

    row.innerHTML = `
      <div>
        <strong>${product.name}</strong> — ₦${Number(product.price).toLocaleString()}
        <br>
        <small>${product.category} • ${product.status}</small>
      </div>

      <div class="admin-actions">
        <button data-edit>Edit</button>
        <button data-delete>Delete</button>
        <button data-toggle>
          ${product.status === "active" ? "Deactivate" : "Activate"}
        </button>
      </div>
    `;

    row.querySelector("[data-edit]").onclick = () => {
      editId = product.id;
      existingImageUrl = product.imageUrl;
      nameInput.value = product.name;
      priceInput.value = product.price;
      categoryInput.value = product.category;
      descriptionInput.value = product.description || "";
      form.querySelector("button").innerText = "Update Product";
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    row.querySelector("[data-delete]").onclick = async () => {
      await deleteDoc(doc(db, "products", product.id));
      showMessage("Product deleted.");
      loadAdminProducts();
    };

    row.querySelector("[data-toggle]").onclick = async () => {
      await updateDoc(doc(db, "products", product.id), {
        status: product.status === "active" ? "inactive" : "active"
      });
      showMessage("Status updated.");
      loadAdminProducts();
    };

    productsList.appendChild(row);
  });
}

/* =======================
   SEARCH
======================= */
adminSearch?.addEventListener("input", () => {
  const term = adminSearch.value.toLowerCase();
  renderAdminProducts(
    productsCache.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    )
  );
});

/* =======================
   PASSWORD RESET
======================= */
resetPasswordBtn?.addEventListener("click", async () => {
  await sendPasswordResetEmail(auth, auth.currentUser.email);
  showMessage("Password reset email sent.");
});

/* =======================
   LOGOUT
======================= */
logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

/* =======================
   INIT
======================= */
loadAdminProducts();
