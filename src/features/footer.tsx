import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react"

export default function Footer() {
    const footerLinks = [
        {
            title: "Prefeitura de São Paulo",
            links: [
                { label: "Agenda do prefeito", href: "/agenda-prefeito" },
                { label: "Dia do Prefeito", href: "/dia-prefeito" },
                { label: "Conheça a equipe de governo", href: "/equipe-governo" },
                { label: "Subprefeituras", href: "/subprefeituras" },
                { label: "Secretarias", href: "/secretarias" },
                { label: "Órgãos e Autarquias", href: "/orgaos" },
                { label: "Lei", href: "/lei" },
            ],
        },
        {
            title: "Serviços para o Cidadão",
            links: [
                { label: "Animais", href: "/servicos/animais" },
                { label: "Cultura e Economia Criativa", href: "/servicos/cultura" },
                { label: "Educação", href: "/servicos/educacao" },
                { label: "Esportes e Lazer", href: "/servicos/esportes" },
                { label: "Família e Assistência Social", href: "/servicos/familia" },
                { label: "Finanças", href: "/servicos/financas" },
                { label: "Mobilidade Urbana e Transporte", href: "/servicos/mobilidade" },
                { label: "Rua e Bairro", href: "/servicos/rua-bairro" },
                { label: "Saúde e Bem-estar", href: "/servicos/saude" },
                { label: "Segurança", href: "/servicos/seguranca" },
                { label: "Trabalho", href: "/servicos/trabalho" },
            ],
        },
        {
            title: "Serviços para Empresas",
            links: [
                { label: "Abertura de Empresas", href: "/empresas/abertura" },
                { label: "Alvará, Certificados e Licenças", href: "/empresas/alvara" },
                { label: "Cadastros", href: "/empresas/cadastros" },
                { label: "Compras, Licitações e Normas", href: "/empresas/compras" },
                { label: "Empreendedorismo", href: "/empresas/empreendedorismo" },
                { label: "Impostos e Taxas", href: "/empresas/impostos" },
                { label: "Legislação", href: "/empresas/legislacao" },
                { label: "Licitações e Fornecedores", href: "/empresas/licitacoes" },
                { label: "Nota do Milhão", href: "/empresas/nota-milhao" },
                { label: "Organizações", href: "/empresas/organizacoes" },
                { label: "Programas e Benefícios", href: "/empresas/programas" },
            ],
        },
        {
            title: "Serviços para o Servidor",
            links: [
                { label: "Atendimento", href: "/servidor/atendimento" },
                { label: "Benefícios", href: "/servidor/beneficios" },
                { label: "Carreira", href: "/servidor/carreira" },
                { label: "Comunicação e Publicações", href: "/servidor/comunicacao" },
                { label: "Eventos para o Servidor", href: "/servidor/eventos" },
                { label: "Gestão de Pessoas", href: "/servidor/gestao-pessoas" },
                { label: "Outras informações", href: "/servidor/outras-informacoes" },
                { label: "Normas e procedimentos", href: "/servidor/normas" },
            ],
        },
        {
            title: "Acontece na cidade",
            links: [
                { label: "Notícias", href: "/noticias" },
                { label: "Mapa de Serviços", href: "/mapa-servicos" },
                { label: "Portal da Legislação", href: "/legislacao" },
                { label: "Pesquisa de Processos", href: "/processos" },
                { label: "Publicações", href: "/publicacoes" },
                { label: "Ata de Registro de Preços", href: "/ata-registro" },
            ],
        },
    ]

    return (
        <footer className="main-footer bg-orange-400 mt-12 pt-8 pb-4">
            <div className="container mx-auto px-4">
                <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
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

                <div className="mt-12 hidden md:flex flex-col md:flex-row justify-between items-center border-t border-white/20 pt-6">
                    <div className="flex items-center mb-4 md:mb-0">
                        <Image src="/logo-prefeitura-sp-white.png" alt="Prefeitura de São Paulo" width={150} height={40} />
                    </div>

                    <div className="hidden md:flex space-x-4">
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
                        Atendimento:{" "}
                        <Link href="/atendimento" className="underline">
                            Fale com Subprefeitura
                        </Link>
                    </div>
                    <div>© COPYRIGHT 2023, Prefeitura Municipal de São Paulo. Viaduto do Chá, 15 - Centro - CEP: 01002-020</div>
                </div>
            </div>
        </footer>
    )
}

