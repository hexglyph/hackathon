import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/features/header"
import Footer from "@/features/footer"

const inter = Inter({ subsets: ["latin"] })

// Update the metadata to English
export const metadata: Metadata = {
  title: "São Paulo City Hall",
  description: "São Paulo City Hall Portal",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
