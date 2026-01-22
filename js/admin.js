/* =====================================================
   ADMIN.JS — Muna Styles (PRODUCTION)
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
  signOut
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

/* =======================
   AUTH GUARD
======================= */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  }
});

/* =======================
   DOM ELEMENTS
======================= */
const form = document.getElementById("productForm");
const productsList = document.getElementById("adminProducts");
const logoutBtn = document.getElementById("logoutBtn");
const adminSearch = document.getElementById("adminSearch");
const messageBox = document.getElementById("adminMessage");

/* =======================
   STATE
======================= */
let editId = null;
let productsCache = [];

/* =======================
   UTIL: MESSAGE HANDLER
======================= */
function showMessage(text, type = "success") {
  messageBox.textContent = text;
  messageBox.className = `admin-message ${type}`;
  messageBox.style.display = "block";

  setTimeout(() => {
    messageBox.style.display = "none";
  }, 3000);
}

/* =======================
   ADD / UPDATE PRODUCT
======================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = form.name.value.trim();
  const price = Number(form.price.value);
  const category = form.category.value;
  const description = form.description.value.trim();
  const imageUrl = form.imageUrl.value.trim();

  if (!name || !price || !category) {
    showMessage("Please fill all required fields.", "error");
    return;
  }

  try {
    if (editId) {
      await updateDoc(doc(db, "products", editId), {
        name,
        price,
        category,
        description,
        imageUrl
      });

      showMessage("Product updated successfully.");
      editId = null;
      form.querySelector("button").innerText = "Add Product";
    } else {
      await addDoc(collection(db, "products"), {
        name,
        price,
        category,
        description,
        imageUrl,
        status: "active",
        createdAt: Date.now()
      });

      showMessage("Product added successfully.");
    }

    form.reset();
    loadAdminProducts();

  } catch (err) {
    console.error(err);
    showMessage("Something went wrong. Try again.", "error");
  }
});

/* =======================
   LOAD PRODUCTS
======================= */
async function loadAdminProducts() {
  productsList.innerHTML = "<p>Loading products...</p>";

  try {
    const snapshot = await getDocs(collection(db, "products"));

    productsCache = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

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

      <div>
        <button data-edit>Edit</button>
        <button data-delete>Delete</button>
        <button data-toggle>
          ${product.status === "active" ? "Deactivate" : "Activate"}
        </button>
      </div>
    `;

    /* EDIT */
    row.querySelector("[data-edit]").onclick = () => {
      editId = product.id;
      form.name.value = product.name;
      form.price.value = product.price;
      form.category.value = product.category;
      form.description.value = product.description || "";
      form.imageUrl.value = product.imageUrl || "";
      form.querySelector("button").innerText = "Update Product";
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    /* DELETE */
    row.querySelector("[data-delete]").onclick = async () => {
      try {
        await deleteDoc(doc(db, "products", product.id));
        showMessage("Product deleted.");
        loadAdminProducts();
      } catch (err) {
        console.error(err);
        showMessage("Delete failed.", "error");
      }
    };

    /* TOGGLE STATUS */
    row.querySelector("[data-toggle]").onclick = async () => {
      try {
        await updateDoc(doc(db, "products", product.id), {
          status: product.status === "active" ? "inactive" : "active"
        });
        showMessage("Product status updated.");
        loadAdminProducts();
      } catch (err) {
        console.error(err);
        showMessage("Status update failed.", "error");
      }
    };

    productsList.appendChild(row);
  });
}

/* =======================
   SEARCH (ADMIN)
======================= */
adminSearch?.addEventListener("input", () => {
  const term = adminSearch.value.toLowerCase().trim();

  const filtered = productsCache.filter(p =>
    p.name.toLowerCase().includes(term) ||
    p.category.toLowerCase().includes(term) ||
    (p.description && p.description.toLowerCase().includes(term))
  );

  renderAdminProducts(filtered);
});

/* =======================
   LOGOUT
======================= */
logoutBtn?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (err) {
    console.error(err);
    showMessage("Logout failed.", "error");
  }
});

/* =======================
   INITIAL LOAD
======================= */
loadAdminProducts();
