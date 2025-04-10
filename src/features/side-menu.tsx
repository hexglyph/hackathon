import Link from "next/link"
import { Search, Phone, FileText, Home, HelpCircle, MessageSquare } from "lucide-react"

export default function SideMenu() {
    const menuItems = [
        { icon: <Search className="w-5 h-5" />, label: "Buscar", href: "/busca" },
        { icon: <FileText className="w-5 h-5" />, label: "Serviços Digitais", href: "/servicos-digitais" },
        { icon: <MessageSquare className="w-5 h-5" />, label: "Fale com a Prefeitura", href: "/fale-conosco" },
        { icon: <Home className="w-5 h-5" />, label: "SP156", href: "/sp156" },
        { icon: <Phone className="w-5 h-5" />, label: "Telefones Úteis", href: "/telefones" },
        { icon: <HelpCircle className="w-5 h-5" />, label: "Ajuda", href: "/ajuda" },
    ]

    return (
        <div className="grid grid-cols-4 gap-4 md:gap-0 md:flex md:flex-col space-y-2">
            {menuItems.map((item, index) => (
                <Link
                    key={index}
                    href={item.href}
                    className="flex flex-col items-center justify-center p-3 bg-white rounded-md shadow-sm hover:bg-gray-50 transition-colors text-center"
                >
                    <div className="mb-1">{item.icon}</div>
                    <span className="text-xs">{item.label}</span>
                </Link>
            ))}
        </div>
    )
}

