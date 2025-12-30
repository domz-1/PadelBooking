import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { SettingsAPI } from '@/api/SettingsAPI';

export const useConfigStore = defineStore('config', () => {
    const config = ref({
        businessName: 'PadelBooking',
        logo: '',
        themeColor: '#4CAF50',
        region: 'EG',
        city: 'Cairo',
        timezone: 'UTC',
        currency: 'USD',
        minBookingDuration: 60,
    });

    const loading = ref(false);

    const logoUrl = computed(() => config.value.logo || 'https://luxankw.com/api/v1/logo'); // Fallback to existing default if empty

    const fetchConfig = async () => {
        loading.value = true;
        try {
            const response = await SettingsAPI.getConfig();
            if (response.data && response.data.data) {
                config.value = { ...config.value, ...response.data.data };
            } else if (response.data) {
                config.value = { ...config.value, ...response.data };
            }
        } catch (error) {
            console.error('Failed to fetch config:', error);
        } finally {
            loading.value = false;
        }
    };

    const updateConfig = async (data: any) => {
        try {
            await SettingsAPI.updateConfig(data);
            // Update local state immediately after successful save
            config.value = { ...config.value, ...data };
            return true;
        } catch (error) {
            console.error('Failed to update config:', error);
            throw error;
        }
    };

    return {
        config,
        loading,
        logoUrl,
        fetchConfig,
        updateConfig,
    };
});
