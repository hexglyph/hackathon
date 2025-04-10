export type UserRole = "user" | "admin" | null
export type PublicAdminRole = "manager" | "analyst" | "viewer" | null

export function hasAdminAccess(role: UserRole): boolean {
    return role === "admin"
}

export function hasPublicAdminAccess(publicAdminRole: PublicAdminRole): boolean {
    return publicAdminRole !== null
}

export function canManageUsers(role: UserRole, publicAdminRole: PublicAdminRole): boolean {
    return role === "admin" || publicAdminRole === "manager"
}

export function canEditContent(role: UserRole, publicAdminRole: PublicAdminRole): boolean {
    return role === "admin" || ["manager", "analyst"].includes(publicAdminRole || "")
}

export function canViewContent(role: UserRole, publicAdminRole: PublicAdminRole): boolean {
    return role === "admin" || publicAdminRole !== null
}

