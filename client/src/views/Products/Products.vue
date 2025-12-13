<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="space-y-5 sm:space-y-6">
      <ComponentCard title="Products">
        <div class="mb-4 flex justify-between items-center">
          <button 
            @click="handleAddNew" 
            class="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors duration-200"
          >
            + Add New Product
          </button>
          
        </div>
        
        <div v-if="loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
          <p class="mt-2 text-gray-500">Loading products...</p>
        </div>
        
        <div v-else-if="error" class="text-center py-8">
          <p class="text-red-500">{{ error }}</p>
          <button @click="loadProducts" class="mt-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600">
            Retry
          </button>
        </div>
        
        <DataTable
          v-else
          :columns="columns"
          :data="formattedProducts"
          :show-actions="true"
          :on-view="handleView"
          :on-edit="handleEdit"
          :on-delete="handleDelete"
        >
          <!-- Custom image column with LazyImage -->
          <template #column-imgCover="{ item }">
            <LazyImage
              :image-id="item.imgCover"
              alt="Product image"
              width="60px"
              height="60px"
              image-class="w-full h-full object-cover rounded"
              placeholder="/placeholder-product.png"
            />
          </template>
        </DataTable>
        
        <!-- Pagination -->
        <Pagination
          v-if="pagination.totalPages > 1"
          :current-page="pagination.currentPage"
          :total-pages="pagination.totalPages"
          :total-documents="pagination.totalDocuments"
          :limit="pagination.limit"
          :has-next-page="pagination.hasNextPage"
          :has-prev-page="pagination.hasPrevPage"
          @page-change="handlePageChange"
        />
      </ComponentCard>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import DataTable, { type Column } from "@/components/DataTable.vue";
import LazyImage from "@/components/LazyImage.vue";
import Pagination from "@/components/common/Pagination.vue";
import { ProductsAPI } from "@/api/ProductsAPI";

interface Product {
  _id: string;
  title: { en: string; ar: string } | string;
  price: number;
  quantity: number;
  isActive: boolean;
  ratingAvg: number;
  imgCover: string;
  ratingCount?: number;
}

interface ProductParams {
  page: number;
  limit: number;
  keyword?: string;
  fields: string;
  isActive?: boolean;
  quantity?: number;
}

const router = useRouter();
const currentPageTitle = ref("Products");

// State
const products = ref<Product[]>([]);
const loading = ref(false);
const error = ref("");
const searchQuery = ref("");
const statusFilter = ref("");
const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  totalDocuments: 0,
  hasNextPage: false,
  hasPrevPage: false,
  limit: 10
});

// Define table columns
const columns = ref<Column[]>([
  { key: "imgCover", title: "Image", type: "text", widthClass: "w-20" },
  { key: "title", title: "Product Name", type: "text" },
  { key: "price", title: "Price", type: "text" },
  { key: "quantity", title: "Stock", type: "text" },
  { key: "isActive", title: "Status", type: "status", badgeType: "success" },
  { key: "ratingAvg", title: "Rating", type: "text" },
]);

// Computed properties for formatted data
const formattedProducts = computed(() => {
  return products.value.map((product: any) => ({
    ...product,
    title: product.title?.en || "No Title",
    price: `KD ${product.price || 0}`,
    quantity: product.quantity || 0,
    isActive: product.isActive ? "Active" : "Inactive",
    ratingAvg: product.ratingAvg ? `${product.ratingAvg}/5` : "No Rating",
    imgCover: product.imgCover, // Just pass the image ID
  }));
});

// Load products from API
const loadProducts = async () => {
  loading.value = true;
  error.value = "";
  
  try {
    const params: ProductParams = {
      page: pagination.value.currentPage,
      limit: pagination.value.limit,
      keyword: searchQuery.value,
      fields: "_id,title,price,quantity,isActive,ratingAvg,ratingCount,imgCover"
    };
    
    // Add status filter if selected
    if (statusFilter.value) {
      if (statusFilter.value === 'active') {
        params.isActive = true;
      } else if (statusFilter.value === 'inactive') {
        params.isActive = false;
      } else if (statusFilter.value === 'out_of_stock') {
        params.quantity = 0;
      }
    }
    
    console.log('API Parameters being sent:', params);
    const response = await ProductsAPI.getAllProducts(params);
    console.log('Full API Response:', response);
    
    const result = response.data;

    if (result.success) {
      products.value = result.data;
      console.log('Products loaded:', products.value.length);
      
      // Update pagination info
      pagination.value = {
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalDocuments: result.count,
          limit: params.limit,
          hasNextPage: result.currentPage < result.totalPages,
          hasPrevPage: result.currentPage > 1
      };
    } else {
      console.error('No products found in response:', response.data);
      products.value = [];
      pagination.value.totalPages = 1;
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || "Failed to load products";
    console.error("Error loading products:", err);
  } finally {
    loading.value = false;
  }
};

// Handle page change
const handlePageChange = (page: number) => {
  pagination.value.currentPage = page;
  loadProducts();
};

// Action handlers
const handleView = (item: any) => {
  if (!item?._id) return;
  router.push(`/products/view/${item._id}`);
};

const handleEdit = (item: any) => {
  if (!item?._id) return;
  router.push(`/products/edit/${item._id}`);
};

const handleAddNew = () => {
  router.push("/products/edit/new");
};

const handleDelete = async (item: any) => {
  if (!item?._id) return;
  
  if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
    try {
      await ProductsAPI.deleteProduct(item._id);
      await loadProducts(); // Reload the list
    } catch (err: any) {
      error.value = err.response?.data?.message || "Failed to delete product";
      console.error("Error deleting product:", err);
    }
  }
};

const handleSearch = () => {
  pagination.value.currentPage = 1;
  loadProducts();
};



const handleFilter = () => {
  pagination.value.currentPage = 1;
  loadProducts();
};

// Watchers
let searchTimeout: any;
watch(searchQuery, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    handleSearch();
  }, 500);
});

watch(statusFilter, () => {
  handleFilter();
});

// Load products on component mount
onMounted(() => {
  loadProducts();
});
</script>
