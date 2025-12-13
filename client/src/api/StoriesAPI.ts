import api from '@/api/api';

export const StoriesAPI = {
    getAllStories: (params: any) => api.get('/stories', { params }),
    createStory: (data: FormData) => api.post('/stories', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
};
