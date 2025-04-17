/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
"use client"

import { useState, useEffect, useRef } from "react"
import { Loader2, MapPin } from "lucide-react"

interface LocationMapProps {
    userLocation: { lat: number; lng: number } | null
    searchQuery: string
    onServiceFound?: (
        service: {
            lat: number
            lng: number
            name: string
            address: string
            distance?: string
        } | null,
    ) => void
}

export default function LocationMap({ userLocation, searchQuery, onServiceFound }: LocationMapProps) {
    const [isMapLoaded, setIsMapLoaded] = useState(false)
    const [mapError, setMapError] = useState<string | null>(null)
    const [nearbyService, setNearbyService] = useState<{
        lat: number
        lng: number
        name: string
        address: string
        distance?: string
    } | null>(null)
    const [isSearching, setIsSearching] = useState(false)
    const mapRef = useRef<google.maps.Map | null>(null)
    const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null)

    // Coordenadas do centro de São Paulo como fallback
    const defaultLocation = { lat: -23.5505, lng: -46.6333 }

    // Usar a localização do usuário ou o padrão se não disponível
    const mapCenter = userLocation || defaultLocation

    // Função para extrair o tipo de serviço da consulta
    const extractServiceType = (query: string): string => {
        // Lista de serviços comuns da prefeitura e suas palavras-chave
        const serviceKeywords = [
            { type: "UBS", keywords: ["ubs", "posto de saúde", "unidade básica", "saúde"] },
            { type: "Escola", keywords: ["escola", "creche", "educação", "ensino", "ceu", "emei", "emef"] },
            { type: "Hospital", keywords: ["hospital", "pronto socorro", "emergência", "ama"] },
            { type: "CRAS", keywords: ["cras", "assistência social"] },
            { type: "Parque", keywords: ["parque", "praça", "área verde", "lazer"] },
            { type: "Biblioteca", keywords: ["biblioteca", "livros", "leitura"] },
            { type: "Subprefeitura", keywords: ["subprefeitura", "prefeitura regional"] },
            { type: "Poupatempo", keywords: ["poupatempo", "documentos"] },
            { type: "Mercado Municipal", keywords: ["mercado municipal", "mercadão", "feira"] },
            { type: "CPTM", keywords: ["cptm", "trem", "estação"] },
            { type: "Metrô", keywords: ["metrô", "metro", "estação"] },
        ]

        // Normalizar a consulta (remover acentos, converter para minúsculas)
        const normalizedQuery = query
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")

        // Verificar se alguma palavra-chave está presente na consulta
        for (const service of serviceKeywords) {
            if (service.keywords.some((keyword) => normalizedQuery.includes(keyword))) {
                return service.type
            }
        }

        // Se nenhum serviço específico for identificado, retornar a consulta original
        // Remover palavras relacionadas a localização para melhorar a busca
        return query.replace(/perto de mim|próximo|próxima|mais perto|perto|na minha região|no meu bairro/gi, "").trim()
    }

    // Função para buscar serviços próximos
    const searchNearbyServices = (map: google.maps.Map, location: google.maps.LatLng) => {
        if (!placesServiceRef.current) return

        setIsSearching(true)

        // Extrair o tipo de serviço da consulta
        const serviceType = extractServiceType(searchQuery)

        // Construir a consulta para o Google Places
        // Adicionar "São Paulo" para melhorar a precisão da busca
        const searchTerm = `${serviceType} São Paulo`

        console.log("Buscando serviço:", searchTerm)

        const request = {
            location: location,
            rankBy: google.maps.places.RankBy.DISTANCE,
            keyword: searchTerm,
        }

        placesServiceRef.current.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
                const nearestPlace = results[0]

                if (nearestPlace.geometry && nearestPlace.geometry.location) {
                    // Calcular a distância entre o usuário e o serviço
                    const userLatLng = new google.maps.LatLng(location.lat(), location.lng())
                    const serviceLatLng = nearestPlace.geometry.location

                    const distance = google.maps.geometry.spherical.computeDistanceBetween(userLatLng, serviceLatLng)
                    const distanceText = distance < 1000 ? `${Math.round(distance)} metros` : `${(distance / 1000).toFixed(1)} km`

                    // Obter detalhes adicionais do local
                    placesServiceRef.current?.getDetails(
                        { placeId: nearestPlace.place_id, fields: ["formatted_address", "name", "geometry"] },
                        (placeResult, detailsStatus) => {
                            if (detailsStatus === google.maps.places.PlacesServiceStatus.OK && placeResult) {
                                const serviceInfo = {
                                    lat: serviceLatLng.lat(),
                                    lng: serviceLatLng.lng(),
                                    name: placeResult.name || nearestPlace.name || serviceType,
                                    address: placeResult.formatted_address || "Endereço não disponível",
                                    distance: distanceText,
                                }

                                setNearbyService(serviceInfo)
                                if (onServiceFound) onServiceFound(serviceInfo)

                                // Adicionar marcador para o serviço
                                const serviceMarker = new google.maps.Marker({
                                    position: serviceLatLng,
                                    map,
                                    icon: {
                                        url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                                    },
                                    title: serviceInfo.name,
                                })

                                // Adicionar janela de informações ao marcador do serviço
                                const infoWindow = new google.maps.InfoWindow({
                                    content: `
                    <div style="padding: 8px; max-width: 200px;">
                      <h3 style="font-weight: bold; margin-bottom: 4px;">${serviceInfo.name}</h3>
                      <p style="font-size: 12px; margin: 0 0 4px 0;">${serviceInfo.address}</p>
                      <p style="font-size: 12px; margin: 0; color: #666;">Distância: ${distanceText}</p>
                    </div>
                  `,
                                })

                                // Abrir a janela de informações ao clicar no marcador
                                serviceMarker.addListener("click", () => {
                                    infoWindow.open(map, serviceMarker)
                                })

                                // Abrir a janela de informações automaticamente
                                infoWindow.open(map, serviceMarker)

                                // Ajustar o zoom para mostrar ambos os pontos
                                const bounds = new google.maps.LatLngBounds()
                                bounds.extend(location)
                                bounds.extend(serviceLatLng)
                                map.fitBounds(bounds)
                            }
                            setIsSearching(false)
                        },
                    )
                } else {
                    setIsSearching(false)
                    if (onServiceFound) onServiceFound(null)
                }
            } else {
                console.log("Nenhum resultado encontrado ou erro:", status)
                setIsSearching(false)
                if (onServiceFound) onServiceFound(null)
            }
        })
    }

    // Carregar o mapa quando o componente montar
    useEffect(() => {
        // Função para inicializar o mapa
        const initializeMap = () => {
            try {
                const mapElement = document.getElementById("google-map")
                if (!mapElement) return

                const map = new window.google.maps.Map(mapElement, {
                    center: mapCenter,
                    zoom: 15,
                    mapTypeControl: false,
                    fullscreenControl: false,
                    streetViewControl: false,
                })

                mapRef.current = map

                // Criar o serviço de Places
                placesServiceRef.current = new google.maps.places.PlacesService(map)

                // Adicionar marcador para a localização do usuário
                if (userLocation) {
                    const userLatLng = new window.google.maps.LatLng(userLocation.lat, userLocation.lng)

                    new window.google.maps.Marker({
                        position: userLocation,
                        map,
                        icon: {
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: "#4285F4",
                            fillOpacity: 1,
                            strokeColor: "#ffffff",
                            strokeWeight: 2,
                        },
                        title: "Sua localização",
                    })

                    // Buscar serviços próximos
                    if (searchQuery) {
                        searchNearbyServices(map, userLatLng)
                    }
                }

                setIsMapLoaded(true)
            } catch (error) {
                console.error("Erro ao inicializar o mapa:", error)
                setMapError("Não foi possível carregar o mapa. Por favor, tente novamente mais tarde.")
            }
        }

        // Verificar se o script do Google Maps já foi carregado
        if (typeof window.google === "object" && window.google.maps) {
            initializeMap()
            return
        }

        // Carregar o script do Google Maps
        const loadGoogleMapsScript = () => {
            const script = document.createElement("script")
            script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBDaeWicvigtP9xPv919E-RNoxfvC-Hqik&libraries=places,geometry&callback=initMap`
            script.async = true
            script.defer = true
            document.head.appendChild(script)

            // Definir a função de callback global
            window.initMap = initializeMap

            script.onerror = () => {
                setMapError("Não foi possível carregar o mapa. Por favor, tente novamente mais tarde.")
            }
        }

        loadGoogleMapsScript()

        // Limpar
        return () => {
            if (window.initMap) {
                delete window.initMap
            }
        }
    }, [userLocation, searchQuery])

    if (mapError) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
                <p>{mapError}</p>
            </div>
        )
    }

    return (
        <div className="rounded-lg overflow-hidden border border-gray-300 relative">
            {(!isMapLoaded || isSearching) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100/80 z-10">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-2" />
                    <p className="text-sm text-gray-700">
                        {isSearching ? "Buscando serviços próximos..." : "Carregando mapa..."}
                    </p>
                </div>
            )}
            <div className="h-[300px] w-full" id="google-map"></div>
            <div className="bg-white p-3 border-t border-gray-200">
                <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-orange-500 mr-2" />
                    <div>
                        <p className="text-sm font-medium">
                            {extractServiceType(searchQuery)}
                            {nearbyService?.distance && ` (${nearbyService.distance})`}
                        </p>
                        {nearbyService ? (
                            <p className="text-xs text-gray-500">{nearbyService.address}</p>
                        ) : (
                            <p className="text-xs text-gray-500">
                                {isSearching ? "Buscando unidades próximas..." : "Nenhuma unidade encontrada próxima à sua localização"}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// Adicionar a declaração global para o TypeScript
declare global {
    interface Window {
        google: any
        initMap: () => void
    }
}
