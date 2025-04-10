"use client"

import { useState } from "react"
import Image from "next/image"

export default function HeroBanner() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const totalSlides = 3

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides)
    }

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
    }

    const goToSlide = (index: number) => {
        setCurrentSlide(index)
    }

    return (
        <div className="relative rounded-lg overflow-hidden shadow-md">
            <div className="relative h-[200px] md:h-[300px] bg-orange-500">
                {currentSlide === 0 && (
                    <div className="absolute inset-0 flex items-center px-8 md:px-16">
                        <div className="flex items-center">
                            <div className="w-1/2">
                                <Image src="/wave-audio.png" alt="Audio wave" width={200} height={80} className="mb-4" />
                                <h2 className="text-white text-2xl md:text-4xl font-bold">A Prefeitura quer ouvir você.</h2>
                            </div>
                            <div className="w-1/2 flex justify-end">
                                <Image
                                    src="/person-listening.png"
                                    alt="Pessoa ouvindo"
                                    width={200}
                                    height={200}
                                    className="rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {currentSlide === 1 && (
                    <div className="absolute inset-0 flex items-center px-8 md:px-16">
                        <div className="text-white">
                            <h2 className="text-2xl md:text-4xl font-bold mb-4">Serviços digitais para você</h2>
                            <p className="text-lg md:text-xl">Acesse os serviços da prefeitura de forma rápida e fácil</p>
                        </div>
                    </div>
                )}

                {currentSlide === 2 && (
                    <div className="absolute inset-0 flex items-center px-8 md:px-16">
                        <div className="text-white">
                            <h2 className="text-2xl md:text-4xl font-bold mb-4">São Paulo para todos</h2>
                            <p className="text-lg md:text-xl">Conheça as iniciativas de inclusão da cidade</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <div className="flex space-x-2">
                    {Array.from({ length: totalSlides }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-3 h-3 rounded-full ${currentSlide === index ? "bg-white" : "bg-white/50"}`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            <div className="absolute inset-y-0 left-2 flex items-center">
                <button
                    onClick={prevSlide}
                    className="bg-white/30 rounded-full p-1 text-white hover:bg-white/50"
                    aria-label="Previous slide"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
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

            <div className="absolute inset-y-0 right-2 flex items-center">
                <button
                    onClick={nextSlide}
                    className="bg-white/30 rounded-full p-1 text-white hover:bg-white/50"
                    aria-label="Next slide"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
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

            <div className="absolute bottom-0 left-0 bg-white/80 px-4 py-1 text-xs">Exibindo: 1 de 3 resultados</div>
        </div>
    )
}

