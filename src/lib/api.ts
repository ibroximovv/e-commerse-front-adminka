import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { tokens } from './tokens'
import type { Envelope, Meta, Tokens } from './types'

export const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

/**
 * Sessiya tugaganda chaqiriladigan callback. `window.location` o'rniga
 * router navigatsiyasidan foydalanish uchun app ildizida o'rnatiladi.
 */
let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

// ── So'rov interceptori ──────────────────────────────────────────────────────

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  /*
   * `ln=en` MAJBURIY. Backend `name`, `description`, `message`, `error`,
   * `full_name` maydonlarini tarjima qiladi va standart til `uz`. Bu parametrsiz
   * tahrirlash formasiga tarjima qilingan qiymat tushadi va saqlaganda bazadagi
   * asl nom buziladi. Bu — UI tilidan (i18next) mutlaqo boshqa narsa.
   */
  config.params = { ln: 'en', ...(config.params ?? {}) }

  const token = tokens.access()
  if (token) config.headers.Authorization = `Bearer ${token}`

  return config
})

// ── Javob interceptori: 401 → refresh ────────────────────────────────────────

/**
 * Bir vaqtda kelgan bir nechta 401 bitta refresh so'rovini kutadi —
 * aks holda har bir yiqilgan so'rov alohida refresh yuborardi.
 */
let refreshing: Promise<string> | null = null

async function refreshTokens(): Promise<string> {
  const refresh_token = tokens.refresh()
  if (!refresh_token) throw new Error('No refresh token')

  // Interceptorlarga tushmasligi uchun toza axios (aks holda cheksiz halqa)
  const { data } = await axios.post<Envelope<Tokens>>(
    `${BASE_URL}/api/auth/refresh`,
    { refresh_token },
    { params: { ln: 'en' } },
  )

  tokens.save(data.data.access_token, data.data.refresh_token)
  return data.data.access_token
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<{ message?: string | string[] }>) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined

    /*
     * Auth endpointlarining 401 i "token eskirgan" degani EMAS — login'da u
     * "parol noto'g'ri" degani. Ularni refresh oqimiga qo'shsak, noto'g'ri
     * parol "sessiya tugadi" bo'lib ko'rinadi va asl sabab yo'qoladi.
     * Refresh token umuman bo'lmasa ham urinib o'tirishning ma'nosi yo'q.
     */
    const isAuthCall = original?.url?.includes('/api/auth/')
    const canRefresh = !!tokens.refresh()

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !isAuthCall &&
      canRefresh
    ) {
      original._retry = true

      refreshing ??= refreshTokens().finally(() => {
        refreshing = null
      })

      try {
        const token = await refreshing
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      } catch {
        tokens.clear()
        onUnauthorized?.()
        return Promise.reject(new Error('SESSION_EXPIRED'))
      }
    }

    /*
     * Xato matnini bir xil ko'rinishga keltiramiz: validatsiya xatosida backend
     * `message` ni MASSIV qilib qaytaradi.
     */
    const raw = error.response?.data?.message ?? error.message
    return Promise.reject(new Error(Array.isArray(raw) ? raw.join(', ') : raw))
  },
)

// ── Yordamchilar: konvertni ochib beradi ─────────────────────────────────────

export async function get<T>(url: string, params?: object): Promise<T> {
  const { data } = await api.get<Envelope<T>>(url, { params })
  return data.data
}

export async function getList<T>(
  url: string,
  params?: object,
): Promise<{ items: T[]; meta?: Meta | null }> {
  const { data } = await api.get<Envelope<T[]>>(url, { params })
  return { items: data.data ?? [], meta: data.meta }
}

export async function post<T>(url: string, body?: object): Promise<T> {
  const { data } = await api.post<Envelope<T>>(url, body)
  return data.data
}

export async function patch<T>(url: string, body?: object): Promise<T> {
  const { data } = await api.patch<Envelope<T>>(url, body)
  return data.data
}

export async function del<T>(url: string): Promise<T> {
  const { data } = await api.delete<Envelope<T>>(url)
  return data.data
}

// ── Fayllar ──────────────────────────────────────────────────────────────────

/** "uploads/x.png" → "http://localhost:3000/uploads/x.png" */
export const fileUrl = (path?: string | null): string =>
  path ? `${BASE_URL}/${path.replace(/^\//, '')}` : ''

export const UPLOAD_MAX_BYTES = 5 * 1024 * 1024
export const UPLOAD_ACCEPT = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

/**
 * Rasm yuklaydi va NISBIY yo'l qaytaradi ("uploads/1712345678-123.png").
 * Bazaga aynan shu nisbiy yo'l saqlanadi, ko'rsatishda `fileUrl()` ishlatiladi.
 */
export async function uploadImage(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)

  /*
   * Instance'da global `Content-Type: application/json` bor. Uni `undefined`
   * qilib o'chirmasak, brauzer FormData uchun kerakli boundary'ni qo'sha olmaydi
   * va backend faylni ko'rmaydi.
   */
  const { data } = await api.post<Envelope<{ url: string }> & { url?: string }>(
    '/api/upload',
    form,
    { headers: { 'Content-Type': undefined } },
  )

  return data.data?.url ?? data.url ?? ''
}

// ── DataTable adapteri ───────────────────────────────────────────────────────

export interface Pagination<T> {
  docs: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Backend `{ data, meta }` → DataTable kutadigan `{ docs, page, limit, ... }`.
 * `meta` bo'lmasa (sahifalanmaydigan endpointlar) bitta sahifa deb qaraladi.
 */
export function toPagination<T>(items: T[], meta?: Meta | null): Pagination<T> {
  return {
    docs: items,
    page: meta?.page ?? 1,
    limit: meta?.limit ?? items.length,
    total: meta?.total ?? items.length,
    totalPages: meta?.totalPages ?? 1,
  }
}

/**
 * Sahifalash BACKENDDA yo'q bo'lgan ro'yxatlar uchun (`/api/users`,
 * `/api/orders/admin/all`). `DataTable` o'zi kesmaydi — `docs` ni qanday bersak,
 * shuni to'liq chizadi. Ma'lumot ko'payganda sahifa qotib qolmasligi uchun
 * kesish shu yerda.
 */
export function paginateLocal<T>(items: T[], page: number, limit: number): Pagination<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / limit))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * limit

  return {
    docs: items.slice(start, start + limit),
    page: safePage,
    limit,
    total: items.length,
    totalPages,
  }
}
