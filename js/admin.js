/* =====================================================
   ADMIN.JS — Muna Styles (Cloudinary + Firestore)
   WITH MULTIPLE IMAGE UPLOAD SUPPORT
   ADDED FEEDBACK NOTIFICATIONS
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

const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const categoryInput = document.getElementById("category");
const descriptionInput = document.getElementById("description");

/* =======================
   STATE
======================= */
let editId = null;
let existingImageUrls = [];
let productsCache = [];

/* =======================
   NOTIFICATION SYSTEM
======================= */
function createNotificationSystem() {
  const notificationContainer = document.createElement('div');
  notificationContainer.id = 'notificationContainer';
  notificationContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 400px;
  `;
  document.body.appendChild(notificationContainer);
  
  function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.style.cssText = `
      background: ${type === 'success' ? '#4CAF50' : 
                   type === 'error' ? '#F44336' : 
                   type === 'warning' ? '#FF9800' : 
                   '#2196F3'};
      color: white;
      padding: 15px 20px;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideIn 0.3s ease-out;
      max-width: 400px;
    `;
    
    const icon = document.createElement('i');
    icon.className = `fas ${
      type === 'success' ? 'fa-check-circle' :
      type === 'error' ? 'fa-exclamation-circle' :
      type === 'warning' ? 'fa-exclamation-triangle' :
      'fa-info-circle'
    }`;
    
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    messageSpan.style.flex = '1';
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      opacity: 0.8;
      transition: opacity 0.2s;
    `;
    closeBtn.addEventListener('mouseenter', () => closeBtn.style.opacity = '1');
    closeBtn.addEventListener('mouseleave', () => closeBtn.style.opacity = '0.8');
    closeBtn.addEventListener('click', () => removeNotification(notification));
    
    notification.appendChild(icon);
    notification.appendChild(messageSpan);
    notification.appendChild(closeBtn);
    
    notificationContainer.appendChild(notification);
    
    if (duration > 0) {
      setTimeout(() => removeNotification(notification), duration);
    }
    
    return notification;
  }
  
  function removeNotification(notification) {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }
  
  // Add CSS for animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    
    .admin-notification {
      animation: slideIn 0.3s ease-out;
    }
    
    .admin-notification.fade-out {
      animation: slideOut 0.3s ease-in;
    }
  `;
  document.head.appendChild(style);
  
  return { showNotification };
}

const { showNotification } = createNotificationSystem();

/* =======================
   MESSAGE HANDLER
======================= */
function showMessage(text, type = "success") {
  const messageBox = document.getElementById("adminMessage");
  if (messageBox) {
    messageBox.textContent = text;
    messageBox.className = `admin-message ${type}`;
    messageBox.style.display = "block";

    setTimeout(() => {
      messageBox.style.display = "none";
    }, 3500);
  }
}

/* =======================
   CLOUDINARY UPLOAD
======================= */
async function uploadImageToCloudinary(file) {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Unsupported image format. Please upload JPG, PNG, or WebP images.");
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("Image size exceeds 5MB limit. Please compress the image.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const res = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (!data.secure_url) {
      throw new Error("Image upload failed");
    }

    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image. Please try again.");
  }
}

/* =======================
   MULTIPLE IMAGE UPLOAD
======================= */
async function uploadMultipleImages(files) {
  const maxFiles = 5;
  const imagesToUpload = Array.from(files).slice(0, maxFiles);
  const uploadedUrls = [];
  
  if (imagesToUpload.length === 0) {
    return [];
  }
  
  // Show upload progress notification
  const uploadNotification = showNotification(`Uploading ${imagesToUpload.length} image(s)...`, 'info', 0);
  
  for (let i = 0; i < imagesToUpload.length; i++) {
    try {
      const imageUrl = await uploadImageToCloudinary(imagesToUpload[i]);
      uploadedUrls.push(imageUrl);
      
      // Update notification with progress
      if (uploadNotification) {
        const messageSpan = uploadNotification.querySelector('span');
        if (messageSpan) {
          messageSpan.textContent = `Uploading images... (${i + 1}/${imagesToUpload.length})`;
        }
      }
    } catch (error) {
      console.error(`Error uploading image ${i + 1}:`, error);
      
      // Remove upload notification
      if (uploadNotification && uploadNotification.parentNode) {
        uploadNotification.parentNode.removeChild(uploadNotification);
      }
      
      throw error;
    }
  }
  
  // Remove upload notification after completion
  if (uploadNotification && uploadNotification.parentNode) {
    uploadNotification.parentNode.removeChild(uploadNotification);
  }
  
  return uploadedUrls;
}

/* =======================
   ENHANCE FORM WITH MULTIPLE IMAGE UPLOAD
======================= */
function enhanceFormWithMultipleImages() {
  const imageUploadContainer = document.querySelector('.form-group.full-width');
  if (!imageUploadContainer) return;
  
  // Replace the image file input
  imageUploadContainer.innerHTML = `
    <label for="imageFile">Product Images (Upload multiple)</label>
    <input 
      type="file" 
      id="imageFile" 
      accept="image/*" 
      multiple
      style="margin-bottom: 10px;"
    >
    <div id="imagePreview" class="image-preview-container"></div>
    <small class="form-help">You can select multiple images (max 5). First image will be the main display image.</small>
  `;
  
  // Add event listener for multiple files
  const fileInput = document.getElementById('imageFile');
  if (fileInput) {
    fileInput.addEventListener('change', handleImageSelection);
  }
}

/* =======================
   HANDLE IMAGE SELECTION AND PREVIEW
======================= */
function handleImageSelection(event) {
  const files = event.target.files;
  const previewContainer = document.getElementById('imagePreview');
  if (!previewContainer) return;
  
  previewContainer.innerHTML = '';
  
  // Limit to 5 images
  const maxFiles = 5;
  const selectedFiles = Array.from(files).slice(0, maxFiles);
  
  if (files.length > maxFiles) {
    showNotification(`Maximum ${maxFiles} images allowed. Only first ${maxFiles} will be uploaded.`, "warning");
  }
  
  // Create preview for each image
  selectedFiles.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const previewItem = document.createElement('div');
      previewItem.className = 'preview-item';
      previewItem.innerHTML = `
        <img src="${e.target.result}" alt="Preview ${index + 1}">
        <button type="button" class="remove-preview" data-index="${index}">
          <i class="fas fa-times"></i>
        </button>
        <span class="preview-name">${file.name}</span>
      `;
      previewContainer.appendChild(previewItem);
      
      // Add remove functionality
      previewItem.querySelector('.remove-preview').addEventListener('click', () => {
        removeImageFromSelection(index);
      });
    };
    reader.readAsDataURL(file);
  });
}

/* =======================
   REMOVE IMAGE FROM SELECTION
======================= */
function removeImageFromSelection(index) {
  const fileInput = document.getElementById('imageFile');
  const dt = new DataTransfer();
  const files = Array.from(fileInput.files);
  
  // Remove the file at the specified index
  files.splice(index, 1);
  
  // Add remaining files to DataTransfer
  files.forEach(file => dt.items.add(file));
  
  // Update file input
  fileInput.files = dt.files;
  
  // Update preview
  handleImageSelection({ target: fileInput });
}

/* =======================
   ADD / UPDATE PRODUCT WITH MULTIPLE IMAGES
======================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const price = Number(priceInput.value);
  const category = categoryInput.value;
  const description = descriptionInput.value.trim();
  const imageFileInput = document.getElementById('imageFile');
  const imageFiles = imageFileInput ? imageFileInput.files : null;

  if (!name || !price || !category) {
    showNotification("Please fill all required fields.", "error");
    return;
  }

  try {
    // Show uploading notification
    const uploadingNotification = showNotification("Uploading product...", "info", 0);
    
    let imageUrls = [...existingImageUrls];

    // Upload new images if any
    if (imageFiles && imageFiles.length > 0) {
      const uploadedUrls = await uploadMultipleImages(imageFiles);
      imageUrls = [...imageUrls, ...uploadedUrls];
    }

    if (imageUrls.length === 0) {
      // Remove uploading notification
      if (uploadingNotification && uploadingNotification.parentNode) {
        uploadingNotification.parentNode.removeChild(uploadingNotification);
      }
      showNotification("Please upload at least one product image.", "error");
      return;
    }

    // Product data structure
    const productData = {
      name,
      price,
      category,
      description,
      imageUrl: imageUrls[0], // Main image for backward compatibility
      galleryImages: imageUrls.slice(1), // Additional images
      status: "active",
      updatedAt: Date.now()
    };

    if (editId) {
      // Update existing product
      await updateDoc(doc(db, "products", editId), productData);
      
      // Remove uploading notification
      if (uploadingNotification && uploadingNotification.parentNode) {
        uploadingNotification.parentNode.removeChild(uploadingNotification);
      }
      
      showNotification("Product updated successfully!", "success");
    } else {
      // Add new product
      await addDoc(collection(db, "products"), {
        ...productData,
        createdAt: Date.now()
      });
      
      // Remove uploading notification
      if (uploadingNotification && uploadingNotification.parentNode) {
        uploadingNotification.parentNode.removeChild(uploadingNotification);
      }
      
      showNotification("Product added successfully!", "success");
    }

    // Reset form
    form.reset();
    editId = null;
    existingImageUrls = [];
    
    // Clear preview
    const previewContainer = document.getElementById('imagePreview');
    if (previewContainer) previewContainer.innerHTML = '';
    
    // Reset button text
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.textContent = "Add Product";
    
    // Reload products
    loadAdminProducts();

  } catch (err) {
    console.error("Form submission error:", err);
    
    // Remove any uploading notification
    const notifications = document.querySelectorAll('.admin-notification');
    notifications.forEach(notification => {
      if (notification.textContent.includes('Uploading')) {
        notification.parentNode?.removeChild(notification);
      }
    });
    
    showNotification(err.message || "Operation failed. Please try again.", "error");
  }
});

/* =======================
   LOAD PRODUCTS
======================= */
async function loadAdminProducts() {
  productsList.innerHTML = "<p>Loading products...</p>";

  try {
    const snapshot = await getDocs(collection(db, "products"));
    productsCache = snapshot.docs.map(d => ({ 
      id: d.id, 
      ...d.data(),
      // Combine main image and gallery images for display
      allImages: [d.data().imageUrl, ...(d.data().galleryImages || [])].filter(Boolean)
    }));
    renderAdminProducts(productsCache);
  } catch (err) {
    console.error(err);
    productsList.innerHTML = "<p>Failed to load products.</p>";
    showNotification("Failed to load products. Please refresh the page.", "error");
  }
}

/* =======================
   RENDER PRODUCTS WITH EDIT FUNCTIONALITY
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
    
    // Count total images
    const totalImages = product.allImages ? product.allImages.length : 1;
    const imagesText = totalImages > 1 ? `${totalImages} images` : '1 image';

    row.innerHTML = `
      <div>
        <strong>${product.name}</strong> — ₦${Number(product.price).toLocaleString()}
        <br>
        <small>${product.category} • ${product.status} • ${imagesText}</small>
      </div>

      <div class="admin-actions">
        <button data-edit>Edit</button>
        <button data-delete>Delete</button>
        <button data-toggle>
          ${product.status === "active" ? "Deactivate" : "Activate"}
        </button>
      </div>
    `;

    // Edit functionality
    row.querySelector("[data-edit]").onclick = () => {
      editId = product.id;
      existingImageUrls = product.allImages || [product.imageUrl].filter(Boolean);
      
      // Fill form fields
      nameInput.value = product.name;
      priceInput.value = product.price;
      categoryInput.value = product.category;
      descriptionInput.value = product.description || "";
      
      // Update button text
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) submitButton.textContent = "Update Product";
      
      // Show existing images in preview
      const previewContainer = document.getElementById('imagePreview');
      if (previewContainer && existingImageUrls.length > 0) {
        previewContainer.innerHTML = existingImageUrls.map((url, index) => `
          <div class="preview-item">
            <img src="${url}" alt="Existing image ${index + 1}">
            <span class="preview-name">Image ${index + 1}</span>
          </div>
        `).join('');
        
        // Add note that these are existing images
        const note = document.createElement('div');
        note.className = 'existing-images-note';
        note.innerHTML = '<small>Existing images. Upload new images to add to these.</small>';
        previewContainer.appendChild(note);
      }
      
      window.scrollTo({ top: 0, behavior: "smooth" });
      
      showNotification(`Editing product: ${product.name}`, "info");
    };

    // Delete functionality
    row.querySelector("[data-delete]").onclick = async () => {
      if (confirm("Are you sure you want to delete this product?")) {
        try {
          const deletingNotification = showNotification("Deleting product...", "info", 0);
          await deleteDoc(doc(db, "products", product.id));
          
          // Remove deleting notification
          if (deletingNotification && deletingNotification.parentNode) {
            deletingNotification.parentNode.removeChild(deletingNotification);
          }
          
          showNotification("Product deleted successfully!", "success");
          loadAdminProducts();
        } catch (error) {
          showNotification("Failed to delete product. Please try again.", "error");
          console.error("Delete error:", error);
        }
      }
    };

    // Toggle status functionality
    row.querySelector("[data-toggle]").onclick = async () => {
      const newStatus = product.status === "active" ? "inactive" : "active";
      try {
        const updatingNotification = showNotification("Updating product status...", "info", 0);
        await updateDoc(doc(db, "products", product.id), {
          status: newStatus
        });
        
        // Remove updating notification
        if (updatingNotification && updatingNotification.parentNode) {
          updatingNotification.parentNode.removeChild(updatingNotification);
        }
        
        showNotification(`Product ${newStatus === "active" ? "activated" : "deactivated"}!`, "success");
        loadAdminProducts();
      } catch (error) {
        showNotification("Failed to update status. Please try again.", "error");
        console.error("Status update error:", error);
      }
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
      p.category.toLowerCase().includes(term) ||
      (p.description && p.description.toLowerCase().includes(term))
    )
  );
});

/* =======================
   PASSWORD RESET
======================= */
resetPasswordBtn?.addEventListener("click", async () => {
  try {
    showNotification("Sending password reset email...", "info", 0);
    await sendPasswordResetEmail(auth, auth.currentUser.email);
    
    // Find and remove the sending notification
    const notifications = document.querySelectorAll('.admin-notification');
    notifications.forEach(notification => {
      if (notification.textContent.includes('Sending password reset')) {
        notification.parentNode?.removeChild(notification);
      }
    });
    
    showNotification("Password reset email sent. Check your inbox.", "success");
  } catch (error) {
    console.error("Password reset error:", error);
    showNotification("Failed to send reset email. Please try again.", "error");
  }
});

/* =======================
   LOGOUT
======================= */
logoutBtn?.addEventListener("click", async () => {
  try {
    showNotification("Logging out...", "info", 0);
    await signOut(auth);
    window.location.href = "login.html";
  } catch (error) {
    console.error("Logout error:", error);
    showNotification("Failed to logout. Please try again.", "error");
  }
});

/* =======================
   INITIALIZE
======================= */
function initializeAdmin() {
  // Enhance form with multiple image upload
  enhanceFormWithMultipleImages();
  
  // Load products
  loadAdminProducts();
  
  // Add styles for image preview
  addPreviewStyles();
  
  // Add notification container styles
  addNotificationStyles();
}

function addPreviewStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .image-preview-container {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 10px;
    }
    
    .preview-item {
      position: relative;
      width: 100px;
      height: 100px;
      border: 2px solid var(--color-border);
      border-radius: var(--radius-sm);
      overflow: hidden;
    }
    
    .preview-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .remove-preview {
      position: absolute;
      top: 5px;
      right: 5px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(231, 84, 128, 0.9);
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      z-index: 10;
    }
    
    .preview-name {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      font-size: 10px;
      padding: 2px 5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .form-help {
      display: block;
      margin-top: 8px;
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }
    
    .existing-images-note {
      width: 100%;
      margin-top: 5px;
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }
  `;
  document.head.appendChild(style);
}

function addNotificationStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* Notification system styles */
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    
    .admin-notification {
      animation: slideIn 0.3s ease-out;
      background: #4CAF50;
      color: white;
      padding: 15px 20px;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      display: flex;
      align-items: center;
      gap: 12px;
      max-width: 400px;
      margin-bottom: 10px;
    }
    
    .admin-notification.error {
      background: #F44336;
    }
    
    .admin-notification.warning {
      background: #FF9800;
    }
    
    .admin-notification.info {
      background: #2196F3;
    }
    
    .admin-notification.success {
      background: #4CAF50;
    }
    
    .admin-notification.fade-out {
      animation: slideOut 0.3s ease-in;
    }
  `;
  document.head.appendChild(style);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeAdmin);
