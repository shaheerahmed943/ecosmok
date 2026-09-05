const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const TOKEN_STORAGE_KEY = "ecosmoke_auth_token";

// -------------------------------------------------------------------------
// Session token helpers (shared by admin + customer — role comes from the
// JWT payload itself, checked server-side on every protected route).
// -------------------------------------------------------------------------

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAuthToken(token: string) {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearAuthToken() {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_STORAGE_KEY);
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  // Content here (homepage/about/contact/footer/header, product & stock data)
  // is admin-editable and expected to reflect immediately — never let
  // Next.js's fetch Data Cache serve a stale build-time snapshot of it.
  const res = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request to ${path} failed with ${res.status}`);
  }
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

/** Attaches the logged-in user's Bearer token. Used for both admin and
 *  customer-authenticated routes — the backend checks role per-route. */
async function authedRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  return request<T>(path, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
}

export const api = {
  // --- Storefront ---------------------------------------------------------
  getProduct: (slug: string) => request(`/products/${slug}`),
  listProducts: (query: string) => request(`/products?${query}`),
  getVariantAvailability: (variantId: string) =>
    request(`/products/variants/${variantId}/availability`),
  getShippingQuote: (city: string, subtotal: number) =>
    request("/checkout/shipping-quote", {
      method: "POST",
      body: JSON.stringify({ city, subtotal }),
    }),
  checkout: (payload: unknown) =>
    authedRequest("/checkout", { method: "POST", body: JSON.stringify(payload) }),
  trackOrder: (orderNumber: string, phone: string) =>
    request(`/checkout/track?orderNumber=${orderNumber}&phone=${phone}`),
  aiChat: (message: string, history: unknown[]) =>
    request("/ai/chat", { method: "POST", body: JSON.stringify({ message, history }) }),
  getHomepageContent: () => request("/homepage"),
  getAboutContent: () => request("/content/about"),
  getContactContent: () => request("/content/contact"),
  getFooterContent: () => request("/content/footer"),
  getHeaderContent: () => request("/content/header"),
  getPrivacyContent: () => request("/content/privacy"),
  getTermsContent: () => request("/content/terms"),
  getReturnsContent: () => request("/content/returns"),
  getSizeGuideContent: () => request("/content/size-guide"),

  // --- Auth (shared login for admin + customer accounts) -----------------
  login: (email: string, password: string) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (payload: { name: string; email: string; password: string; phone?: string }) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  getCurrentUser: () => authedRequest("/auth/me"),
  getMyOrders: () => authedRequest("/auth/orders"),

  // --- Admin: categories ---------------------------------------------------
  adminGetCategories: () => authedRequest("/admin/categories"),
  adminCreateCategory: (name: string) =>
    authedRequest("/admin/categories", { method: "POST", body: JSON.stringify({ name }) }),

  // --- Admin: products ------------------------------------------------------
  adminListProducts: () => authedRequest("/admin/products"),
  adminGetProduct: (productId: string) => authedRequest(`/admin/products/${productId}`),
  adminCreateProduct: (payload: unknown) =>
    authedRequest("/admin/products", { method: "POST", body: JSON.stringify(payload) }),
  adminUpdateProduct: (productId: string, payload: unknown) =>
    authedRequest(`/admin/products/${productId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  adminDeleteProduct: (productId: string) =>
    authedRequest(`/admin/products/${productId}`, { method: "DELETE" }),
  adminUpdateVariant: (variantId: string, payload: unknown) =>
    authedRequest(`/admin/variants/${variantId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  // --- Admin: image upload ---------------------------------------------------
  adminUploadImage: async (file: File): Promise<{ url: string }> => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`${API_BASE_URL}/admin/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? "Image upload failed.");
    }
    return res.json();
  },
  adminImportCsv: async (type: "products" | "categories" | "users", file: File) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE_URL}/admin/imports/${type}`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {}, body: formData });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error ?? "CSV import failed.");
    return body as { imported: number };
  },
  adminGetStripeSettings: () => authedRequest("/admin/payments/stripe"),
  adminSaveStripeSettings: (secretKey: string, webhookSecret: string) =>
    authedRequest("/admin/payments/stripe", { method: "PUT", body: JSON.stringify({ secretKey, webhookSecret }) }),

  // --- Admin: dashboard / orders / shipping -----------------------------------
  adminGetDashboard: () => authedRequest("/admin/dashboard"),
  adminListOrders: () => authedRequest("/admin/orders"),
  adminUpdateOrderStatus: (orderId: string, status: string) =>
    authedRequest(`/admin/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  adminGetShippingRates: () => authedRequest("/admin/shipping-rates"),
  adminUpsertShippingRate: (city: string, fee: number, etaDays: number) =>
    authedRequest("/admin/shipping-rates", {
      method: "PUT",
      body: JSON.stringify({ city, fee, etaDays }),
    }),

  // --- Admin: homepage content ---------------------------------------------
  adminGetHomepageContent: () => authedRequest("/admin/homepage"),
  adminUpdateHomepageContent: (payload: unknown) =>
    authedRequest("/admin/homepage", { method: "PUT", body: JSON.stringify(payload) }),

  // --- Admin: about / contact / footer / header content ---------------------
  adminGetAboutContent: () => authedRequest("/admin/about"),
  adminUpdateAboutContent: (payload: unknown) =>
    authedRequest("/admin/about", { method: "PUT", body: JSON.stringify(payload) }),
  adminGetContactContent: () => authedRequest("/admin/contact"),
  adminUpdateContactContent: (payload: unknown) =>
    authedRequest("/admin/contact", { method: "PUT", body: JSON.stringify(payload) }),
  adminGetFooterContent: () => authedRequest("/admin/footer"),
  adminUpdateFooterContent: (payload: unknown) =>
    authedRequest("/admin/footer", { method: "PUT", body: JSON.stringify(payload) }),
  adminGetHeaderContent: () => authedRequest("/admin/header"),
  adminUpdateHeaderContent: (payload: unknown) =>
    authedRequest("/admin/header", { method: "PUT", body: JSON.stringify(payload) }),

  // --- Admin: privacy / terms / returns / size guide content ----------------
  adminGetPrivacyContent: () => authedRequest("/admin/privacy"),
  adminUpdatePrivacyContent: (payload: unknown) =>
    authedRequest("/admin/privacy", { method: "PUT", body: JSON.stringify(payload) }),
  adminGetTermsContent: () => authedRequest("/admin/terms"),
  adminUpdateTermsContent: (payload: unknown) =>
    authedRequest("/admin/terms", { method: "PUT", body: JSON.stringify(payload) }),
  adminGetReturnsContent: () => authedRequest("/admin/returns"),
  adminUpdateReturnsContent: (payload: unknown) =>
    authedRequest("/admin/returns", { method: "PUT", body: JSON.stringify(payload) }),
  adminGetSizeGuideContent: () => authedRequest("/admin/size-guide"),
  adminUpdateSizeGuideContent: (payload: unknown) =>
    authedRequest("/admin/size-guide", { method: "PUT", body: JSON.stringify(payload) }),
};
