import Link from "next/link"
import { Search, BusFront, Phone, Map, Home, CircleDollarSign, HandHeart } from "lucide-react"

export default function SideMenu() {
    const menuItems = [
        { icon: <Search className="w-5 h-5" />, label: "Search", href: "/busca" },
        { icon: <BusFront className="w-5 h-5" />, label: "Transport Card", href: "https://bilheteunico.sptrans.com.br/" },
        {
            icon: <Map className="w-5 h-5" />,
            label: "Services Map",
            href: "https://geosampa.prefeitura.sp.gov.br/PaginasPublicas/_SBC.aspx",
        },
        { icon: <Home className="w-5 h-5" />, label: "Property Tax", href: "https://capital.sp.gov.br/web/iptu2025" },
        { icon: <Phone className="w-5 h-5" />, label: "SP 156", href: "/sp156" },
        {
            icon: <CircleDollarSign className="w-5 h-5" />,
            label: "Active Debt",
            href: "https://dividaativa.prefeitura.sp.gov.br/",
        },
        {
            icon: <HandHeart className="w-5 h-5" />,
            label: "Health",
            href: "https://www.prefeitura.sp.gov.br/cidade/secretarias/saude/vigilancia_em_saude/",
        },
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
