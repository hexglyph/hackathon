"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

export default function NewsCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0)

    const newsItems = [
        {
            id: 1,
            image: "/news-1.jpg",
            title:
                "Prefeitura lança o Mamãe Tarifa Zero, que garante ônibus gratuitos a quem tem filhos em creche, e inaugura 24ª CEI da cidade desde 2023",
            link: "/noticias/mamae-tarifa-zero",
        },
        {
            id: 2,
            image: "/news-2.jpg",
            title: "Centro tem queda de 30,5% no número de roubos",
            link: "/noticias/queda-roubos-centro",
        },
        {
            id: 3,
            image: "/news-3.jpg",
            title: "Mais de 30 mil apartamentos em quatro anos",
            link: "/noticias/apartamentos-habitacao",
        },
        {
            id: 4,
            image: "/news-4.jpg",
            title: "Região do Pari ganha unidade do Bom Prato",
            link: "/noticias/bom-prato-pari",
        },
    ]

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % newsItems.length)
    }

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + newsItems.length) % newsItems.length)
    }

    return (
        <div className="relative">
            <div className="flex">
                <div className="w-full md:w-10/12 relative">
                    <div className="relative h-[505px] bg-sky-400 overflow-hidden rounded-md mb-4">
                        <Image
                            src={newsItems[currentSlide].image || "/placeholder.svg?height=300&width=600"}
                            alt={newsItems[currentSlide].title}
                            fill
                            className="object-cover hidden"
                        />
                    </div>

                    <div className=" bg-secondary text-secondary-foreground p-4 rounded-md">
                        <h3 className="text-white text-lg font-semibold">{newsItems[currentSlide].title}</h3>
                    </div>

                    <div className="absolute left-0 top-1/2 -translate-y-1/2">
                        <button
                            onClick={prevSlide}
                            className="bg-white/30 rounded-r-full p-2 text-white hover:bg-white/50"
                            aria-label="Previous news"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                    </div>

                    <div className="absolute right-0 top-1/2 -translate-y-1/2">
                        <button
                            onClick={nextSlide}
                            className="bg-white/30 rounded-l-full p-2 text-white hover:bg-white/50"
                            aria-label="Next news"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="hidden md:flex md:w-2/12 flex-col space-y-4 pl-4">
                    {newsItems.slice(1, 4).map((item) => (
                        <Link key={item.id} href={item.link} className="block">
                            <div className="bg-white rounded-lg overflow-hidden shadow-md flex flex-col h-auto">
                                <div className="h-32 relative bg-sky-600">

                                </div>
                                <div className="p-2 border-t border-gray-100 min-h-16">
                                    <h4 className="text-sm font-medium line-clamp-2">{item.title}</h4>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}

