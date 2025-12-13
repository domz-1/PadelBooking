export const getAuthHeader = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
})
