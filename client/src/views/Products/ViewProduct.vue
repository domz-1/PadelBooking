<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="pageTitle" />
        <div class="space-y-6 sm:space-y-8 p-4 sm:p-6">
            <!-- Loading State -->
            <div v-if="loading" class="text-center py-12 animate-pulse">
                <div class="inline-flex items-center justify-center h-12 w-12 rounded-full bg-brand-100">
                    <svg class="h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 4v16h16V4H4zm0-2h16a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" />
                    </svg>
                </div>
                <p class="mt-4 text-lg text-gray-500 dark:text-gray-400">Loading product details...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p class="text-lg font-medium text-red-600 dark:text-red-400">{{ error }}</p>
                <button @click="loadProduct"
                    class="mt-4 px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors duration-200 shadow-md">
                    Retry
                </button>
            </div>

            <!-- Product Details -->
            <div v-else-if="product" class="space-y-6 sm:space-y-8">
                <!-- Product Header -->
                <ComponentCard title="Product Overview" class="shadow-lg">
                    <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div class="flex flex-col sm:flex-row items-center gap-6">
                            <div
                                class="relative w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 cursor-pointer"
                                @click="openImageModal(product.imgCover)">
                                <LazyImage
                                    :image-id="product.imgCover"
                                    :alt="product.title?.en"
                                    width="100%"
                                    height="100%"
                                    image-class="w-full h-full object-cover rounded-2xl"
                                    placeholder="/placeholder-product.png"
                                />
                            </div>
                            <div class="text-center sm:text-left">
                                <h2 class="text-3xl font-bold text-gray-900 dark:text-gray-100">{{ product.title?.en }}
                                </h2>
                                <p class="mt-1 text-lg text-gray-600 dark:text-gray-400">{{ product.title?.ar }}</p>
                                <div class="flex items-center gap-3 mt-3">
                                    <span :class="statusBadgeClass"
                                        class="px-4 py-1.5 text-sm font-medium rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                                        @click="toggleProductStatus">
                                        {{ product.isActive ? 'Active' : 'Inactive' }}
                                    </span>
                                    <span v-if="product.isFeatured"
                                        class="px-4 py-1.5 text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full">
                                        Featured
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col sm:flex-row gap-3">
                            <button @click="editProduct"
                                class="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors duration-200 shadow-md">
                                Edit Product
                            </button>
                            <button @click="showDeleteConfirm = true"
                                class="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-md">
                                Delete Product
                            </button>
                        </div>
                    </div>
                </ComponentCard>

                <!-- Product Information -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Basic Information -->
                    <ComponentCard title="Basic Information" class="shadow-lg">
                        <div class="space-y-6">
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Product
                                        Code</label>
                                    <p class="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{{
                                        product.productCode }}</p>
                                </div>
                                <div>
                                    <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Price</label>
                                    <p class="mt-1 text-lg font-bold text-brand-600 dark:text-brand-400">${{
                                        product.price }}</p>
                                    <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Price Before
                                        Offer</label>
                                    <p class="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">${{
                                        product.priceBeforeOffer || 'N/A' }}</p>
                                </div>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Quantity</label>
                                    <p class="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{{
                                        product.quantity }}</p>
                                </div>
                                <div>
                                    <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Sold</label>
                                    <p class="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{{
                                        product.sold }}</p>
                                </div>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Times
                                        Sold</label>
                                    <p class="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{{
                                        product.timesSold }}</p>
                                </div>
                                <div>
                                    <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Stock
                                        Status</label>
                                    <p class="mt-1 text-lg" :class="stockStatusClass">{{ product.isInStock ? 'In Stock'
                                        : 'Out of Stock' }}</p>
                                </div>
                            </div>
                            <div>
                                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Rating</label>
                                <div class="flex items-center gap-3 mt-1">
                                    <div class="flex items-center">
                                        <span v-for="i in 5" :key="i"
                                            class="text-2xl text-yellow-400 transition-transform duration-200 hover:scale-110">
                                            {{ i <= Math.floor(product.ratingAvg) ? '★' : '☆' }} </span>
                                    </div>
                                    <span class="text-gray-600 dark:text-gray-300">{{ product.ratingAvg }} ({{
                                        product.ratingCount }} reviews)</span>
                                </div>
                            </div>
                        </div>
                    </ComponentCard>

                    <!-- Categories -->
                    <ComponentCard title="Categories" class="shadow-lg">
                        <div class="space-y-6">
                            <div>
                                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Category</label>
                                <p class="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{{
                                    product.category?.name?.en || product.category?.name || 'N/A' }}</p>
                            </div>
                            <div>
                                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Subcategory</label>
                                <p class="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{{
                                    product.subcategory?.name?.en || product.subcategory?.name || 'N/A' }}</p>
                            </div>
                        </div>
                    </ComponentCard>
                </div>

                <!-- Descriptions -->
                <ComponentCard title="Product Descriptions" class="shadow-lg">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">English Description
                            </h4>
                            <p class="text-gray-700 dark:text-gray-300 leading-relaxed prose dark:prose-invert">{{
                                product.description?.en }}</p>
                        </div>
                        <div>
                            <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Arabic Description
                            </h4>
                            <p class="text-gray-700 dark:text-gray-300 leading-relaxed prose dark:prose-invert">{{
                                product.description?.ar }}</p>
                        </div>
                    </div>
                </ComponentCard>

                <!-- Tags -->
                <ComponentCard title="Tags" class="shadow-lg">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">English Tags</h4>
                            <div class="flex flex-wrap gap-3">
                                <span v-for="tag in product.tags?.en" :key="tag"
                                    class="px-4 py-1.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm font-medium rounded-full transition-transform duration-200 hover:scale-105">
                                    {{ tag }}
                                </span>
                                <span v-if="!product.tags?.en?.length" class="text-gray-500 dark:text-gray-400">No
                                    tags</span>
                            </div>
                        </div>
                        <div>
                            <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Arabic Tags</h4>
                            <div class="flex flex-wrap gap-3">
                                <span v-for="tag in product.tags?.ar" :key="tag"
                                    class="px-4 py-1.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-sm font-medium rounded-full transition-transform duration-200 hover:scale-105">
                                    {{ tag }}
                                </span>
                                <span v-if="!product.tags?.ar?.length" class="text-gray-500 dark:text-gray-400">No
                                    tags</span>
                            </div>
                        </div>
                    </div>
                </ComponentCard>
                <ComponentCard title="Notes" class="shadow-lg">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">English Notes</h4>
                            <div class="flex flex-wrap gap-3">
                                <span v-for="tag in product.notes?.en" :key="tag"
                                    class="px-4 py-1.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm font-medium rounded-full transition-transform duration-200 hover:scale-105">
                                    {{ tag }}
                                </span>
                                <span v-if="!product.notes?.en?.length" class="text-gray-500 dark:text-gray-400">No
                                    notes</span>
                            </div>
                        </div>
                        <div>
                            <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Arabic Notes</h4>
                            <div class="flex flex-wrap gap-3">
                                <span v-for="tag in product.notes?.ar" :key="tag"
                                    class="px-4 py-1.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-sm font-medium rounded-full transition-transform duration-200 hover:scale-105">
                                    {{ tag }}
                                </span>
                                <span v-if="!product.notes?.ar?.length" class="text-gray-500 dark:text-gray-400">No
                                    notes</span>
                            </div>
                        </div>
                    </div>
                </ComponentCard>

                <!-- Product Images -->
                <ComponentCard title="Product Images" v-if="product.images?.length" class="shadow-lg">
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        <div v-for="(image, index) in product.images" :key="index"
                            class="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:scale-105 cursor-pointer"
                            @click="openImageModal(image)">
                            <LazyImage
                                :image-id="image"
                                :alt="`Product image ${index + 1}`"
                                width="100%"
                                height="100%"
                                image-class="w-full h-full object-cover"
                                placeholder="/placeholder-product.png"
                            />
                        </div>
                    </div>
                </ComponentCard>

                <!-- Ratings Management Section -->
                <ComponentCard title="Ratings & Reviews Management" class="shadow-lg">
                    <div class="space-y-6">
                        <!-- Rating Statistics -->
                        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg">
                            <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Rating Overview</h4>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <!-- Overall Rating -->
                                <div class="text-center">
                                    <div class="text-4xl font-bold text-blue-600 dark:text-blue-400">
                                        {{ ratingStats?.avgRating?.toFixed(1) || '0.0' }}
                                    </div>
                                    <div class="flex justify-center items-center mt-2">
                                        <span v-for="i in 5" :key="i"
                                            class="text-2xl transition-transform duration-200">
                                            {{ i <= Math.floor(ratingStats?.avgRating || 0) ? '★' : '☆' }}
                                        </span>
                                    </div>
                                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {{ ratingStats?.totalRatings || 0 }} total ratings
                                    </p>
                                </div>

                                <!-- Rating Distribution -->
                                <div class="col-span-2">
                                    <h5 class="font-medium text-gray-900 dark:text-gray-100 mb-3">Rating Distribution</h5>
                                    <div class="space-y-2">
                                        <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="flex items-center gap-3">
                                            <span class="text-sm font-medium w-8">{{ star }}★</span>
                                            <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div class="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                                    :style="{ width: getRatingPercentage(star) + '%' }"></div>
                                            </div>
                                            <span class="text-sm text-gray-600 dark:text-gray-400 w-12">
                                                {{ ratingStats?.distribution?.[star] || 0 }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Ratings List -->
                        <div>
                            <div class="flex justify-between items-center mb-4">
                                <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Customer Reviews ({{ ratings.length }})
                                </h4>
                                <div class="flex gap-2">
                                    <select v-model="ratingSortBy" @change="loadRatings" 
                                        class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm">
                                        <option value="createdAt">Newest First</option>
                                        <option value="rating">Highest Rating</option>
                                        <option value="helpfulVotes">Most Helpful</option>
                                    </select>
                                    <button @click="loadRatings" 
                                        class="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
                                        Refresh
                                    </button>
                                </div>
                            </div>

                            <!-- Loading State -->
                            <div v-if="ratingsLoading" class="text-center py-8">
                                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                                <p class="mt-2 text-gray-600 dark:text-gray-400">Loading ratings...</p>
                            </div>

                            <!-- Ratings List -->
                            <div v-else-if="ratings.length > 0" class="space-y-4">
                                <div v-for="rating in ratings" :key="rating._id" 
                                    class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div class="flex justify-between items-start mb-3">
                                        <div class="flex items-center gap-3">
                                            <div class="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                                <span class="text-sm font-medium">
                                                    {{ rating.userId?.name?.charAt(0)?.toUpperCase() || 'U' }}
                                                </span>
                                            </div>
                                            <div>
                                                <p class="font-medium text-gray-900 dark:text-gray-100">
                                                    {{ rating.userId?.name || 'Anonymous User' }}
                                                </p>
                                                <div class="flex items-center gap-2">
                                                    <div class="flex text-yellow-400">
                                                        <span v-for="i in 5" :key="i" class="text-sm">
                                                            {{ i <= rating.rating ? '★' : '☆' }}
                                                        </span>
                                                    </div>
                                                    <span class="text-xs text-gray-500 dark:text-gray-400">
                                                        {{ formatDate(rating.createdAt) }}
                                                    </span>
                                                    <span v-if="rating.isVerifiedPurchase" 
                                                        class="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs rounded-full">
                                                        Verified Purchase
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Rating Actions -->
                                        <div class="flex items-center gap-2">
                                            <span v-if="rating.helpfulVotes > 0" 
                                                class="text-xs text-gray-500 dark:text-gray-400">
                                                {{ rating.helpfulVotes }} helpful
                                            </span>
                                            <button @click="toggleRatingVisibility(rating)" 
                                                :class="rating.isHidden ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'"
                                                class="px-2 py-1 text-white text-xs rounded transition-colors">
                                                {{ rating.isHidden ? 'Show' : 'Hide' }}
                                            </button>
                                            <button @click="confirmDeleteRating(rating)" 
                                                class="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <p v-if="rating.review" class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                        {{ rating.review }}
                                    </p>
                                    
                                    <div v-if="rating.isHidden" 
                                        class="mt-2 px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs rounded">
                                        This review is currently hidden from customers
                                    </div>
                                </div>
                            </div>

                            <!-- No Ratings State -->
                            <div v-else class="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <div class="text-gray-400 dark:text-gray-500 text-6xl mb-4">★</div>
                                <p class="text-gray-600 dark:text-gray-400">No ratings yet for this product</p>
                            </div>

                            <!-- Pagination -->
                            <div v-if="ratingsPagination.pages > 1" class="flex justify-center mt-6">
                                <div class="flex gap-2">
                                    <button v-for="page in ratingsPagination.pages" :key="page"
                                        @click="loadRatings(page)"
                                        :class="page === ratingsPagination.page ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
                                        class="px-3 py-1 rounded transition-colors hover:opacity-80">
                                        {{ page }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </ComponentCard>
           
            </div>

            <!-- Image Modal -->
            <transition name="modal">
                <div v-if="showImageModal"
                    class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                    @click="showImageModal = false">
                    <div class="relative max-w-4xl w-full p-4" @click.stop>
                        <LazyImage
                            :image-id="selectedImage"
                            alt="Product Image"
                            width="100%"
                            height="auto"
                            image-class="w-full h-auto rounded-lg shadow-xl"
                        />
                        <button @click="showImageModal = false"
                            class="absolute top-2 right-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </transition>

            <!-- Delete Product Confirmation Modal -->
            <transition name="modal">
                <div v-if="showDeleteConfirm"
                    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
                        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Confirm Deletion</h3>
                        <p class="mt-2 text-gray-600 dark:text-gray-300">Are you sure you want to delete this product?
                            This action cannot be undone.</p>
                        <div class="mt-6 flex justify-end gap-3">
                            <button @click="showDeleteConfirm = false"
                                class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                Cancel
                            </button>
                            <button @click="deleteProduct"
                                class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                                Delete Product
                            </button>
                        </div>
                    </div>
                </div>
            </transition>

            <!-- Delete Rating Confirmation Modal -->
            <transition name="modal">
                <div v-if="showDeleteRatingConfirm"
                    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
                        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Delete Rating</h3>
                        <p class="mt-2 text-gray-600 dark:text-gray-300">
                            Are you sure you want to delete this rating from 
                            <strong>{{ selectedRating?.userId?.name || 'Anonymous User' }}</strong>?
                            This action cannot be undone.
                        </p>
                        <div class="mt-6 flex justify-end gap-3">
                            <button @click="showDeleteRatingConfirm = false"
                                class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                Cancel
                            </button>
                            <button @click="deleteRating"
                                class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                                Delete Rating
                            </button>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import LazyImage from "@/components/LazyImage.vue";
import { ProductsAPI } from "@/api/ProductsAPI";
import { RatingsAPI } from "@/api/RatingsAPI";

const route = useRoute();
const router = useRouter();
const productId = computed(() => route.params.id);

// State
const loading = ref(false);
const error = ref("");
const product = ref(null);
const showImageModal = ref(false);
const selectedImage = ref("");
const showDeleteConfirm = ref(false);

// Rating-related state
const ratings = ref([]);
const ratingStats = ref(null);
const ratingsLoading = ref(false);
const ratingSortBy = ref('createdAt');
const ratingsPagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
});
const showDeleteRatingConfirm = ref(false);
const selectedRating = ref(null);

// Computed properties
const pageTitle = computed(() => product.value ? `Product: ${product.value.title?.en}` : "Product Details");

const statusBadgeClass = computed(() => ({
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300': product.value?.isActive,
    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': !product.value?.isActive
}));

const stockStatusClass = computed(() => ({
    'text-green-600 dark:text-green-400 font-semibold': product.value?.isInStock,
    'text-red-600 dark:text-red-400 font-semibold': !product.value?.isInStock
}));

// Load product data
const loadProduct = async () => {
    loading.value = true;
    error.value = "";

    try {
        const response = await ProductsAPI.getProductById(productId.value);
        if (response.data?.data?.product) {
            product.value = response.data.data.product;
        }
    } catch (err) {
        error.value = err.response?.data?.message || "Failed to load product details";
        console.error("Error loading product:", err);
    } finally {
        loading.value = false;
    }
};

// Toggle product status
const toggleProductStatus = async () => {
    try {
        const updatedStatus = !product.value.isActive;
        await ProductsAPI.updateProductStatus(productId.value, updatedStatus);
        product.value.isActive = updatedStatus;
    } catch (err) {
        error.value = "Failed to update product status";
        console.error("Error updating product status:", err);
    }
};

// Navigation and action functions
const editProduct = () => {
    router.push(`/products/edit/${productId.value}`);
};

const deleteProduct = async () => {
    try {
        await ProductsAPI.deleteProduct(productId.value);
        router.push("/products");
    } catch (err) {
        error.value = err.response?.data?.message || "Failed to delete product";
        console.error("Error deleting product:", err);
    } finally {
        showDeleteConfirm.value = false;
    }
};

// Image modal
const openImageModal = (imageId) => {
    selectedImage.value = imageId;
    showImageModal.value = true;
};

// Rating-related functions
const getRatingPercentage = (star) => {
    if (!ratingStats.value?.totalRatings || ratingStats.value.totalRatings === 0) return 0;
    return (ratingStats.value.distribution[star] / ratingStats.value.totalRatings) * 100;
};

const loadRatings = async (page = 1) => {
    ratingsLoading.value = true;
    try {
        const response = await RatingsAPI.getProductRatings(productId.value, {
            page,
            limit: ratingsPagination.value.limit,
            sortBy: ratingSortBy.value,
            sortOrder: ratingSortBy.value === 'createdAt' ? 'desc' : 'desc'
        });

        if (response.data?.status === 'success') {
            ratings.value = response.data.data.ratings || [];
            ratingStats.value = response.data.data.stats || null;
            ratingsPagination.value = response.data.data.pagination || ratingsPagination.value;
        }
    } catch (err) {
        console.error('Error loading ratings:', err);
        error.value = 'Failed to load ratings';
    } finally {
        ratingsLoading.value = false;
    }
};

const confirmDeleteRating = (rating) => {
    selectedRating.value = rating;
    showDeleteRatingConfirm.value = true;
};

const deleteRating = async () => {
    if (!selectedRating.value) return;

    try {
        await RatingsAPI.deleteRating(selectedRating.value._id);
        
        // Refresh ratings and product data
        await Promise.all([
            loadRatings(ratingsPagination.value.page),
            loadProduct()
        ]);
        
        showDeleteRatingConfirm.value = false;
        selectedRating.value = null;
    } catch (err) {
        console.error('Error deleting rating:', err);
        error.value = err.response?.data?.message || 'Failed to delete rating';
    }
};

const toggleRatingVisibility = async (rating) => {
    try {
        await RatingsAPI.toggleRatingVisibility(rating._id, !rating.isHidden);
        
        // Update the rating in the local array
        const index = ratings.value.findIndex(r => r._id === rating._id);
        if (index !== -1) {
            ratings.value[index].isHidden = !rating.isHidden;
        }
    } catch (err) {
        console.error('Error toggling rating visibility:', err);
        error.value = err.response?.data?.message || 'Failed to update rating visibility';
    }
};

const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Load product data on component mount
onMounted(async () => {
    await loadProduct();
    await loadRatings();
});
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}
</style>