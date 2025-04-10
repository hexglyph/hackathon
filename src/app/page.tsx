import PrefeituraDigital from "@/features/prefeitura-digital"
import NewsCarousel from "@/features/news-carousel"
import ServicesHighlight from "@/features/services-highlight"
import LatestNews from "@/features/latest-news"
import VideosSection from "@/features/videos-section"
import GeoSampaSection from "@/features/geosampa-section"
import SideMenu from "@/features/side-menu"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        <PrefeituraDigital />

        <div className="flex flex-col md:flex-row gap-6 mt-4">
          <div className="md:w-[180px] flex-shrink-0">
            <SideMenu />
          </div>

          <div className="flex-grow">
            <NewsCarousel />
            <ServicesHighlight />
            <LatestNews />
            <VideosSection />
            <GeoSampaSection />
          </div>
        </div>
      </div>
    </div>
  )
}

