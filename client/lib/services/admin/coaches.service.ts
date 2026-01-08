import { adminApi } from "@/lib/api";

export interface Coach {
    id: number;
    userId: number;
    hourlyRate: number;
    bio: string;
    User?: { name: string };
}

export const adminCoachService = {
    // Assuming backend has GET /admin/coaches? 
    // Coach Routes: `coaches.admin.routes.js` has `deleteCoach`, `deletePackage`. 
    // It DOES NOT have `getAllCoaches`. 
    // Coaches list is public usually. 
    // But Admin might want to delete from a list.
    // I should check `coaches.client.routes.js` for list? 
    // Yes `GET /api/coaches`.
    // Admin list logic: Use Client API for list, Admin API for delete.

    deleteCoach: async (id: number) => {
        const response = await adminApi.delete(`/coaches/${id}`);
        return response.data;
    },

    deletePackage: async (packageId: number) => {
        const response = await adminApi.delete(`/coaches/packages/${packageId}`);
        return response.data;
    },

    createPackage: async (data: { coachId: number; name: string; price: number; description?: string }) => {
        const response = await adminApi.post('/coaches/packages', data);
        return response.data;
    },

    updatePackage: async (id: number, data: { name?: string; price?: number; description?: string }) => {
        const response = await adminApi.put(`/coaches/packages/${id}`, data);
        return response.data;
    }
};
