// QR Code generation utilities

/**
 * Generate QR code data URL using QR Server API
 * @param data - Data to encode in QR code
 * @param size - QR code size (default: 200)
 * @returns QR code data URL
 */
export const generateQRCode = (data: string, size: number = 200): string => {
  const encodedData = encodeURIComponent(data);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}`;
};

/**
 * Generate QR code for location (Google Maps URL)
 * @param lat - Latitude
 * @param lon - Longitude
 * @param label - Optional label for the location
 * @param size - QR code size (default: 200)
 * @returns QR code data URL
 */
export const generateLocationQRCode = (
  lat: number, 
  lon: number, 
  label?: string, 
  size: number = 200
): string => {
  const mapsUrl = `https://www.google.com/maps?q=${lat},${lon}${label ? `(${encodeURIComponent(label)})` : ''}&z=15`;
  return generateQRCode(mapsUrl, size);
};

/**
 * Generate QR code as base64 data URL using canvas (client-side generation)
 * This is a simple implementation - for production, consider using qrcode.js library
 * @param data - Data to encode
 * @param size - QR code size
 * @returns Promise with base64 data URL
 */
export const generateQRCodeCanvas = async (data: string, size: number = 200): Promise<string> => {
  try {
    // For now, use the API method as fallback
    // In production, you might want to use a client-side library like qrcode.js
    return generateQRCode(data, size);
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw error;
  }
};

/**
 * Download QR code as image
 * @param qrCodeUrl - QR code URL
 * @param filename - Download filename
 */
export const downloadQRCode = async (qrCodeUrl: string, filename: string = 'qrcode.png'): Promise<void> => {
  try {
    const response = await fetch(qrCodeUrl);
    const blob = await response.blob();
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('QR Code download error:', error);
    throw error;
  }
};

/**
 * Copy QR code URL to clipboard
 * @param qrCodeUrl - QR code URL to copy
 */
export const copyQRCodeUrl = async (qrCodeUrl: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(qrCodeUrl);
    console.log('QR Code URL copied to clipboard');
  } catch (error) {
    console.error('Failed to copy QR Code URL:', error);
    throw error;
  }
};
