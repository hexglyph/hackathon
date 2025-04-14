import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react"

export default function Header() {
    return (
        <header className="shadow-lg shadow-black/10 bg-white mb-10">
            <div className="top-bar py-1 px-4 bg-secondary text-secondary-foreground">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="hidden md:flex space-x-4 text-xs">
                        <Link href="/acesso-informacao" className="hover:underline">
                            Acesso à Informação
                        </Link>
                        <span>|</span>
                        <Link href="/transparencia" className="hover:underline">
                            Transparência São Paulo
                        </Link>
                        <span>|</span>
                        <Link href="/ouvidoria" className="hover:underline">
                            Ouvidoria
                        </Link>
                        <span>|</span>
                        <Link href="/sic" className="hover:underline">
                            SIC
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-2">
                        <div className="flex space-x-1">
                            <Link href="https://www.linkedin.com/company/prefeitura-de-sao-paulo" aria-label="LinkedIn">
                                <Linkedin size={16} />
                            </Link>
                            <Link href="https://twitter.com/prefsp" aria-label="Twitter">
                                <Twitter size={16} />
                            </Link>
                            <Link href="https://www.youtube.com/user/prefeiturasaopaulo" aria-label="YouTube">
                                <Youtube size={16} />
                            </Link>
                            <Link href="https://www.facebook.com/PrefSP" aria-label="Facebook">
                                <Facebook size={16} />
                            </Link>
                            <Link href="https://www.instagram.com/prefsp/" aria-label="Instagram">
                                <Instagram size={16} />
                            </Link>
                        </div>

                        <div className="text-xs ml-2">
                            <Link href="/diario-oficial" className="hover:underline">
                                Diário Oficial
                            </Link>
                            <span className="mx-1">|</span>
                            <Link href="/sp156" className="hover:underline">
                                SP 156
                            </Link>
                            <span className="mx-1">|</span>
                            <Link href="/acessibilidade" className="hover:underline">
                                Acessibilidade
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="main-header py-3 px-4 bg-white">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center">
                        <Image src="https://capital.sp.gov.br/documents/34276/0/logo-prefeitura-de-sao-paulo.png/c4464801-6c69-25f2-932b-093acf2e3525?version=1.0&t=1704308342428" alt="Prefeitura de São Paulo" width={230} height={60} priority />
                    </div>

                    <nav className="hidden md:flex space-x-6">
                        <div className="group relative">
                            <button className="flex items-center space-x-1 font-medium">
                                <span>Órgãos públicos</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="feather feather-chevron-down"
                                >
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </button>
                            <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md hidden group-hover:block z-10">
                                <div className="py-2">
                                    <Link href="/orgaos/secretarias" className="block px-4 py-2 hover:bg-gray-100">
                                        Secretarias
                                    </Link>
                                    <Link href="/orgaos/subprefeituras" className="block px-4 py-2 hover:bg-gray-100">
                                        Subprefeituras
                                    </Link>
                                    <Link href="/orgaos/empresas" className="block px-4 py-2 hover:bg-gray-100">
                                        Empresas Públicas
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="group relative">
                            <button className="flex items-center space-x-1 font-medium">
                                <span>Serviços</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="feather feather-chevron-down"
                                >
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </button>
                            <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md hidden group-hover:block z-10">
                                <div className="py-2">
                                    <Link href="/servicos/cidadao" className="block px-4 py-2 hover:bg-gray-100">
                                        Para o Cidadão
                                    </Link>
                                    <Link href="/servicos/empresas" className="block px-4 py-2 hover:bg-gray-100">
                                        Para Empresas
                                    </Link>
                                    <Link href="/servicos/servidor" className="block px-4 py-2 hover:bg-gray-100">
                                        Para o Servidor
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="group relative">
                            <button className="flex items-center space-x-1 font-medium">
                                <span>Servidores</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="feather feather-chevron-down"
                                >
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </button>
                            <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md hidden group-hover:block z-10">
                                <div className="py-2">
                                    <Link href="/servidores/portal" className="block px-4 py-2 hover:bg-gray-100">
                                        Portal do Servidor
                                    </Link>
                                    <Link href="/servidores/concursos" className="block px-4 py-2 hover:bg-gray-100">
                                        Concursos
                                    </Link>
                                    <Link href="/servidores/capacitacao" className="block px-4 py-2 hover:bg-gray-100">
                                        Capacitação
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <Link href="/noticias" className="font-medium">
                            Notícias
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    )
}

