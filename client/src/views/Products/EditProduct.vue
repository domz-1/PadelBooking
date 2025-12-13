<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="pageTitle" />
    <div class="space-y-5 sm:space-y-6">
      <ComponentCard :title="pageTitle">
        <div v-if="loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
          <p class="mt-2 text-gray-500">Loading product data...</p>
        </div>
        <div v-else-if="error" class="text-center py-8">
          <p class="text-red-500">{{ error }}</p>
          <button @click="loadProduct" class="mt-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600">
          </button>
        </div>
        <!-- Existing Images Preview (Edit Mode) -->
        <div v-if="isEdit && (formData.existingImgCover || formData.existingImages?.length)" class="mb-6">
          <h3 class="text-lg font-medium mb-3 text-gray-700">Existing Images</h3>
          <!-- Cover Image -->
          <div v-if="formData.existingImgCover" class="mb-4">
            <h4 class="text-sm font-medium text-gray-600 mb-2">Cover Image</h4>
            <div class="relative inline-block">
              <LazyImage
                :image-id="typeof formData.existingImgCover === 'string' ? formData.existingImgCover : formData.existingImgCover._id"
                :alt="formData.existingImgCover.originalName || 'Cover image'"
                width="128px"
                height="128px"
                image-class="w-32 h-32 object-cover rounded border"
                placeholder="/placeholder-product.png"
              />
              <button @click="deleteExistingImage(typeof formData.existingImgCover === 'string' ? formData.existingImgCover : formData.existingImgCover._id, 'cover')" type="button"
                :disabled="deletingImageId === formData.existingImgCover._id"
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50"
                title="Delete cover image">
                <svg v-if="deletingImageId !== formData.existingImgCover._id" xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <div class="mt-2" v-if="typeof formData.existingImgCover === 'object'">
                <p class="text-sm text-gray-600">{{ formData.existingImgCover.originalName }}</p>
                <p class="text-xs text-gray-500">Size: {{ Math.round(formData.existingImgCover.size / 1024) }}KB</p>
              </div>
            </div>
          </div>
          <!-- Additional Images -->
          <div v-if="formData.existingImages?.length" class="mb-4">
            <h4 class="text-sm font-medium text-gray-600 mb-2">Additional Images ({{ formData.existingImages.length }})
            </h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div v-for="(image, index) in formData.existingImages" :key="typeof image === 'string' ? image : image._id" class="relative">
                <LazyImage
                  :image-id="typeof image === 'string' ? image : image._id"
                  :alt="typeof image === 'object' ? image.originalName : 'Product image'"
                  width="100%"
                  height="96px"
                  image-class="w-full h-24 object-cover rounded border"
                  placeholder="/placeholder-product.png"
                />
                <button @click="deleteExistingImage(typeof image === 'string' ? image : image._id, 'additional', index)" type="button"
                  :disabled="deletingImageId === image._id"
                  class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50"
                  title="Delete image">
                  <svg v-if="deletingImageId !== image._id" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <svg v-else class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                  </svg>
                </button>
                <p class="text-xs text-gray-500 mt-1 truncate" v-if="typeof image === 'object'">{{ image.originalName }}</p>
              </div>
            </div>
          </div>
          <div class="text-sm text-gray-500 mb-4">
            <p>Note: Upload new images below to add more (existing images will be preserved). Delete unwanted images using the delete icon.</p>
          </div>
        </div>
        
        <!-- Error Display -->
        <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Validation Error</h3>
              <div class="mt-2 text-sm text-red-700">
                <p>{{ error }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <Form :key="formKey" :fields="formFields" :initial-data="formData" :show-submit-button="true"
          :submit-button-text="isEdit ? 'Update Product' : 'Create Product'" :show-reset-button="true"
          :loading="submitting" :validate-on-submit="true" :validate-on-change="true" @submit="handleSubmit" @reset="handleReset"
          @change="handleFormChange" />
      </ComponentCard>
    </div>
  </AdminLayout>
</template>
<script setup>
import { ref, onMounted, computed, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import Form from "@/components/forms/Form.vue";
import LazyImage from "@/components/LazyImage.vue";
import { ProductsAPI } from "@/api/ProductsAPI";
import { CategoriesAPI } from "@/api/CategoriesAPI";
import { SubcategoriesAPI } from "@/api/SubcategoriesAPI";
import { ImagesAPI } from "@/api/ImagesAPI";
const route = useRoute();
const router = useRouter();
const productId = computed(() => route.params.id);
const isEdit = computed(() => productId.value && productId.value !== "new");
const pageTitle = computed(() => isEdit.value ? "Edit Product" : "Add New Product");
const loading = ref(false);
const formKey = ref(0);
const submitting = ref(false);
const error = ref("");
const deletingImageId = ref(null);
const formData = ref({
  title: { en: "", ar: "" },
  description: { en: "", ar: "" },
  price: 0,
  priceBeforeOffer: 0,
  quantity: 0,
  category: "",
  subcategory: "",
  productCode: "",
  tagsEn: [],
  tagsAr: [],
  notesEn: [],
  notesAr: [],
  isActive: true,
  isFeatured: false,
  isInStock: true,
  priority: false,
  imgCover: null,
  images: [],
  existingImgCover: null,
  existingImages: [],
});
const categories = ref([]);
const subcategories = ref([]);
const loadingCategories = ref(false);
const loadingSubcategories = ref(false);
const formFields = ref([
  {
    key: "title",
    type: "group",
    label: "Product Title",
    description: "Product title in different languages",
    groupClass: "grid grid-cols-1 md:grid-cols-2 gap-4",
    fields: [
      {
        key: "en",
        type: "text",
        label: "English Title",
        placeholder: "Enter product title in English",
        required: true,
        validation: {
          minLength: 1,
          maxLength: 1000
        }
      },
      {
        key: "ar",
        type: "text",
        label: "Arabic Title",
        placeholder: "Enter product title in Arabic",
        required: true,
        validation: {
          minLength: 1,
          maxLength: 1000
        }
      }
    ]
  },
  {
    key: "description",
    type: "group",
    label: "Product Description",
    description: "Product description in different languages",
    groupClass: "grid grid-cols-1 md:grid-cols-2 gap-4",
    fields: [
      {
        key: "en",
        type: "textarea",
        label: "English Description",
        placeholder: "Enter product description in English",
        required: true,
        rows: 4,
        validation: {
          minLength: 1,
          maxLength: 1000
        }
      },
      {
        key: "ar",
        type: "textarea",
        label: "Arabic Description",
        placeholder: "Enter product description in Arabic",
        required: true,
        rows: 4,
        validation: {
          minLength: 1,
          maxLength: 1000
        }
      }
    ]
  },
  {
    key: "price",
    type: "number",
    label: "Price",
    placeholder: "Enter product price",
    required: true,
    min: 0.01,
    step: 0.01,
    validation: {
      min: 0.01,
      required: true
    }
  },
  {
    key: "priceBeforeOffer",
    type: "number",
    label: "Price Before Offer",
    placeholder: "Enter price before offer (optional)",
    min: 0,
    step: 0.01
  },
  {
    key: "quantity",
    type: "number",
    label: "Quantity",
    placeholder: "Enter available quantity",
    required: true,
    min: 0,
    validation: {
      min: 0,
      required: true
    }
  },
  {
    key: "category",
    type: "select",
    label: "Category",
    placeholder: "Select a category",
    required: true,
    validation: {
      required: true
    },
    options: computed(() => categories.value.map(cat => ({
      value: cat._id,
      label: cat.name?.en || cat.name
    }))),
    loading: loadingCategories
  },
  {
    key: "subcategory",
    type: "select",
    label: "Subcategory",
    placeholder: "Select a subcategory",
    required: true,
    validation: {
      required: true
    },
    options: computed(() => subcategories.value.map(sub => ({
      value: sub._id,
      label: sub.name?.en || sub.name?.ar || sub.name
    }))),
    loading: loadingSubcategories,
  },
  {
    key: "productCode",
    type: "text",
    label: "Product Code",
    placeholder: "Enter unique product code",
    required: true,
    validation: {
      required: true,
      minLength: 1,
      maxLength: 1000
    }
  },
  {
    key: "tagsEn",
    type: "array",
    label: "English Tags",
    description: "Product tags for search and categorization (English)",
    fields: [
      {
        key: "tag",
        type: "text",
        placeholder: "Enter tag",
        required: false
      }
    ],
    allowAdd: true,
    allowRemove: true,
    addButtonText: "+ Add Tag",
    removeButtonText: "Remove",
    itemLabel: "Tag",
    emptyMessage: "No English tags added yet"
  },
  {
    key: "tagsAr",
    type: "array",
    label: "Arabic Tags",
    description: "Product tags for search and categorization (Arabic)",
    fields: [
      {
        key: "tag",
        type: "text",
        placeholder: "Enter tag",
        required: false
      }
    ],
    allowAdd: true,
    allowRemove: true,
    addButtonText: "+ Add Tag",
    removeButtonText: "Remove",
    itemLabel: "Tag",
    emptyMessage: "No Arabic tags added yet"
  },
  {
    key: "notesEn",
    type: "array",
    label: "English Notes",
    description: "Additional notes about the product (English)",
    fields: [
      {
        key: "note",
        type: "textarea",
        placeholder: "Enter product note",
        rows: 3,
        required: false
      }
    ],
    allowAdd: true,
    allowRemove: true,
    addButtonText: "+ Add Note",
    removeButtonText: "Remove",
    itemLabel: "Note",
    emptyMessage: "No English notes added yet"
  },
  {
    key: "notesAr",
    type: "array",
    label: "Arabic Notes",
    description: "Additional notes about the product (Arabic)",
    fields: [
      {
        key: "note",
        type: "textarea",
        placeholder: "Enter product note",
        rows: 3,
        required: false
      }
    ],
    allowAdd: true,
    allowRemove: true,
    addButtonText: "+ Add Note",
    removeButtonText: "Remove",
    itemLabel: "Note",
    emptyMessage: "No Arabic notes added yet"
  },
  {
    key: "imgCover",
    type: "file",
    label: "Cover Image",
    description: "Upload the main product cover image",
    accept: "image/*",
    required: computed(() => !isEdit.value || !formData.value.existingImgCover)
  },
  {
    key: "images",
    type: "file",
    label: "Product Images",
    description: "Upload additional product images (new images will be added to existing ones)",
    accept: "image/*",
    multiple: true
  },
  {
    key: "isActive",
    type: "switch",
    label: "Active Status",
    hint: "Enable to make product visible to customers"
  },
  {
    key: "isFeatured",
    type: "switch",
    label: "Featured Product",
    hint: "Enable to highlight this product"
  },
  {
    key: "isInStock",
    type: "switch",
    label: "In Stock",
    hint: "Enable if product is currently in stock"
  },
  {
    key: "priority",
    type: "switch",
    label: "Priority Product",
    hint: "Enable to mark this product as priority (will appear first in listings)"
  }
]);
const loadCategories = async () => {
  loadingCategories.value = true;
  try {
    const response = await CategoriesAPI.getAllCategories();
    categories.value = response.data?.data?.categories || [];
  } catch (err) {
    console.error("❌ [loadCategories] Error loading categories:", err);
    console.error("❌ [loadCategories] Error details:", err.response?.data);
  } finally {
    loadingCategories.value = false;
  }
};
const loadSubcategoriesByCategory = async (categoryId) => {
  if (!categoryId) {
    subcategories.value = [];
    return;
  }
  loadingSubcategories.value = true;
  try {
    const response = await SubcategoriesAPI.getAllSubcategories(categoryId);
    subcategories.value = response.data?.data?.subcategories || [];
    
    // Auto-select subcategory if there's only one available
    if (subcategories.value.length === 1 && !formData.value.subcategory) {
      formData.value.subcategory = subcategories.value[0]._id;
      console.log("✅ [loadSubcategoriesByCategory] Auto-selected single subcategory:", subcategories.value[0].name?.en || subcategories.value[0].name);
    }
  } catch (err) {
    console.error("❌ [loadSubcategoriesByCategory] Error loading subcategories:", err);
    console.error("❌ [loadSubcategoriesByCategory] Error response:", err.response?.data);
    console.error("❌ [loadSubcategoriesByCategory] Error status:", err.response?.status);
    subcategories.value = [];
  } finally {
    loadingSubcategories.value = false;
  }
};
const handleFormChange = async (field, value) => {
  formData.value[field] = value;
  if (field === 'category') {
    formData.value.subcategory = "";
    if (value) {
      await loadSubcategoriesByCategory(value);
    } else {
      subcategories.value = [];
    }
  }
};
const deleteExistingImage = async (imageId, type, index = null) => {
  if (!confirm("Are you sure you want to delete this image?")) {
    return;
  }
  deletingImageId.value = imageId;
  try {
    await ImagesAPI.deleteImageById(imageId);
    if (type === 'cover') {
      formData.value.existingImgCover = null;
    } else if (type === 'additional' && index !== null) {
      formData.value.existingImages.splice(index, 1);
    }
  } catch (err) {
    console.error("❌ [deleteExistingImage] Error deleting image:", err);
    console.error("❌ [deleteExistingImage] Error response:", err.response?.data);
    alert(err.response?.data?.message || "Failed to delete image");
  } finally {
    deletingImageId.value = null;
  }
};
const loadProduct = async () => {
  if (!isEdit.value) {
    return;
  }
  loading.value = true;
  error.value = "";
  try {
    const response = await ProductsAPI.getProductById(productId.value);
    if (response.data?.data?.product) {
      const product = response.data.data.product;
      formData.value = {
        title: {
          en: product.title?.en || "",
          ar: product.title?.ar || ""
        },
        description: {
          en: product.description?.en || "",
          ar: product.description?.ar || ""
        },
        price: product.price || 0,
        priceBeforeOffer: product.priceBeforeOffer || 0,
        quantity: product.quantity || 0,
        category: product.category?._id || product.category || "",
        subcategory: product.subcategory?._id || product.subcategory || "",
        productCode: product.productCode || "",
        tagsEn: Array.isArray(product.tags?.en) && product.tags.en.length > 0 ? product.tags.en.map(tag => ({ tag })) : [],
        tagsAr: Array.isArray(product.tags?.ar) && product.tags.ar.length > 0 ? product.tags.ar.map(tag => ({ tag })) : [],
        notesEn: Array.isArray(product.notes?.en) && product.notes.en.length > 0 ? product.notes.en.map(note => ({ note })) : [],
        notesAr: Array.isArray(product.notes?.ar) && product.notes.ar.length > 0 ? product.notes.ar.map(note => ({ note })) : [],
        isActive: product.isActive !== false,
        isFeatured: product.isFeatured || false,
        isInStock: product.isInStock !== false,
        priority: product.priority || false,
        existingImgCover: product.imgCover || null,
        existingImages: product.images || [],
        imgCover: null,
        images: [],
      };
      await nextTick();
      if (formData.value.category) {
        await loadSubcategoriesByCategory(formData.value.category);
      }
    }
  } catch (err) {
    error.value = err.response?.data?.message || "Failed to load product data";
  } finally {
    loading.value = false;
  }
};
const handleSubmit = async (formData) => {
  submitting.value = true;
  error.value = "";
  console.log("🔍 [handleSubmit] Form data received:", formData);
  try {
    // Clear any previous errors
    error.value = "";
    
    const productData = {
      title: {
        en: formData.title?.en || "",
        ar: formData.title?.ar || ""
      },
      description: {
        en: formData.description?.en || "",
        ar: formData.description?.ar || ""
      },
      price: Number(formData.price),
      priceBeforeOffer: formData.priceBeforeOffer ? Number(formData.priceBeforeOffer) : undefined,
      quantity: Number(formData.quantity),
      category: formData.category,
      subcategory: formData.subcategory,
      productCode: formData.productCode,
      tags: {
        en: formData.tagsEn ? formData.tagsEn.map(item => item.tag).filter(tag => tag && tag.trim()) : [],
        ar: formData.tagsAr ? formData.tagsAr.map(item => item.tag).filter(tag => tag && tag.trim()) : []
      },
      notes: {
        en: formData.notesEn ? formData.notesEn.map(item => item.note).filter(note => note && note.trim()) : [],
        ar: formData.notesAr ? formData.notesAr.map(item => item.note).filter(note => note && note.trim()) : []
      },
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
      isInStock: formData.isInStock,
      priority: formData.priority,
    };
    
    // Validate required fields
    if (!productData.title.en || !productData.title.ar) {
      throw new Error("Both English and Arabic titles are required");
    }
    if (!productData.description.en || !productData.description.ar) {
      throw new Error("Both English and Arabic descriptions are required");
    }
    if (!productData.category) {
      throw new Error("Category is required");
    }
    if (!productData.subcategory) {
      throw new Error("Subcategory is required");
    }
    if (!productData.productCode) {
      throw new Error("Product code is required");
    }
    if (productData.price <= 0) {
      throw new Error("Price must be greater than 0");
    }
    if (productData.quantity < 0) {
      throw new Error("Quantity cannot be negative");
    }
    
    let response;
    if (isEdit.value) {
      const imgCover = formData.imgCover instanceof File ? formData.imgCover : undefined;
      const images = formData.images && formData.images.length > 0 && formData.images[0] instanceof File
        ? formData.images
        : undefined;
      response = await ProductsAPI.updateProduct(productId.value, productData, imgCover, images);
    } else {
      if (!formData.imgCover || !(formData.imgCover instanceof File)) {
        throw new Error("Cover image is required");
      }
      response = await ProductsAPI.createProduct(
        productData,
        formData.imgCover,
        formData.images || []
      );
    }
    if (response.data?.status === "success") {
      router.push("/products");
    }
  } catch (err) {
    error.value = err.response?.data?.message || err.message || "Failed to save product";
  } finally {
    submitting.value = false;
  }
};
const handleReset = () => {
  if (isEdit.value) {
    loadProduct();
  } else {
    formData.value = {
      title: { en: "", ar: "" },
      description: { en: "", ar: "" },
      price: 0,
      priceBeforeOffer: 0,
      quantity: 0,
      category: "",
      subcategory: "",
      productCode: "",
      tagsEn: [],
      tagsAr: [],
      notesEn: [],
      notesAr: [],
      isActive: true,
      isFeatured: false,
      isInStock: true,
      priority: false,
      imgCover: null,
      images: [],
      existingImgCover: null,
      existingImages: [],
    };
  }
};
onMounted(async () => {
  await loadCategories();
  if (isEdit.value) {
    await loadProduct();
  }
});
</script>