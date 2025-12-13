import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'

const router = createRouter({
  history: createWebHistory('/admin/'),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'Ecommerce',
      component: () => import('../views/Ecommerce.vue'),
      meta: {
        title: 'eCommerce Dashboard',
        requiresAuth: true,
      },
    },
    {
      path: '/users',
      name: 'Users',
      component: () => import('../views/Users/Users.vue'),
      meta: {
        title: 'Users',
        requiresAuth: true,
      },
    },
    {
      path: '/users/edit/:id',
      name: 'EditUser',
      component: () => import('../views/Users/EditUser.vue'),
      meta: {
        title: 'Edit User',
        requiresAuth: true,
      },
    },
    {
      path: '/users/view/:id',
      name: 'ViewUser',
      component: () => import('../views/Users/ViewUser.vue'),
      meta: {
        title: 'View User',
        requiresAuth: true,
      },
    },
    {
      path: '/products',
      name: 'All Products',
      component: () => import('../views/Products/Products.vue'),
      meta: {
        title: 'Products',
        requiresAuth: true,
      },
    },
    {
      path: '/products/edit/:id',
      name: 'EditProduct',
      component: () => import('../views/Products/EditProduct.vue'),
      meta: {
        title: 'Edit Product',
      },
    },
    {
      path: '/products/view/:id',
      name: 'ViewProduct',
      component: () => import('../views/Products/ViewProduct.vue'),
      meta: {
        title: 'View Product',
      },
    },
    {
      path: '/categories',
      name: 'Categories',
      component: () => import('../views/Categories/Categories.vue'),
      meta: {
        title: 'Categories',
      },
    },
    {
      path: '/categories/edit/:id',
      name: 'EditCategory',
      component: () => import('../views/Categories/EditCategory.vue'),
      meta: {
        title: 'Edit Category',
      },
    },
    {
      path: '/categories/view/:id',
      name: 'ViewCategory',
      component: () => import('../views/Categories/ViewCategory.vue'),
      meta: {
        title: 'View Category',
      },
    },
    {
      path: '/subcategories/edit/:id',
      name: 'EditSubcategory',
      component: () => import('../views/Categories/EditSubcategory.vue'),
      meta: {
        title: 'Edit Subcategory',
      },
    },
    {
      path: '/subcategories/view/:id',
      name: 'ViewSubcategory',
      component: () => import('../views/Categories/ViewSubcategory.vue'),
      meta: {
        title: 'View Subcategory',
      },
    },

    {
      path: '/orders',
      name: 'Orders',
      component: () => import('../views/Orders/Orders.vue'),
      meta: {
        title: 'Orders',
      },
    },
    {
      path: '/orders/add',
      name: 'AddOrder',
      component: () => import('../views/Orders/AddOrder.vue'),
      meta: {
        title: 'Add Order',
      },
    },
    {
      path: '/orders/edit/:id',
      name: 'EditOrder',
      component: () => import('../views/Orders/EditOrder.vue'),
      meta: {
        title: 'Edit Order',
      },
    },
    {
      path: '/orders/view/:id',
      name: 'ViewOrder',
      component: () => import('../views/Orders/ViewOrder.vue'),
      meta: {
        title: 'View Order',
      },
    },

    {
      path: '/carts',
      name: 'Carts',
      component: () => import('../views/Carts/Carts.vue'),
      meta: {
        title: 'Carts',
      },
    },
    {
      path: '/carts/add',
      name: 'AddCart',
      component: () => import('../views/Carts/AddCart.vue'),
      meta: {
        title: 'Add Cart',
      },
    },
    {
      path: '/carts/edit/:id',
      name: 'EditCart',
      component: () => import('../views/Carts/EditCart.vue'),
      meta: {
        title: 'Edit Cart',
      },
    },
    {
      path: '/carts/view/:id',
      name: 'ViewCart',
      component: () => import('../views/Carts/ViewCart.vue'),
      meta: {
        title: 'View Cart',
      },
    },

    {
      path: '/coupons',
      name: 'Coupons',
      component: () => import('../views/Coupons/Coupons.vue'),
      meta: {
        title: 'Coupons',
      },
    },
    {
      path: '/coupons/edit/:id',
      name: 'EditCoupon',
      component: () => import('../views/Coupons/EditCoupon.vue'),
      meta: {
        title: 'Edit Coupon',
      },
    },
    {
      path: '/coupons/view/:id',
      name: 'ViewCoupon',
      component: () => import('../views/Coupons/ViewCoupon.vue'),
      meta: {
        title: 'View Coupon',
      },
    },
    {
      path: '/logo',
      name: 'Logo',
      component: () => import('../views/Logo/Logo.vue'),
      meta: {
        title: 'Logo',
      },
    },
    {
      path: '/video-home',
      name: 'VideoHome',
      component: () => import('../views/VideoHome/VideoHome.vue'),
      meta: {
        title: 'Home Video',
        requiresAuth: true,
      },
    },
    {
      path: '/admin/home-content',
      name: 'HomeContent',
      component: () => import('../views/HomeContent/HomeContent.vue'),
      meta: {
        title: 'Home Content',
        requiresAuth: true,
      },
    },
    {
      path: '/admin/home-content/add',
      name: 'AddHomeContent',
      component: () => import('../views/HomeContent/EditHomeContent.vue'),
      meta: {
        title: 'Add Home Content',
        requiresAuth: true,
      },
    },
    {
      path: '/admin/home-content/edit/:id',
      name: 'EditHomeContent',
      component: () => import('../views/HomeContent/EditHomeContent.vue'),
      meta: {
        title: 'Edit Home Content',
        requiresAuth: true,
      },
    },
    {
      path: '/admin/home-content/view/:id',
      name: 'ViewHomeContent',
      component: () => import('../views/HomeContent/ViewHomeContent.vue'),
      meta: {
        title: 'View Home Content',
        requiresAuth: true,
      },
    },

    {
      path: '/calendar',
      name: 'Calendar',
      component: () => import('../views/Others/Calendar.vue'),
      meta: {
        title: 'Calendar',
      },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/Others/UserProfile.vue'),
      meta: {
        title: 'Profile',
      },
    },
    {
      path: '/form-elements',
      name: 'Form Elements',
      component: () => import('../views/Forms/FormElements.vue'),
      meta: {
        title: 'Form Elements',
      },
    },
    {
      path: '/basic-tables',
      name: 'Basic Tables',
      component: () => import('../views/Tables/BasicTables.vue'),
      meta: {
        title: 'Basic Tables',
      },
    },
    {
      path: '/line-chart',
      name: 'Line Chart',
      component: () => import('../views/Chart/LineChart/LineChart.vue'),
    },
    {
      path: '/bar-chart',
      name: 'Bar Chart',
      component: () => import('../views/Chart/BarChart/BarChart.vue'),
    },
    {
      path: '/alerts',
      name: 'Alerts',
      component: () => import('../views/UiElements/Alerts.vue'),
      meta: {
        title: 'Alerts',
      },
    },
    {
      path: '/avatars',
      name: 'Avatars',
      component: () => import('../views/UiElements/Avatars.vue'),
      meta: {
        title: 'Avatars',
      },
    },
    {
      path: '/badge',
      name: 'Badge',
      component: () => import('../views/UiElements/Badges.vue'),
      meta: {
        title: 'Badge',
      },
    },

    {
      path: '/buttons',
      name: 'Buttons',
      component: () => import('../views/UiElements/Buttons.vue'),
      meta: {
        title: 'Buttons',
      },
    },

    {
      path: '/images',
      name: 'Images',
      component: () => import('../views/UiElements/Images.vue'),
      meta: {
        title: 'Images',
      },
    },
    {
      path: '/videos',
      name: 'Videos',
      component: () => import('../views/UiElements/Videos.vue'),
      meta: {
        title: 'Videos',
      },
    },
    {
      path: '/telegram-users',
      name: 'TelegramUsers',
      component: () => import('../views/TelegramUsers/TelegramUsers.vue'),
      meta: {
        title: 'Telegram Users',
        requiresAuth: true,
      },
    },
    {
      path: '/system-info',
      name: 'SystemInfo',
      component: () => import('../views/SystemInfo/SystemInfo.vue'),
      meta: {
        title: 'System Information',
        requiresAuth: true,
      },
    },
    {
      path: '/blank',
      name: 'Blank',
      component: () => import('../views/Pages/BlankPage.vue'),
      meta: {
        title: 'Blank',
      },
    },

    {
      path: '/error-404',
      name: '404 Error',
      component: () => import('../views/Errors/FourZeroFour.vue'),
      meta: {
        title: '404 Error',
      },
    },

    {
      path: '/signin',
      name: 'Signin',
      component: () => import('../views/Auth/Signin.vue'),
      meta: {
        title: 'Signin',
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/Errors/FourZeroFour.vue'),
      meta: {
        title: '404 Error',
      },
    },
    {
      path: '/bookings',
      name: 'Bookings',
      component: () => import('../views/Bookings/Bookings.vue'),
      meta: {
        title: 'Bookings',
        requiresAuth: true,
      },
    },
    {
      path: '/bookings/add',
      name: 'AddBooking',
      component: () => import('../views/Bookings/BookingForm.vue'),
      meta: {
        title: 'Add Booking',
        requiresAuth: true,
      },
    },
    {
      path: '/bookings/edit/:id',
      name: 'EditBooking',
      component: () => import('../views/Bookings/BookingForm.vue'),
      meta: {
        title: 'Edit Booking',
        requiresAuth: true,
      },
    },
    {
      path: '/bookings/view/:id',
      name: 'ViewBooking',
      component: () => import('../views/Bookings/BookingForm.vue'),
      meta: {
        title: 'View Booking',
        requiresAuth: true,
      },
    },
    {
      path: '/coaches',
      name: 'Coaches',
      component: () => import('../views/Coaches/Coaches.vue'),
      meta: {
        title: 'Coaches',
        requiresAuth: true,
      },
    },
    {
      path: '/coaches/add',
      name: 'AddCoach',
      component: () => import('../views/Coaches/CoachForm.vue'),
      meta: {
        title: 'Add Coach',
        requiresAuth: true,
      },
    },
    {
      path: '/coaches/edit/:id',
      name: 'EditCoach',
      component: () => import('../views/Coaches/CoachForm.vue'),
      meta: {
        title: 'Edit Coach',
        requiresAuth: true,
      },
    },
    {
      path: '/coaches/view/:id',
      name: 'ViewCoach',
      component: () => import('../views/Coaches/CoachForm.vue'),
      meta: {
        title: 'View Coach',
        requiresAuth: true,
      },
    },
    {
      path: '/matches',
      name: 'Matches',
      component: () => import('../views/Matches/Matches.vue'),
      meta: {
        title: 'Matches',
        requiresAuth: true,
      },
    },
    {
      path: '/matches/add',
      name: 'AddMatch',
      component: () => import('../views/Matches/MatchForm.vue'),
      meta: {
        title: 'Add Match',
        requiresAuth: true,
      },
    },
    {
      path: '/matches/edit/:id',
      name: 'EditMatch',
      component: () => import('../views/Matches/MatchForm.vue'),
      meta: {
        title: 'Edit Match',
        requiresAuth: true,
      },
    },
    {
      path: '/matches/view/:id',
      name: 'ViewMatch',
      component: () => import('../views/Matches/MatchForm.vue'),
      meta: {
        title: 'View Match',
        requiresAuth: true,
      },
    },
    {
      path: '/notifications',
      name: 'Notifications',
      component: () => import('../views/Notifications/Notifications.vue'),
      meta: {
        title: 'Notifications',
        requiresAuth: true,
      },
    },
    {
      path: '/notifications/broadcast',
      name: 'Broadcast',
      component: () => import('../views/Notifications/BroadcastForm.vue'),
      meta: {
        title: 'Send Broadcast',
        requiresAuth: true,
      },
    },
    {
      path: '/offers',
      name: 'Offers',
      component: () => import('../views/Offers/Offers.vue'),
      meta: {
        title: 'Offers',
        requiresAuth: true,
      },
    },
    {
      path: '/offers/add',
      name: 'AddOffer',
      component: () => import('../views/Offers/OfferForm.vue'),
      meta: {
        title: 'Create Offer',
        requiresAuth: true,
      },
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('../views/Settings/Settings.vue'),
      meta: {
        title: 'Settings',
        requiresAuth: true,
      },
    },
    {
      path: '/settings/categories/add',
      name: 'AddCategory',
      component: () => import('../views/Settings/CategoryForm.vue'),
      meta: {
        title: 'Add Category',
        requiresAuth: true,
      },
    },
    {
      path: '/settings/categories/edit/:id',
      name: 'EditCategory',
      component: () => import('../views/Settings/CategoryForm.vue'),
      meta: {
        title: 'Edit Category',
        requiresAuth: true,
      },
    },
    {
      path: '/sponsors',
      name: 'Sponsors',
      component: () => import('../views/Sponsors/Sponsors.vue'),
      meta: {
        title: 'Sponsors',
        requiresAuth: true,
      },
    },
    {
      path: '/sponsors/add',
      name: 'AddSponsor',
      component: () => import('../views/Sponsors/SponsorForm.vue'),
      meta: {
        title: 'Add Sponsor',
        requiresAuth: true,
      },
    },
    {
      path: '/sponsors/edit/:id',
      name: 'EditSponsor',
      component: () => import('../views/Sponsors/SponsorForm.vue'),
      meta: {
        title: 'Edit Sponsor',
        requiresAuth: true,
      },
    },
    {
      path: '/sports',
      name: 'Sports',
      component: () => import('../views/Sports/Sports.vue'),
      meta: {
        title: 'Sports',
        requiresAuth: true,
      },
    },
    {
      path: '/sports/add',
      name: 'AddSport',
      component: () => import('../views/Sports/SportForm.vue'),
      meta: {
        title: 'Add Sport',
        requiresAuth: true,
      },
    },
    {
      path: '/sports/edit/:id',
      name: 'EditSport',
      component: () => import('../views/Sports/SportForm.vue'),
      meta: {
        title: 'Edit Sport',
        requiresAuth: true,
      },
    },
    {
      path: '/stories',
      name: 'Stories',
      component: () => import('../views/Stories/Stories.vue'),
      meta: {
        title: 'Stories',
        requiresAuth: true,
      },
    },
    {
      path: '/stories/add',
      name: 'AddStory',
      component: () => import('../views/Stories/StoryForm.vue'),
      meta: {
        title: 'Add Story',
        requiresAuth: true,
      },
    },
    {
      path: '/venues',
      name: 'Venues',
      component: () => import('../views/Venues/Venues.vue'),
      meta: {
        title: 'Venues',
        requiresAuth: true,
      },
    },
    {
      path: '/venues/add',
      name: 'AddVenue',
      component: () => import('../views/Venues/VenueForm.vue'),
      meta: {
        title: 'Add Venue',
        requiresAuth: true,
      },
    },
    {
      path: '/venues/edit/:id',
      name: 'EditVenue',
      component: () => import('../views/Venues/VenueForm.vue'),
      meta: {
        title: 'Edit Venue',
        requiresAuth: true,
      },
    },
  ],
})

export default router

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} | Luxan`

  // const authStore = useAuthStore()
  const token = localStorage.getItem('loxan-admin-token')
  if (to.meta.requiresAuth && !token) {
    next('/signin')
  } else if (to.path === '/signin' && token) {
    next('/')
  } else {
    next()
  }
})
