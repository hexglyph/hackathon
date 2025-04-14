import Link from "next/link"
import { Search, BusFront, Phone, Map, Home, HelpCircle, CircleDollarSign, HandHeart } from "lucide-react"

export default function SideMenu() {
    const menuItems = [
        { icon: <Search className="w-5 h-5" />, label: "Buscar", href: "/busca" },
        { icon: <BusFront className="w-5 h-5" />, label: "Bilhete Unico", href: "https://bilheteunico.sptrans.com.br/" },
        { icon: <Map className="w-5 h-5" />, label: "Mapa de Servicos", href: "https://geosampa.prefeitura.sp.gov.br/PaginasPublicas/_SBC.aspx" },
        { icon: <Home className="w-5 h-5" />, label: "IPTU", href: "https://capital.sp.gov.br/web/iptu2025" },
        { icon: <Phone className="w-5 h-5" />, label: "SP 156", href: "/sp156" },
        { icon: <CircleDollarSign className="w-5 h-5" />, label: "Divida Ativa", href: "https://dividaativa.prefeitura.sp.gov.br/" },
        { icon: <HandHeart className="w-5 h-5" />, label: "Saude", href: "https://www.prefeitura.sp.gov.br/cidade/secretarias/saude/vigilancia_em_saude/" },

    ]

    return (
        <div className="grid grid-cols-4 gap-4 md:gap-0 md:flex md:flex-col space-y-2">
            {menuItems.map((item, index) => (
                <Link
                    key={index}
                    href={item.href}
                    className="flex flex-col items-center justify-center h-18 w-18 p-2 border border-gray-500/25 bg-white rounded-md shadow-sm hover:bg-gray-50 transition-colors text-xs text-center"
                >
                    <div className="mb-1">{item.icon}</div>
                    <span className="text-xs">{item.label}</span>
                </Link>
            ))}
        </div>
    )
}

