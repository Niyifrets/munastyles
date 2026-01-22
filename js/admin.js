import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const form = document.getElementById("productForm");
const productsList = document.getElementById("adminProducts");

let editId = null;

/* =======================
   ADD / UPDATE PRODUCT
======================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = form.name.value;
  const price = Number(form.price.value);
  const category = form.category.value;
  const description = form.description.value;
  const imageUrl = form.imageUrl.value;

  if (editId) {
    await updateDoc(doc(db, "products", editId), {
      name,
      price,
      category,
      description,
      imageUrl
    });

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
  }

  form.reset();
  loadAdminProducts();
});

/* =======================
   LOAD PRODUCTS
======================= */
async function loadAdminProducts() {
  productsList.innerHTML = "";

  const snapshot = await getDocs(collection(db, "products"));

  snapshot.forEach(docSnap => {
    const product = docSnap.data();
    const row = document.createElement("div");
    row.className = "admin-product";

    row.innerHTML = `
      <strong>${product.name}</strong> — ₦${product.price}
      <small>(${product.category})</small>
      <br>
      <button data-edit>Edit</button>
      <button data-delete>Delete</button>
      <button data-toggle>
        ${product.status === "active" ? "Deactivate" : "Activate"}
      </button>
    `;

    /* EDIT */
    row.querySelector("[data-edit]").onclick = () => {
      editId = docSnap.id;
      form.name.value = product.name;
      form.price.value = product.price;
      form.category.value = product.category;
      form.description.value = product.description || "";
      form.imageUrl.value = product.imageUrl || "";
      form.querySelector("button").innerText = "Update Product";
    };

    /* DELETE */
    row.querySelector("[data-delete]").onclick = async () => {
      if (confirm("Delete this product?")) {
        await deleteDoc(doc(db, "products", docSnap.id));
        loadAdminProducts();
      }
    };

    /* TOGGLE STATUS */
    row.querySelector("[data-toggle]").onclick = async () => {
      await updateDoc(doc(db, "products", docSnap.id), {
        status: product.status === "active" ? "inactive" : "active"
      });
      loadAdminProducts();
    };

    productsList.appendChild(row);
  });
}

/* =======================
   INITIAL LOAD
======================= */
loadAdminProducts();