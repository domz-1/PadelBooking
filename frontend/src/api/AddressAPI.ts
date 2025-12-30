import api from "./api"
import { getAuthHeader } from "./helpers"
import { type AxiosResponse } from 'axios';

interface AddressData {
  type: 'home' | 'building' | 'office'
  paciNumber: string
  streetName: string
  additionalInfo?: string
  googleLocationLink?: string
  blockNumber: string
  buildingNumber: string
  // Conditional fields based on address type
  floor?: string // Required for building type
  apartmentNo?: string // Required for building type
  officeNo?: string // Required for office type
}
  
export const AddressAPI = {
  addOrUpdateAddress: async (data: AddressData, token: string): Promise<AxiosResponse> => {
    return api.patch(`/address/`, data, getAuthHeader(token))
  },
  removeAddress: async (address: string, token: string): Promise<AxiosResponse> => {
    return api.delete(`/address/`, {
      data: { address },
      ...getAuthHeader(token),
    })
  },
  getAllAddresses: async (token: string): Promise<AxiosResponse> => {
    return api.get(`/address/`, getAuthHeader(token))
  },
}
