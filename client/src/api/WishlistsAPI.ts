import api from "./api"

import { type AxiosResponse } from 'axios';
import { getAuthHeader } from "./helpers";
interface WishlistAddRemoveData {
  product: string
}

export const WishlistsAPI = {
  addToWishlist: async (data: WishlistAddRemoveData, token: string): Promise<AxiosResponse> => {
    return api.patch(`/wishlists/`, data, getAuthHeader(token))
  },
  removeFromWishlist: async (
    data: WishlistAddRemoveData,
    token: string,
  ): Promise<AxiosResponse> => {
    return api.delete(`/wishlists/`, { data, ...getAuthHeader(token) })
  },
  getWishlist: async (token: string): Promise<AxiosResponse> => {
    return api.get(`/wishlists/`, getAuthHeader(token))
  },
}
