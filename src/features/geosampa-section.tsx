import Link from "next/link"
import Image from "next/image"

export default function GeoSampaSection() {
    return (
        <div className="hidden md:block mt-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="section-title text-xl">GEOSAMPA</h2>
            </div>

            <Link href="/geosampa" className="block">
                <div className="bg-sky-500 rounded-md overflow-hidden shadow-sm">
                    <div className="h-[200px] relative">
                        <Image
                            src="/geosampa-map.jpg"
                            alt="GeoSampa - Mapa Digital da Cidade de São Paulo"
                            fill
                            className="object-cover hidden"
                        />
                    </div>
                </div>
            </Link>
        </div>
    )
}

