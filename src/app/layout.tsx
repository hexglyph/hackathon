import type { Metadata } from 'next'
import type React from "react"
import { Inter } from 'next/font/google'
import './globals.css'
import Header from "@/features/header"
import Footer from "@/features/footer"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SPCity - Acolhimento de Demandas do Cidadão de São Paulo",
  description:
    "O SPCity facilita a comunicação entre os cidadãos de São Paulo e a administração pública. Registre demandas, acompanhe solicitações e receba atualizações sobre os serviços municipais.",
  keywords: "SPCity, São Paulo, serviços públicos, demandas, prefeitura, comunicação, solicitações, cidade",
  authors: [{ name: "Prefeitura de São Paulo" }],
  openGraph: {
    title: "SPCity - Acolhimento de Demandas do Cidadão de São Paulo",
    description: "Registre e acompanhe solicitações de serviços públicos em São Paulo com o SPCity.",
    url: "https://spcity.app",
    siteName: "SPCity",
    images: [
      {
        url: "/logo_maior.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SPCity - Acolhimento de Demandas do Cidadão de São Paulo",
    description: "Com o SPCity, cidadãos de São Paulo podem registrar e acompanhar demandas de serviços públicos.",
    images: ["/logo_maior.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
  verification: {
    other: {
      "msapplication-TileColor": "#ffffff",
    },
  },
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

