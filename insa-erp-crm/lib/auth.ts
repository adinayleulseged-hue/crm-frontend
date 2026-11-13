export interface AuthUser {
    id?: number;
    username?: string;
    email?: string;
    name?: string;
    roles?: string[];
}

export function getToken(): string | null {
    if (typeof window === "undefined") {
        return null;
    }

    return localStorage.getItem("accessToken");
}

export function setToken(token: string): void {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.setItem("accessToken", token);
}

export function getRefreshToken(): string | null {
    if (typeof window === "undefined") {
        return null;
    }

    return localStorage.getItem("refreshToken");
}

export function setRefreshToken(token: string): void {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.setItem("refreshToken", token);
}

export function getUser(): AuthUser | null {
    if (typeof window === "undefined") {
        return null;
    }

    const user = localStorage.getItem("user");

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch {
        return null;
    }
}

export function setUser(user: AuthUser): void {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.setItem("user", JSON.stringify(user));
}

export function removeAuth(): void {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
}

export function isAuthenticated(): boolean {
    return getToken() !== null;
}

export function logout(): void {
    removeAuth();

    if (typeof window !== "undefined") {
        window.location.href = "/login";
    }
}