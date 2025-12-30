<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="space-y-5 sm:space-y-6">
      <ComponentCard title="System Information Management">
        <div v-if="loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
          <p class="mt-2 text-gray-500">Loading system information...</p>
        </div>
        
        <div v-else-if="error" class="text-center py-8">
          <p class="text-red-500">{{ error }}</p>
          <button @click="loadSystemInfo" class="mt-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600">
            Retry
          </button>
        </div>
        
        <form v-else @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Contact Information Section -->
          <div class="bg-gray-50 p-6 rounded-lg">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  v-model="formData.phone"
                  type="tel"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  v-model="formData.email"
                  type="email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="contact@business.com"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Secondary Phone</label>
                <input
                  v-model="formData.secondaryPhone"
                  type="tel"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="+1234567891"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Fax</label>
                <input
                  v-model="formData.fax"
                  type="tel"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="+1234567892"
                />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  v-model="formData.address"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="123 Business Street, City, Country"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Business Information Section -->
          <div class="bg-gray-50 p-6 rounded-lg">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                <input
                  v-model="formData.businessName"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Your Business Name"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  v-model="formData.website"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="https://yourbusiness.com"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Working Hours</label>
                <input
                  v-model="formData.workingHours"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Mon-Fri: 9AM-6PM"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  v-model="formData.isActive"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option :value="true">Active</option>
                  <option :value="false">Inactive</option>
                </select>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Business Description</label>
                <textarea
                  v-model="formData.businessDescription"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Describe your business..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Social Media Section -->
          <div class="bg-gray-50 p-6 rounded-lg">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Social Media Links</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <i class="fab fa-facebook text-blue-600 mr-2"></i>Facebook
                </label>
                <input
                  v-model="formData.facebook"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="https://facebook.com/yourbusiness"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <i class="fab fa-instagram text-pink-600 mr-2"></i>Instagram
                </label>
                <input
                  v-model="formData.instagram"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="https://instagram.com/yourbusiness"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <i class="fab fa-tiktok text-black mr-2"></i>TikTok
                </label>
                <input
                  v-model="formData.tiktok"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="https://tiktok.com/@yourbusiness"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <i class="fab fa-whatsapp text-green-600 mr-2"></i>WhatsApp
                </label>
                <input
                  v-model="formData.whatsapp"
                  type="tel"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <i class="fab fa-twitter text-blue-400 mr-2"></i>Twitter
                </label>
                <input
                  v-model="formData.twitter"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="https://twitter.com/yourbusiness"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <i class="fab fa-youtube text-red-600 mr-2"></i>YouTube
                </label>
                <input
                  v-model="formData.youtube"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="https://youtube.com/yourbusiness"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <i class="fab fa-linkedin text-blue-700 mr-2"></i>LinkedIn
                </label>
                <input
                  v-model="formData.linkedin"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="https://linkedin.com/company/yourbusiness"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <i class="fab fa-snapchat text-yellow-400 mr-2"></i>Snapchat
                </label>
                <input
                  v-model="formData.snapchat"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="https://snapchat.com/add/yourbusiness"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <i class="fab fa-telegram text-blue-500 mr-2"></i>Telegram
                </label>
                <input
                  v-model="formData.telegram"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="@yourbusiness"
                />
              </div>
            </div>
          </div>

          <!-- Location Information Section -->
          <div class="bg-gray-50 p-6 rounded-lg">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Location Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="md:col-span-3">
                <label class="block text-sm font-medium text-gray-700 mb-2">Google Maps Link</label>
                <input
                  v-model="formData.googleMapsLink"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="https://maps.google.com/..."
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                <input
                  v-model.number="formData.latitude"
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="40.7128"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                <input
                  v-model.number="formData.longitude"
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="-74.0060"
                />
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-between items-center pt-6">
            <div class="text-sm text-gray-500">
              <span v-if="systemInfo?.lastUpdatedBy">
                Last updated by: {{ systemInfo.lastUpdatedBy.name }} on {{ formatDate(systemInfo.updatedAt) }}
              </span>
            </div>
            <div class="flex gap-3">
              <button
                type="button"
                @click="resetForm"
                class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                Reset
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ submitting ? 'Saving...' : (systemInfo ? 'Update' : 'Create') }} System Info
              </button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import { SystemInfoAPI } from "@/api/SystemInfoAPI";

const currentPageTitle = ref("System Information");

// State
const systemInfo = ref(null);
const loading = ref(false);
const submitting = ref(false);
const error = ref("");

// Form data
const formData = ref({
  phone: "",
  email: "",
  address: "",
  facebook: "",
  instagram: "",
  tiktok: "",
  whatsapp: "",
  twitter: "",
  youtube: "",
  linkedin: "",
  snapchat: "",
  telegram: "",
  businessName: "",
  businessDescription: "",
  workingHours: "",
  website: "",
  secondaryPhone: "",
  fax: "",
  googleMapsLink: "",
  latitude: null,
  longitude: null,
  isActive: true,
});

// Load system information
const loadSystemInfo = async () => {
  loading.value = true;
  error.value = "";
  
  try {
    const response = await SystemInfoAPI.getSystemInfo();
    
    if (response.data?.data?.systemInfo) {
      systemInfo.value = response.data.data.systemInfo;
      // Populate form with existing data
      Object.keys(formData.value).forEach(key => {
        if (systemInfo.value[key] !== undefined) {
          formData.value[key] = systemInfo.value[key];
        }
      });
    }
  } catch (err) {
    error.value = err.response?.data?.message || "Failed to load system information";
    console.error("Error loading system info:", err);
  } finally {
    loading.value = false;
  }
};

// Handle form submission
const handleSubmit = async () => {
  submitting.value = true;
  error.value = "";
  
  try {
    // Clean up form data (remove empty strings and null values)
    const cleanData = {};
    Object.keys(formData.value).forEach(key => {
      const value = formData.value[key];
      if (value !== "" && value !== null && value !== undefined) {
        cleanData[key] = value;
      }
    });

    let response;
    if (systemInfo.value) {
      // Update existing system info
      response = await SystemInfoAPI.updateSystemInfo(cleanData);
    } else {
      // Create new system info
      response = await SystemInfoAPI.createSystemInfo(cleanData);
    }
    
    if (response.data?.data?.systemInfo) {
      systemInfo.value = response.data.data.systemInfo;
      // Show success message (you can add a toast notification here)
      console.log("System information saved successfully!");
    }
  } catch (err) {
    error.value = err.response?.data?.message || "Failed to save system information";
    console.error("Error saving system info:", err);
  } finally {
    submitting.value = false;
  }
};

// Reset form to original values
const resetForm = () => {
  if (systemInfo.value) {
    Object.keys(formData.value).forEach(key => {
      formData.value[key] = systemInfo.value[key] || "";
    });
  } else {
    Object.keys(formData.value).forEach(key => {
      if (key === 'isActive') {
        formData.value[key] = true;
      } else if (key === 'latitude' || key === 'longitude') {
        formData.value[key] = null;
      } else {
        formData.value[key] = "";
      }
    });
  }
};

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString();
};

// Load data on component mount
onMounted(() => {
  loadSystemInfo();
});
</script>
