// Geocoding utilities using Nominatim OpenStreetMap API

export interface GeocodeResult {
  lat: number;
  lon: number;
  display_name: string;
  address?: {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

export interface ReverseGeocodeResult {
  lat: string;
  lon: string;
  display_name: string;
  address: {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

/**
 * Forward geocoding: Convert address text to coordinates
 * @param address - Address text to geocode
 * @param acceptLanguage - Language preference (default: 'ar' for Arabic)
 * @returns Promise with geocoding results
 */
export const forwardGeocode = async (
  address: string, 
  acceptLanguage: string = 'ar'
): Promise<GeocodeResult[]> => {
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&accept-language=${acceptLanguage}&limit=5&addressdetails=1`;
    
    console.log('🌍 Forward geocoding:', address);
    console.log('📍 API URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Luxan-Ecommerce/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Geocoding results:', data);
    
    return data.map((result: any) => ({
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      display_name: result.display_name,
      address: result.address
    }));
  } catch (error) {
    console.error('❌ Forward geocoding error:', error);
    throw error;
  }
};

/**
 * Reverse geocoding: Convert coordinates to address
 * @param lat - Latitude
 * @param lon - Longitude  
 * @param acceptLanguage - Language preference (default: 'ar' for Arabic)
 * @returns Promise with reverse geocoding result
 */
export const reverseGeocode = async (
  lat: number, 
  lon: number, 
  acceptLanguage: string = 'ar'
): Promise<ReverseGeocodeResult> => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=${acceptLanguage}&addressdetails=1`;
    
    console.log('🌍 Reverse geocoding:', { lat, lon });
    console.log('📍 API URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Luxan-Ecommerce/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Reverse geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Reverse geocoding result:', data);
    
    return {
      lat: data.lat,
      lon: data.lon,
      display_name: data.display_name,
      address: data.address || {}
    };
  } catch (error) {
    console.error('❌ Reverse geocoding error:', error);
    throw error;
  }
};

/**
 * Build address string from address components
 * @param address - Address object from user model
 * @returns Formatted address string for geocoding
 */
export const buildAddressString = (address: any): string => {
  const parts = [];
  
  if (address.streetName) parts.push(address.streetName);
  if (address.blockNumber) parts.push(`Block ${address.blockNumber}`);
  if (address.buildingNumber) parts.push(`Building ${address.buildingNumber}`);
  if (address.area) parts.push(address.area);
  
  // Add Kuwait as country for better geocoding results
  parts.push('Kuwait');
  
  return parts.join(', ');
};

/**
 * Generate Google Maps URL from coordinates
 * @param lat - Latitude
 * @param lon - Longitude
 * @param label - Optional label for the location
 * @returns Google Maps URL
 */
export const generateGoogleMapsUrl = (
  lat: number, 
  lon: number, 
  label?: string
): string => {
  const baseUrl = 'https://www.google.com/maps';
  const query = label ? `${lat},${lon}(${encodeURIComponent(label)})` : `${lat},${lon}`;
  return `${baseUrl}?q=${query}&z=15`;
};

/**
 * Generate Apple Maps URL from coordinates  
 * @param lat - Latitude
 * @param lon - Longitude
 * @param label - Optional label for the location
 * @returns Apple Maps URL
 */
export const generateAppleMapsUrl = (
  lat: number, 
  lon: number, 
  label?: string
): string => {
  const query = label ? `${lat},${lon}&q=${encodeURIComponent(label)}` : `${lat},${lon}`;
  return `https://maps.apple.com/?ll=${query}&z=15`;
};

/**
 * Generate universal maps URL that works on both mobile and desktop
 * @param lat - Latitude
 * @param lon - Longitude
 * @param label - Optional label for the location
 * @returns Universal maps URL
 */
export const generateUniversalMapsUrl = (
  lat: number, 
  lon: number, 
  label?: string
): string => {
  // Use geo: scheme which is supported by most mobile devices
  // Falls back to Google Maps on desktop
  const geoUrl = `geo:${lat},${lon}?q=${lat},${lon}${label ? `(${encodeURIComponent(label)})` : ''}`;
  return geoUrl;
};
