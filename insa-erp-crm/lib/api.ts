import { getToken, removeAuth } from "./auth";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";

export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();

    const headers = new Headers(options.headers);

    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        removeAuth();

        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }

        throw new Error("Your session has expired. Please login again.");
    }

    if (response.status === 403) {
        throw new Error(
            "Access denied. Your account does not have permission."
        );
    }

    if (!response.ok) {
        let message = `Request failed with status ${response.status}`;

        try {
            const errorData = await response.json();

            if (errorData?.message) {
                message = errorData.message;
            } else if (errorData?.error) {
                message = errorData.error;
            }
        } catch {
            // Response was not JSON
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}

/* GET */

export async function apiGet<T>(
    endpoint: string
): Promise<T> {
    return apiRequest<T>(endpoint, {
        method: "GET",
    });
}

/* POST */

export async function apiPost<T>(
    endpoint: string,
    data?: unknown
): Promise<T> {
    return apiRequest<T>(endpoint, {
        method: "POST",
        body: data !== undefined
            ? JSON.stringify(data)
            : undefined,
    });
}

/* PUT */

export async function apiPut<T>(
    endpoint: string,
    data: unknown
): Promise<T> {
    return apiRequest<T>(endpoint, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

/* PATCH */

export async function apiPatch<T>(
    endpoint: string,
    data?: unknown
): Promise<T> {
    return apiRequest<T>(endpoint, {
        method: "PATCH",
        body: data !== undefined
            ? JSON.stringify(data)
            : undefined,
    });
}

/* DELETE */

export async function apiDelete<T>(
    endpoint: string
): Promise<T> {
    return apiRequest<T>(endpoint, {
        method: "DELETE",
    });
}

/* Convenient API object */

export const api = {
    get: apiGet,
    post: apiPost,
    put: apiPut,
    patch: apiPatch,
    delete: apiDelete,
};

export { API_URL };