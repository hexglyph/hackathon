import Link from "next/link"
import Image from "next/image"

export default function VideosSection() {
    const videos = [
        {
            id: 1,
            title: "Descomplica SP",
            thumbnail: "/video-thumbnail-1.jpg",
            link: "/videos/descomplica-sp",
        },
        {
            id: 2,
            title: "SÃO PAULO É ACARAJADO",
            thumbnail: "/video-thumbnail-2.jpg",
            link: "/videos/sao-paulo-acarajado",
        },
    ]

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="section-title text-xl">VIDEOS</h2>
                <Link href="/videos" className="text-sm text-orange-600 hover:underline flex items-center">
                    More Videos
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videos.map((video) => (
                    <Link key={video.id} href={video.link} className="block">
                        <div className="relative bg-black rounded-md overflow-hidden">
                            <div className="relative h-[200px]">
                                <Image
                                    src={video.thumbnail || "/placeholder.svg?height=200&width=400"}
                                    alt={video.title}
                                    fill
                                    className="object-cover opacity-80"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-red-600 rounded-full p-3">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="white"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                        </svg>
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                    <h3 className="text-white font-medium">{video.title}</h3>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
