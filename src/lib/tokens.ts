/**
 * Token saqlash. Backend'da logout endpointi yo'q — tokenlar stateless,
 * chiqish = shu yerdagi qiymatlarni tozalash.
 */

const ACCESS_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'

export const tokens = {
  access: () => localStorage.getItem(ACCESS_KEY),
  refresh: () => localStorage.getItem(REFRESH_KEY),

  save(access: string, refresh: string) {
    localStorage.setItem(ACCESS_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
  },

  clear() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },

  exists: () => !!localStorage.getItem(ACCESS_KEY),
}
