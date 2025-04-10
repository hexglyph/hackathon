"use client"

import type React from "react"
import TopMenu from "@/components/TopMenu"
import PlayerMenu from "@/components/PlayerMenu"

export default function RootLayoutClient({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <TopMenu />
            <main className="pt-16">{children}</main>
            <PlayerMenu />
        </>
    )
}

