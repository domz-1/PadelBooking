<template>
  <div class="max-w-4xl mx-auto p-6 space-y-6">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
      Cart View - Direct Order Submission Demo
    </h1>
    
    <!-- Demo Explanation -->
    <div class="bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 rounded-lg p-6">
      <h2 class="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">
        How the Direct Order Submission Works:
      </h2>
      <ol class="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-300">
        <li>Navigate to any cart in the admin frontend: <code>/carts/{cartId}</code></li>
        <li>If payment is confirmed, you'll see a green "Submit Order" section</li>
        <li>Click "Submit Order" to create the order without a new payment session</li>
        <li>If session expired but payment confirmed, use "Force Submit"</li>
      </ol>
    </div>

    <!-- Feature Status -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          ✅ Implemented Features
        </h3>
        <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li class="flex items-center gap-2">
            <span class="w-2 h-2 bg-green-500 rounded-full"></span>
            Real-time payment status detection
          </li>
          <li class="flex items-center gap-2">
            <span class="w-2 h-2 bg-green-500 rounded-full"></span>
            Direct order submission for paid carts
          </li>
          <li class="flex items-center gap-2">
            <span class="w-2 h-2 bg-green-500 rounded-full"></span>
            Force submit for expired sessions
          </li>
          <li class="flex items-center gap-2">
            <span class="w-2 h-2 bg-green-500 rounded-full"></span>
            Automatic payment verification
          </li>
          <li class="flex items-center gap-2">
            <span class="w-2 h-2 bg-green-500 rounded-full"></span>
            Smart error handling with fallbacks
          </li>
        </ul>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🎯 Key Benefits
        </h3>
        <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li class="flex items-center gap-2">
            <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
            No need to create new payment sessions
          </li>
          <li class="flex items-center gap-2">
            <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
            Works even if original session expired
          </li>
          <li class="flex items-center gap-2">
            <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
            Verifies actual payment status
          </li>
          <li class="flex items-center gap-2">
            <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
            Faster order processing workflow
          </li>
          <li class="flex items-center gap-2">
            <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
            Admin-friendly interface
          </li>
        </ul>
      </div>
    </div>

    <!-- Visual Workflow -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        📋 Workflow Example
      </h3>
      
      <div class="space-y-4">
        <!-- Step 1 -->
        <div class="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
            1
          </div>
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white">Open Cart View</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Navigate to <code>/carts/{cartId}</code> in admin frontend
            </p>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
            2
          </div>
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white">Payment Status Check</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              System automatically checks if payment is confirmed (payment_status.code === 3)
            </p>
          </div>
        </div>

        <!-- Step 3 -->
        <div class="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
            3
          </div>
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white">Direct Submission</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              If payment confirmed, green "Submit Order" section appears with direct submission button
            </p>
          </div>
        </div>

        <!-- Step 4 -->
        <div class="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
            4
          </div>
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white">Order Created</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Order submitted without creating new payment session, cart deleted, redirects to orders
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Code Example -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        💻 Implementation Details
      </h3>
      
      <div class="bg-gray-900 rounded-lg p-4 overflow-x-auto">
        <pre class="text-green-400 text-sm"><code>// In ViewCart.vue - The key sections:

// 1. Real-time Payment Status Detection
&lt;ComponentCard v-if="paymentStatusInfo" title="Real-time Payment Status"&gt;
  &lt;span :class="paymentStatusInfo.isPaid ? 'text-green-700' : 'text-red-700'"&gt;
    <!-- {{ paymentStatusInfo.isPaid ? 'PAID' : 'NOT PAID' }} -->
  &lt;/span&gt;
&lt;/ComponentCard&gt;

// 2. Direct Order Submission Section
&lt;ComponentCard v-if="paymentStatusInfo?.isPaid" title="Submit Order"&gt;
  &lt;button @click="submitOrderDirectly(false)"&gt;
    Submit Order
  &lt;/button&gt;
  &lt;button @click="submitOrderDirectly(true)"&gt;
    Force Submit (Bypass Session)
  &lt;/button&gt;
&lt;/ComponentCard&gt;

// 3. Backend API Call
const submitOrderDirectly = async (forceSubmit = false) =&gt; {
  await CartsAPI.submitAdminOrder(cartId, {
    paymentMethod: cart.value.paymentSession?.paymentMethod,
    userAddressId: cart.value.userId.addresses[0]._id,
    forceSubmit // This bypasses session checks
  })
}</code></pre>
      </div>
    </div>

    <!-- Test Instructions -->
    <div class="bg-yellow-50 dark:bg-yellow-500/15 border border-yellow-200 dark:border-yellow-500/30 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-yellow-900 dark:text-yellow-200 mb-3">
        🧪 How to Test This Feature
      </h3>
      <ol class="list-decimal list-inside space-y-2 text-yellow-800 dark:text-yellow-300">
        <li>Go to any cart in admin frontend: <code>/carts/{cartId}</code></li>
        <li>If cart has no payment session, create one using the "Create Payment Session" buttons</li>
        <li>Simulate payment by manually checking payment status or wait for actual payment</li>
        <li>When payment is confirmed, you'll see the green "Submit Order" section</li>
        <li>Click "Submit Order" - it will create the order without requiring a new payment session</li>
        <li>Order is created and you're redirected to orders page</li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
// This is a demo component showing how the direct order submission works
// The actual implementation is in ViewCart.vue
</script>
