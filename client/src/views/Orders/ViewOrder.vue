<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
    </div>

    <div v-else-if="order" class="space-y-6">
      <!-- Order Header -->
      <ComponentCard title="Order Details">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order ID</label>
            <code class="block text-sm bg-gray-100 dark:bg-gray-800 rounded px-3 py-2">{{ order.orderId  }}</code>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <span
              class="inline-block rounded-full px-3 py-1 text-sm font-medium"
              :class="statusBadgeClass(order.status)"
            >
              {{ prettyStatus(order.status) }}
            </span>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Price</label>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ order.totalOrderPrice }} KWD</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
            <p class="text-gray-900 dark:text-white capitalize">{{ order.paymentMethod }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Status</label>
            <span
              class="inline-block rounded-full px-3 py-1 text-sm font-medium"
              :class="order.isPaid ? 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-500' : 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-500'"
            >
              {{ order.isPaid ? 'Paid' : 'Unpaid' }}
            </span>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Status</label>
            <span
              class="inline-block rounded-full px-3 py-1 text-sm font-medium"
              :class="order.isDelivered ? 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-500' : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400'"
            >
              {{ order.isDelivered ? 'Delivered' : 'Not Delivered' }}
            </span>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Created At</label>
            <p class="text-gray-900 dark:text-white">{{ formatDate(order.createdAt) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Updated At</label>
            <p class="text-gray-900 dark:text-white">{{ formatDate(order.updatedAt) }}</p>
          </div>
        </div>
      </ComponentCard>

      <!-- Customer Info -->
      <ComponentCard title="Customer Information">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <p class="text-gray-900 dark:text-white">{{ order.userId?.name || '—' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <p class="text-gray-900 dark:text-white">{{ order.userId?.email || '—' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
            <p class="text-gray-900 dark:text-white">{{ order.userId?.phone || '—' }}</p>
          </div>
        </div>
      </ComponentCard>

      <!-- Shipping Address -->
      <ComponentCard title="Shipping Address">
        <div v-if="order.userAddress" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address Type</label>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                    :class="{
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': order.userAddress.type === 'home',
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': order.userAddress.type === 'building',
                      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200': order.userAddress.type === 'office'
                    }">
                {{ order.userAddress.type }}
              </span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Area</label>
              <p class="text-gray-900 dark:text-white">{{ order.userAddress.area }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street Name</label>
              <p class="text-gray-900 dark:text-white">{{ order.userAddress.streetName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PACI Number</label>
              <p class="text-gray-900 dark:text-white">{{ order.userAddress.paciNumber }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Block Number</label>
              <p class="text-gray-900 dark:text-white">{{ order.userAddress.blockNumber }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Building Number</label>
              <p class="text-gray-900 dark:text-white">{{ order.userAddress.buildingNumber }}</p>
            </div>
            <div v-if="order.userAddress.floor">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Floor</label>
              <p class="text-gray-900 dark:text-white">{{ order.userAddress.floor }}</p>
            </div>
            <div v-if="order.userAddress.apartmentNo">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apartment Number</label>
              <p class="text-gray-900 dark:text-white">{{ order.userAddress.apartmentNo }}</p>
            </div>
            <div v-if="order.userAddress.officeNo">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Office Number</label>
              <p class="text-gray-900 dark:text-white">{{ order.userAddress.officeNo }}</p>
            </div>
          </div>
          <div v-if="order.userAddress.additionalInfo" class="mt-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Additional Information</label>
            <p class="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">{{ order.userAddress.additionalInfo }}</p>
          </div>
          <!-- Location and QR Code Section -->
          <div class="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
            <div class="flex items-center justify-between mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Location & Navigation</label>
              <button 
                v-if="!addressCoordinates && !geocodingLoading"
                @click="geocodeAddress"
                class="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Find Location
              </button>
              <div v-if="geocodingLoading" class="flex items-center text-sm text-gray-500">
                <svg class="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Finding location...
              </div>
            </div>
            
            <!-- Existing Google Location Link -->
            <div v-if="order.userAddress.googleLocationLink" class="mb-4">
              <a :href="order.userAddress.googleLocationLink" target="_blank" 
                 class="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                View Saved Location
              </a>
            </div>

            <!-- Geocoded Location -->
            <div v-if="addressCoordinates" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 class="font-medium text-gray-900 dark:text-white mb-3">Coordinates</h4>
                <div class="space-y-2 text-sm">
                  <p><strong>Latitude:</strong> {{ addressCoordinates.lat.toFixed(6) }}</p>
                  <p><strong>Longitude:</strong> {{ addressCoordinates.lon.toFixed(6) }}</p>
                  <div class="flex gap-2 mt-3">
                    <button 
                      @click="openInMaps"
                      class="px-3 py-2 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors flex items-center gap-1"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      Open in Maps
                    </button>
                    <button 
                      @click="copyCoordinates"
                      class="px-3 py-2 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                    >
                      Copy Coordinates
                    </button>
                  </div>
                </div>
              </div>
              
              <div v-if="locationQRCode">
                <h4 class="font-medium text-gray-900 dark:text-white mb-3">QR Code</h4>
                <div class="text-center">
                  <img 
                    :src="locationQRCode" 
                    alt="Location QR Code" 
                    class="w-32 h-32 mx-auto border border-gray-200 dark:border-gray-700 rounded-lg"
                  />
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Scan to open location in maps
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="order.userAddressId" class="text-center py-8">
          <div class="text-yellow-500 mb-2">
            <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <p class="text-gray-600 dark:text-gray-400">Address data not found</p>
          <p class="text-sm text-gray-500 dark:text-gray-500 mt-1">Address ID: {{ order.userAddressId }}</p>
        </div>
        <div v-else class="text-center py-8">
          <div class="text-gray-400 mb-2">
            <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
          <p class="text-gray-500 dark:text-gray-400">No shipping address provided</p>
        </div>
      </ComponentCard>

      <!-- Cart Items -->
      <ComponentCard title="Order Items">
        <div class="space-y-6">
          <div v-for="(item, idx) in order.cartItems" :key="idx" class="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div class="flex flex-col lg:flex-row gap-6">
              <!-- Product Image -->
              <div class="flex-shrink-0">
                <LazyImage
                  v-if="item.productId?.imgCover"
                  :image-id="item.productId.imgCover"
                  :alt="getProductTitle(item.productId)"
                  width="128px"
                  height="128px"
                  image-class="w-32 h-32 object-cover rounded-lg"
                  loading-class="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center"
                  error-class="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center text-gray-400"
                  placeholder="/placeholder-product.png"
                  error-message="Image not available"
                />
                <div v-else class="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center text-gray-400">
                  <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
              </div>

              <!-- Product Details -->
              <div class="flex-1 space-y-4">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ getProductTitle(item.productId) }}
                  </h3>
                  <p v-if="getProductCode(item.productId)" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Code: {{ getProductCode(item.productId) }}
                  </p>
                </div>

                <!-- Product Description -->
                <div v-if="getProductDescription(item.productId)" class="text-sm text-gray-600 dark:text-gray-300">
                  <p class="line-clamp-3">{{ getProductDescription(item.productId) }}</p>
                </div>

                <!-- Product Status -->
                <div class="flex flex-wrap gap-2">
                  <span v-if="item.productId?.isActive" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400">
                    Active
                  </span>
                  <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400">
                    Inactive
                  </span>
                  <span v-if="item.productId?.isInStock" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400">
                    In Stock
                  </span>
                  <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-400">
                    Out of Stock
                  </span>
                </div>

                <!-- Pricing and Quantity -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Quantity</label>
                    <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ item.quantity }}</p>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Unit Price</label>
                    <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ item.price }} KWD</p>
                  </div>
                  <div v-if="item.productId?.priceBeforeOffer && item.productId.priceBeforeOffer > item.price">
                    <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Original Price</label>
                    <p class="text-sm text-gray-500 dark:text-gray-400 line-through">{{ item.productId.priceBeforeOffer }} KWD</p>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Subtotal</label>
                    <p class="text-lg font-bold text-brand-600 dark:text-brand-400">{{ (item.price * item.quantity).toFixed(3) }} KWD</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>

      <!-- Order Summary -->
      <ComponentCard title="Order Summary">
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <div class="space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">Items ({{ order.cartItems?.length || 0 }})</span>
              <span class="text-gray-900 dark:text-white">{{ calculateItemsTotal() }} KWD</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">Shipping</span>
              <span class="text-gray-900 dark:text-white">Free</span>
            </div>
            <div class="border-t border-gray-200 dark:border-gray-700 pt-3">
              <div class="flex justify-between text-lg font-bold">
                <span class="text-gray-900 dark:text-white">Total</span>
                <span class="text-brand-600 dark:text-brand-400">{{ order.totalOrderPrice }} KWD</span>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>

      <!-- Actions -->
      <div class="flex flex-wrap gap-4">
        <button
          @click="printOrder"
          :disabled="loadingImages"
          class="px-6 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="!loadingImages" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
          </svg>
          <svg v-else class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ loadingImages ? 'Loading Images...' : 'Print Order' }}
        </button>
    
        <button
          @click="router.push(`/orders/edit/${orderId}`)"
          class="px-6 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors duration-200 font-medium"
        >
          Edit Order
        </button>
        <button
          @click="router.push('/orders')"
          class="px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200 font-medium"
        >
          Back to Orders
        </button>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">Order not found</p>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import ComponentCard from '@/components/common/ComponentCard.vue'
import LazyImage from '@/components/LazyImage.vue'
import api from '@/api/api'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { forwardGeocode, buildAddressString, generateGoogleMapsUrl } from '@/utils/geocoding'
import { generateLocationQRCode } from '@/utils/qrcode'

type Status = 'pending' | 'under_preparation' | 'under_delivery' | 'delivered' | 'cancelled' | 'refunded'

const route = useRoute()
const router = useRouter()
const orderId = route.params.id as string
const currentPageTitle = ref('View Order')

const order = ref<any>(null)
const loading = ref(false)
const downloadingPDF = ref(false)
const loadingImages = ref(false)
const productImages = ref<Map<string, string>>(new Map())

// Geocoding and location variables
const addressCoordinates = ref<{ lat: number; lon: number } | null>(null)
const geocodingLoading = ref(false)
const locationQRCode = ref<string>('')

const prettyStatus = (s: Status) => {
  return s
    ? s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : ''
}

const statusBadgeClass = (s: Status) => {
  switch (s) {
    case 'pending':
      return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400'
    case 'under_preparation':
      return 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-500'
    case 'under_delivery':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-500'
    case 'delivered':
      return 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-500'
    case 'cancelled':
      return 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-500'
    case 'refunded':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}

const formatDate = (date: string) => {
  return date ? new Date(date).toLocaleString() : '—'
}

// Helper functions for product display
const getProductTitle = (product: any) => {
  if (!product) return 'Unknown Product'
  if (typeof product.title === 'object') {
    return product.title?.en || product.title?.ar || 'Unknown Product'
  }
  return product.title || product.name || 'Unknown Product'
}

const getProductDescription = (product: any) => {
  if (!product || !product.description) return ''
  if (typeof product.description === 'object') {
    return product.description?.en || product.description?.ar || ''
  }
  return product.description || ''
}

const getProductCode = (product: any) => {
  if (!product) return ''
  return product.productCode || product.code || product.sku || ''
}

const calculateItemsTotal = () => {
  if (!order.value?.cartItems) return '0.000'
  const total = order.value.cartItems.reduce((sum: number, item: any) => {
    return sum + (item.price * item.quantity)
  }, 0)
  return total.toFixed(3)
}

// Geocoding functions
const geocodeAddress = async () => {
  if (!order.value?.userAddress) return

  geocodingLoading.value = true
  try {
    const addressString = buildAddressString(order.value.userAddress)
    console.log('🌍 Geocoding address:', addressString)
    
    const results = await forwardGeocode(addressString)
    
    if (results && results.length > 0) {
      const bestResult = results[0]
      addressCoordinates.value = {
        lat: bestResult.lat,
        lon: bestResult.lon
      }
      
      // Generate QR code for the location
      const label = `${order.value.userAddress.area}, ${order.value.userAddress.streetName}`
      locationQRCode.value = generateLocationQRCode(
        bestResult.lat, 
        bestResult.lon, 
        label,
        200
      )
      
      console.log('✅ Address geocoded:', addressCoordinates.value)
      console.log('🔗 QR Code generated:', locationQRCode.value)
    } else {
      console.log('❌ No geocoding results found')
    }
  } catch (error) {
    console.error('❌ Geocoding failed:', error)
  } finally {
    geocodingLoading.value = false
  }
}

const openInMaps = () => {
  if (!addressCoordinates.value) return
  
  const { lat, lon } = addressCoordinates.value
  const label = order.value?.userAddress ? 
    `${order.value.userAddress.area}, ${order.value.userAddress.streetName}` : 
    'Delivery Location'
  
  const mapsUrl = generateGoogleMapsUrl(lat, lon, label)
  window.open(mapsUrl, '_blank')
}

const copyCoordinates = async () => {
  if (!addressCoordinates.value) return
  
  try {
    const coordinates = `${addressCoordinates.value.lat},${addressCoordinates.value.lon}`
    await navigator.clipboard.writeText(coordinates)
    console.log('Coordinates copied to clipboard:', coordinates)
    // You could add a toast notification here
  } catch (error) {
    console.error('Failed to copy coordinates:', error)
  }
}

// Computed property for maps URL
const mapsUrl = computed(() => {
  if (!addressCoordinates.value) return ''
  
  const { lat, lon } = addressCoordinates.value
  const label = order.value?.userAddress ? 
    `${order.value.userAddress.area}, ${order.value.userAddress.streetName}` : 
    'Delivery Location'
  
  return generateGoogleMapsUrl(lat, lon, label)
})

const getImageUrl = (imageId: string) => {
  if (!imageId) return '/placeholder-product.png'
  return `${import.meta.env.VITE_API_URL}/images/image/${imageId}`
}

const loadImageAsBase64 = async (imageId: string): Promise<string> => {
  if (!imageId) {
    return ''
  }

  try {
    console.log(`🖼️ Loading image: ${imageId}`)
    
    // Fetch image as blob using the same method as LazyImage component
    const response = await api.get(`/images/image/${imageId}`, {
      responseType: 'blob'
    })
    
    const blob = response.data
    console.log(`✅ Image blob loaded: ${imageId} (${blob.size} bytes)`)
    
    // Convert blob to base64
    return new Promise((resolve) => {
      const reader = new FileReader()
      
      reader.onload = () => {
        const result = reader.result as string
        console.log(`✅ Image converted to base64: ${imageId} (${Math.round(result.length / 1024)}KB)`)
        resolve(result)
      }
      
      reader.onerror = () => {
        console.error(`❌ Failed to convert blob to base64: ${imageId}`)
        resolve('')
      }
      
      reader.readAsDataURL(blob)
    })
    
  } catch (error) {
    console.error(`❌ Failed to load image: ${imageId}`, error)
    return ''
  }
}

const preloadImages = async () => {
  if (!order.value?.cartItems) return
  
  loadingImages.value = true
  const imagePromises: Promise<void>[] = []
  
  for (const item of order.value.cartItems) {
    if (item.productId?.imgCover) {
      const promise = loadImageAsBase64(item.productId.imgCover).then(base64 => {
        if (base64) {
          productImages.value.set(item.productId.imgCover, base64)
        }
      }).catch(error => {
        console.error('Failed to load image:', item.productId.imgCover, error)
        // Store the original URL as fallback
        productImages.value.set(item.productId.imgCover, getImageUrl(item.productId.imgCover))
      })
      imagePromises.push(promise)
    }
  }
  
  try {
    await Promise.all(imagePromises)
  } catch (error) {
    console.error('Some images failed to load:', error)
  }
  
  loadingImages.value = false
}

const fetchOrder = async () => {
  loading.value = true
  try {
    const { data } = await api.get(`/orders/${orderId}`)
    order.value = data?.data
    
    // Preload images after order is fetched
    await preloadImages()
    
    // Geocode address if available
    if (order.value?.userAddress) {
      await geocodeAddress()
    }
  } catch (e) {
    console.error('Failed to fetch order:', e)
  } finally {
    loading.value = false
  }
}

const downloadPDF = async () => {
  if (!order.value) return
  
  downloadingPDF.value = true
  
  try {
    // Create a printable version of the order
    const printContent = buildPrintHTML()
    
    // Create a temporary container
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = printContent
    tempDiv.style.position = 'absolute'
    tempDiv.style.left = '-9999px'
    tempDiv.style.top = '0'
    tempDiv.style.width = '210mm' // A4 width
    tempDiv.style.backgroundColor = 'white'
    tempDiv.style.padding = '20mm'
    tempDiv.style.fontFamily = 'Arial, sans-serif'
    tempDiv.style.fontSize = '12px'
    tempDiv.style.lineHeight = '1.4'
    tempDiv.style.color = '#000'
    
    document.body.appendChild(tempDiv)
    
    // Wait for content to render
    await nextTick()
    
    // Generate canvas from HTML
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: tempDiv.scrollWidth,
      height: tempDiv.scrollHeight
    })
    
    // Remove temporary div
    document.body.removeChild(tempDiv)
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    const imgData = canvas.toDataURL('image/png')
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
    
    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
    
    // Download the PDF
    pdf.save(`order-${order.value.orderId }.pdf`)
    
  } catch (error) {
    console.error('Error generating PDF:', error)
    alert('Failed to generate PDF. Please try again.')
  } finally {
    downloadingPDF.value = false
  }
}

const printOrder = async () => {
  if (!order.value) return
  
  try {
    loadingImages.value = true
    
    // Ensure images are loaded and converted to base64
    await preloadImages()
    
    // Wait for images to be fully processed
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Create print window
    const printWindow = window.open('', '_blank')
    
    if (printWindow) {
      // Build the HTML content
      const htmlContent = buildPrintHTML()
      
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      printWindow.focus()
      
      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print()
        setTimeout(() => {
          try {
            printWindow.close()
          } catch (e) {
            console.log('Print window already closed')
          }
        }, 1000)
      }, 2000)
    }
  } catch (error) {
    console.error('Error printing order:', error)
    alert('Failed to print order. Please try again.')
  } finally {
    loadingImages.value = false
  }
}

const debugPrint = async () => {
  if (!order.value) return
  
  try {
    loadingImages.value = true
    
    // Ensure images are loaded and converted to base64
    await preloadImages()
    
    // Wait for images to be fully processed
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Create debug window that stays open for inspection
    const debugWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')
    
    if (debugWindow) {
      // Build the HTML content
      const htmlContent = buildPrintHTML()
      
      debugWindow.document.write(htmlContent)
      debugWindow.document.close()
      debugWindow.focus()
      
      // Add debug info to console
      console.log('🐛 DEBUG PRINT INFO:')
      console.log('📄 Order Data:', order.value)
      console.log('🖼️ Loaded Images:', productImages.value.size)
      console.log('📋 Cart Items:', order.value.cartItems?.length || 0)
      
      // Log each image status
      console.log('📋 Cart Items with Images:')
      order.value.cartItems?.forEach((item: any, index: number) => {
        const imageId = item.productId?.imgCover
        const base64 = imageId ? productImages.value.get(imageId) : null
        console.log(`  Item ${index + 1}: ${getProductTitle(item.productId)}`)
        console.log(`    Image ID: ${imageId || 'No image'}`)
        console.log(`    Base64: ${base64 ? `✅ Loaded (${Math.round(base64.length / 1024)}KB)` : '❌ Failed/Missing'}`)
        if (base64) {
          console.log(`    Preview:`, base64.substring(0, 100) + '...')
        }
      })
      
      console.log('🗂️ All Loaded Images:')
      productImages.value.forEach((base64, imageId) => {
        console.log(`  ${imageId}: ${base64 ? `✅ ${Math.round(base64.length / 1024)}KB` : '❌ Failed'}`)
      })
      
      // Add debug panel to the window
      const debugPanel = debugWindow.document.createElement('div')
      debugPanel.innerHTML = `
        <div style="position: fixed; top: 10px; right: 10px; background: #000; color: #fff; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 12px; z-index: 9999; max-width: 300px;">
          <h3 style="margin: 0 0 10px 0; color: #4ade80;">🐛 Debug Info</h3>
          <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order.value.orderId}</p>
          <p style="margin: 5px 0;"><strong>Items:</strong> ${order.value.cartItems?.length || 0}</p>
          <p style="margin: 5px 0;"><strong>Images Loaded:</strong> ${productImages.value.size}</p>
          <p style="margin: 5px 0;"><strong>Total Price:</strong> ${order.value.totalOrderPrice} KWD</p>
          <button onclick="console.log('HTML Content:', document.documentElement.outerHTML)" style="background: #3b82f6; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-top: 10px;">Log HTML</button>
        </div>
      `
      debugWindow.document.body.appendChild(debugPanel)
      
      console.log('🐛 Debug window opened! You can now inspect the print layout.')
      console.log('💡 Tip: Right-click → Inspect Element to debug the print HTML')
    }
  } catch (error) {
    console.error('Error in debug print:', error)
    alert('Failed to open debug window. Please try again.')
  } finally {
    loadingImages.value = false
  }
}

const buildPrintHTML = () => {
  if (!order.value) return ''
  
  const itemsHTML = order.value.cartItems?.map((item: any) => {
    const imageId = item.productId?.imgCover
    const base64Image = imageId ? productImages.value.get(imageId) : null
    
    const imageHTML = base64Image 
      ? `<img src="${base64Image}" alt="${getProductTitle(item.productId)}" class="item-image" />`
      : `<div class="no-image-placeholder">No image available</div>`
    
    return `
      <div class="item">
        ${imageHTML}
        <div class="item-content">
          <div class="item-header">
            ${getProductTitle(item.productId)}
            ${getProductCode(item.productId) ? `<br><small style="font-weight: normal; color: #666;">Code: ${getProductCode(item.productId)}</small>` : ''}
          </div>
          ${getProductDescription(item.productId) ? `<div class="item-description">${getProductDescription(item.productId)}</div>` : ''}
          <div class="item-details">
            <div class="item-detail">
              <strong>Quantity:</strong>
              ${item.quantity}
            </div>
            <div class="item-detail">
              <strong>Unit Price:</strong>
              ${item.price} KWD
            </div>
            <div class="item-detail">
              <strong>Subtotal:</strong>
              ${(item.price * item.quantity).toFixed(3)} KWD
            </div>
          </div>
        </div>
      </div>
    `
  }).join('') || ''
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Order ${order.value.orderId}</title>
        <meta charset="UTF-8">
        <style>
          @media print {
            @page { size: A4; margin: 20mm; }
            body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; color: #000 !important; background: white !important; }
            .item-image { max-width: 100px !important; max-height: 100px !important; width: 100px !important; height: 100px !important; }
          }
          body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; color: #000; background: white; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .order-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .item { border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 5px; display: flex; gap: 15px; page-break-inside: avoid; }
          .item-image { flex-shrink: 0; width: 100px; height: 100px; object-fit: cover; border-radius: 5px; border: 1px solid #e5e7eb; display: block; }
          .item-content { flex: 1; }
          .item-header { font-weight: bold; margin-bottom: 10px; font-size: 14px; }
          .item-description { color: #666; margin: 8px 0; font-size: 11px; line-height: 1.5; }
          .item-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb; }
          .item-detail { font-size: 11px; }
          .item-detail strong { display: block; color: #666; margin-bottom: 2px; }
          .summary { background: #f9f9f9; padding: 20px; border-radius: 5px; margin-top: 20px; }
          .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 15px; padding-top: 15px; border-top: 2px solid #333; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .status-delivered { background: #d1fae5; color: #065f46; }
          .paid { background: #d1fae5; color: #065f46; }
          .unpaid { background: #fee2e2; color: #991b1b; }
          .no-image-placeholder { width: 100px; height: 100px; background: #f3f4f6; border-radius: 5px; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 10px; text-align: center; padding: 10px; border: 1px solid #e5e7eb; flex-shrink: 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="https://luxankw.com/api/v1/logo" alt="Logo" width="150"  />
          <h1>ORDER DETAILS</h1>
          <p>Order ID: ${order.value.orderId}</p>
          <p>Date: ${formatDate(order.value.createdAt)}</p>
        </div>
        
        <div class="order-info">
          <div>
            <h3>Order Information</h3>
            <p><strong>Status:</strong> <span class="status-badge status-${order.value.status}">${prettyStatus(order.value.status)}</span></p>
            <p><strong>Payment Method:</strong> ${order.value.paymentMethod}</p>
            <p><strong>Payment Status:</strong> <span class="status-badge ${order.value.isPaid ? 'paid' : 'unpaid'}">${order.value.isPaid ? 'Paid' : 'Unpaid'}</span></p>
            <p><strong>Delivery Status:</strong> ${order.value.isDelivered ? 'Delivered' : 'Not Delivered'}</p>
          </div>
          <div>
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${order.value.userId?.name || '—'}</p>
            <p><strong>Email:</strong> ${order.value.userId?.email || '—'}</p>
            <p><strong>Phone:</strong> ${order.value.userId?.phone || '—'}</p>
          </div>
        </div>
        
        ${order.value.userAddress ? `
        <div class="section">
          <div class="section-title">Shipping Address</div>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; display: flex; gap: 20px;">
            <div style="flex: 1;">
              <p><strong>Type:</strong> ${order.value.userAddress.type}</p>
              <p><strong>Area:</strong> ${order.value.userAddress.area}</p>
              <p><strong>Street Name:</strong> ${order.value.userAddress.streetName}</p>
              <p><strong>Block Number:</strong> ${order.value.userAddress.blockNumber}</p>
              <p><strong>Building Number:</strong> ${order.value.userAddress.buildingNumber}</p>
              <p><strong>PACI Number:</strong> ${order.value.userAddress.paciNumber}</p>
              ${order.value.userAddress.floor ? `<p><strong>Floor:</strong> ${order.value.userAddress.floor}</p>` : ''}
              ${order.value.userAddress.apartmentNo ? `<p><strong>Apartment:</strong> ${order.value.userAddress.apartmentNo}</p>` : ''}
              ${order.value.userAddress.officeNo ? `<p><strong>Office:</strong> ${order.value.userAddress.officeNo}</p>` : ''}
              ${order.value.userAddress.additionalInfo ? `<p><strong>Additional Info:</strong> ${order.value.userAddress.additionalInfo}</p>` : ''}
              ${addressCoordinates.value ? `
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;">
                  <p><strong>Coordinates:</strong> ${addressCoordinates.value.lat.toFixed(6)}, ${addressCoordinates.value.lon.toFixed(6)}</p>
                </div>
              ` : ''}
            </div>
            ${locationQRCode.value ? `
            <div style="text-align: center; min-width: 120px;">
              <p style="margin: 0 0 10px 0; font-weight: bold; font-size: 12px;">Scan for Location</p>
              <img src="${locationQRCode.value}" alt="Location QR Code" style="width: 100px; height: 100px; border: 1px solid #ddd; border-radius: 5px;" />
              <p style="margin: 5px 0 0 0; font-size: 10px; color: #666;">Open in Maps</p>
            </div>
            ` : ''}
          </div>
        </div>
        ` : order.value.userAddressId ? `
        <div class="section">
          <div class="section-title">Shipping Address</div>
          <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border: 1px solid #ffeaa7;">
            <p style="color: #856404; margin: 0;"><strong>⚠️ Address data not found</strong></p>
            <p style="color: #856404; margin: 5px 0 0 0; font-size: 11px;">Address ID: ${order.value.userAddressId}</p>
          </div>
        </div>
        ` : ''}
        
        <div class="section">
          <div class="section-title">Order Items (${order.value.cartItems?.length || 0})</div>
          ${itemsHTML}
        </div>
        
        <div class="summary">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>Items (${order.value.cartItems?.length || 0}):</span>
            <span>${calculateItemsTotal()} KWD</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>Shipping:</span>
            <span>Free</span>
          </div>
          <div class="total">
            <div style="display: flex; justify-content: space-between;">
              <span>TOTAL:</span>
              <span>${order.value.totalOrderPrice} KWD</span>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}


onMounted(fetchOrder)
</script>