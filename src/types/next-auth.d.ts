import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id?: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            level?: number;
            experience?: number;
            hp?: number;
            mana?: number;
            rank?: string;
            role?: "user" | "admin" | null;
            publicAdminRole?: "manager" | "analyst" | "viewer" | null;
            createdAt?: string;
            territoriesCount?: number;
            reputationScore?: number;
        } & DefaultSession["user"]; // Garante compatibilidade com o tipo padrão
    }

    interface User extends DefaultUser {
        id: string;
        level?: number;
        experience?: number;
        hp?: number;
        mana?: number;
        rank?: string;
        role?: "user" | "admin" | null;
        publicAdminRole?: "manager" | "analyst" | "viewer" | null;
        createdAt?: string;
        territoriesCount?: number;
        reputationScore?: number;
    }
}