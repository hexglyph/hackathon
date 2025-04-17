import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react"

export default function Footer() {
    const footerLinks = [
        {
            title: "São Paulo City Hall",
            links: [
                { label: "Mayor's agenda", href: "/agenda-prefeito" },
                { label: "Mayor's Day", href: "/dia-prefeito" },
                { label: "Meet the government team", href: "/equipe-governo" },
                { label: "Regional Offices", href: "/subprefeituras" },
                { label: "Departments", href: "/secretarias" },
                { label: "Agencies and Authorities", href: "/orgaos" },
                { label: "Law", href: "/lei" },
            ],
        },
        {
            title: "Services for Citizens",
            links: [
                { label: "Animals", href: "/servicos/animais" },
                { label: "Culture and Creative Economy", href: "/servicos/cultura" },
                { label: "Education", href: "/servicos/educacao" },
                { label: "Sports and Leisure", href: "/servicos/esportes" },
                { label: "Family and Social Assistance", href: "/servicos/familia" },
                { label: "Finance", href: "/servicos/financas" },
                { label: "Urban Mobility and Transportation", href: "/servicos/mobilidade" },
                { label: "Street and Neighborhood", href: "/servicos/rua-bairro" },
                { label: "Health and Wellness", href: "/servicos/saude" },
                { label: "Security", href: "/servicos/seguranca" },
                { label: "Work", href: "/servicos/trabalho" },
            ],
        },
        {
            title: "Services for Businesses",
            links: [
                { label: "Business Opening", href: "/empresas/abertura" },
                { label: "Permits, Certificates and Licenses", href: "/empresas/alvara" },
                { label: "Registrations", href: "/empresas/cadastros" },
                { label: "Purchases, Bids and Standards", href: "/empresas/compras" },
                { label: "Entrepreneurship", href: "/empresas/empreendedorismo" },
                { label: "Taxes and Fees", href: "/empresas/impostos" },
                { label: "Legislation", href: "/empresas/legislacao" },
                { label: "Bids and Suppliers", href: "/empresas/licitacoes" },
                { label: "Million Note", href: "/empresas/nota-milhao" },
                { label: "Organizations", href: "/empresas/organizacoes" },
                { label: "Programs and Benefits", href: "/empresas/programas" },
            ],
        },
        {
            title: "Services for Civil Servants",
            links: [
                { label: "Service", href: "/servidor/atendimento" },
                { label: "Benefits", href: "/servidor/beneficios" },
                { label: "Career", href: "/servidor/carreira" },
                { label: "Communication and Publications", href: "/servidor/comunicacao" },
                { label: "Events for Civil Servants", href: "/servidor/eventos" },
                { label: "People Management", href: "/servidor/gestao-pessoas" },
                { label: "Other information", href: "/servidor/outras-informacoes" },
                { label: "Rules and procedures", href: "/servidor/normas" },
            ],
        },
        {
            title: "Happening in the city",
            links: [
                { label: "News", href: "/noticias" },
                { label: "Services Map", href: "/mapa-servicos" },
                { label: "Legislation Portal", href: "/legislacao" },
                { label: "Process Search", href: "/processos" },
                { label: "Publications", href: "/publicacoes" },
                { label: "Price Registration Minutes", href: "/ata-registro" },
            ],
        },
    ]

    return (
        <footer className="main-footer mt-12 pt-8 pb-4">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {footerLinks.map((section, index) => (
                        <div key={index}>
                            <h3 className="text-white font-bold mb-4 text-sm">{section.title}</h3>
                            <ul className="space-y-2">
                                {section.links.map((link, linkIndex) => (
                                    <li key={linkIndex}>
                                        <Link href={link.href} className="text-white/80 hover:text-white text-xs">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-12 flex flex-col md:flex-row justify-between items-center border-t border-white/20 pt-6">
                    <div className="flex items-center mb-4 md:mb-0">
                        <Image src="/logo-prefeitura-sp-white.png" alt="Prefeitura de São Paulo" width={150} height={40} />
                    </div>

                    <div className="flex space-x-4">
                        <Link
                            href="https://www.linkedin.com/company/prefeitura-de-sao-paulo"
                            aria-label="LinkedIn"
                            className="text-white"
                        >
                            <Linkedin size={20} />
                        </Link>
                        <Link href="https://twitter.com/prefsp" aria-label="Twitter" className="text-white">
                            <Twitter size={20} />
                        </Link>
                        <Link href="https://www.youtube.com/user/prefeiturasaopaulo" aria-label="YouTube" className="text-white">
                            <Youtube size={20} />
                        </Link>
                        <Link href="https://www.facebook.com/PrefSP" aria-label="Facebook" className="text-white">
                            <Facebook size={20} />
                        </Link>
                        <Link href="https://www.instagram.com/prefsp/" aria-label="Instagram" className="text-white">
                            <Instagram size={20} />
                        </Link>
                        <span className="text-white text-sm ml-2">Diário Oficial</span>
                    </div>
                </div>

                <div className="mt-6 text-center text-white/70 text-xs">
                    <div className="mb-2">
                        Service:{" "}
                        <Link href="/atendimento" className="underline">
                            Contact Regional Office
                        </Link>
                    </div>
                    <div>© COPYRIGHT 2023, São Paulo City Hall. Viaduto do Chá, 15 - Centro - CEP: 01002-020</div>
                </div>
            </div>
        </footer>
    )
}
