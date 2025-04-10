import Link from "next/link"
import Image from "next/image"

export default function LatestNews() {
    const newsItems = [
        {
            id: 1,
            title:
                "Prefeitura entrega revitalização do Centro Esportivo Vila Guarani, região que recebe Somando esses equipamentos foram investidos R$ 1,3 milhões na área de recreação, salas de ginástica, quadras de...",
            image: "/news-vila-guarani.jpg",
            date: "21/03/2023",
            link: "/noticias/revitalizacao-vila-guarani",
        },
        {
            id: 2,
            title: 'Prefeitura moderniza Clube da Comunidade em Cidade Líder e substitui "terrão" por grama sintética',
            image: "/news-clube-comunidade.jpg",
            date: "16/03/2023",
            link: "/noticias/clube-comunidade-cidade-lider",
        },
    ]

    const agendaItems = [
        {
            id: 1,
            time: "10:00",
            title: "Reunião com Padre Júlio de Melo Pina Brasil e Wagner Araujo, Sócio da Hyper Brasil e José Carlos",
            location: "Local: Gabinete do Prefeito",
        },
        {
            id: 2,
            time: "16:30",
            title: "Reunião com Presidente da Fundação Dom Cabral – Antonio Batista, Relações Institucionais da [...]",
            location: "Local: Gabinete do Prefeito",
        },
        {
            id: 3,
            time: "18:00",
            title: "Despacho com Chefe de Gabinete – Vitor Sampaio",
            location: "",
        },
    ]

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="section-title text-xl">ÚLTIMAS NOTÍCIAS</h2>
                <Link href="/noticias" className="text-sm text-orange-600 hover:underline flex items-center">
                    Todas as notícias
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

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    {newsItems.map((item) => (
                        <div key={item.id} className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-md shadow-sm">
                            <div className="hidden md:block md:w-1/3 h-[200px] md:h-auto relative bg-sky-400 rounded-md">
                                <Image
                                    src={item.image || "/placeholder.svg?height=200&width=300"}
                                    alt={item.title}
                                    fill
                                    className="object-cover rounded-md hidden"
                                />
                            </div>
                            <div className="md:w-2/3">
                                <Link href={item.link} className="block">
                                    <h3 className="text-lg font-medium mb-2 hover:text-orange-600">{item.title}</h3>
                                </Link>
                                <div className="text-sm text-gray-500 mt-2">{item.date}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-md shadow-sm p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="section-title text-lg">AGENDA DO PREFEITO</h2>
                        <Link href="/agenda" className="text-xs text-orange-600 hover:underline">
                            Agenda completa
                        </Link>
                    </div>

                    <div className="bg-orange-500 text-white p-3 text-center mb-4">
                        <div className="font-bold">QUARTA-FEIRA, 2 DE ABRIL DE 2023</div>
                    </div>

                    <div className="space-y-4">
                        {agendaItems.map((item) => (
                            <div key={item.id} className="border-b pb-4 last:border-b-0">
                                <div className="font-bold">{item.time}</div>
                                <div className="text-sm">{item.title}</div>
                                {item.location && <div className="text-xs text-gray-500 mt-1">{item.location}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

