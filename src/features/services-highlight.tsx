import Link from "next/link"
import Image from "next/image"

export default function ServicesHighlight() {
    const services = [
        {
            id: 1,
            title: "ASFALTO NOVO",
            image: "https://capital.sp.gov.br/documents/34276/4220456/Logo_asfalto-novo.png/4bbf0ade-970e-ae62-6e81-192cedab95dd?t=1712245127022",
            link: "/servicos/asfalto-novo",
        },
        {
            id: 2,
            title: "PODE ENTRAR",
            image: "https://capital.sp.gov.br/documents/34276/4220456/Logo_Pode-entrar.png/d2b0d034-f9fa-2974-aeb4-a4c94b1b9eb2?t=1712245076202",
            link: "/servicos/pode-entrar",
        },
        {
            id: 3,
            title: "FAIXA AZUL",
            image: "https://capital.sp.gov.br/documents/34276/4220456/Logo_faixa-azul.png/be4648ff-53b9-0f74-eda1-897f5e607ca5?t=1712244984133",
            link: "/servicos/faixa-azul",
        },
        {
            id: 4,
            title: "CRECHE 100%",
            image: "https://capital.sp.gov.br/documents/34276/4220456/Logo_creche-100.png/667aaa3e-04e5-065b-a387-80fcc22f2812?t=1712245230032",
            link: "/servicos/creche",
        },
        {
            id: 5,
            title: "MÃE PAULISTANA",
            image: "https://capital.sp.gov.br/documents/34276/4220456/MicrosoftTeams-image.png/217d9063-1e7d-0004-344d-8dd538011301?t=1712245021114",
            link: "/servicos/mae-paulistana",
        },
        {
            id: 6,
            title: "SÃO PAULO CAPITAL VERDE",
            image: "https://capital.sp.gov.br/documents/34276/4220456/MicrosoftTeams-image+%281%29.png/17cafa4d-7d7d-f477-74cb-ecbb5a7eae9a?t=1712245102953",
            link: "/servicos/capital-verde",
        },
        {
            id: 7,
            title: "DOMINGO TARIFA ZERO",
            image: "https://capital.sp.gov.br/documents/34276/4220456/Logo_Domingao-tarifa-zero.png/6294d0aa-1deb-b229-5bd5-6362c9aa0161?t=1712244944011",
            link: "/servicos/domingo-tarifa-zero",
        },
        {
            id: 8,
            title: "COMBATE À DENGUE",
            image: "https://capital.sp.gov.br/documents/34276/4220456/MicrosoftTeams-image+%282%29.png/f7564839-21a0-0c83-d84d-1bb1235b87c7?t=1712245183776",
            link: "/servicos/combate-dengue",
        },
    ]

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="section-title text-xl">SERVIÇOS EM DESTAQUE</h2>
                <Link href="/servicos" className="text-sm text-orange-600 hover:underline flex items-center">
                    Todos os Serviços
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
                        className="ml-1"
                    >
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </Link>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-4 gap-4">
                {services.map((service) => (
                    <Link key={service.id} href={service.link} className="block">
                        <div className="service-card bg-white rounded-md overflow-hidden shadow-sm hover:shadow-md">
                            <div className="h-[100px] relative">
                                <Image
                                    src={service.image || "/placeholder.svg?height=100&width=300"}
                                    alt={service.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

