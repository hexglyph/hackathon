// @ts-nocheck
"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Search, Mic, Loader2, AlertTriangle, Info, EyeOff, Globe, Sparkles, Volume2, StopCircle } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// Corrigir o caminho de importação
import LocationMap from "@/features/location-map"

// Estilos para o gradiente animado
const gradientStyles = `
  @keyframes gradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  .gradient-border::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #e85d04, #e91e63, #e85d04);
    background-size: 200% 200%;
    animation: gradient 3s ease infinite;
    border-radius: 9999px;
    z-index: 0;
  }

  .gradient-border input {
    position: relative;
    z-index: 1;
    background-color: white;
  }

  .gradient-header {
    background: linear-gradient(45deg, #e85d04, #e91e63, #e85d04);
    background-size: 200% 200%;
    animation: gradient 3s ease infinite;
  }
`

export default function PrefeituraDigital() {
    // Adicionar o estilo ao documento
    useEffect(() => {
        const styleElement = document.createElement("style")
        styleElement.innerHTML = gradientStyles
        document.head.appendChild(styleElement)

        return () => {
            document.head.removeChild(styleElement)
        }
    }, [])

    const [query, setQuery] = useState("")
    const [isListening, setIsListening] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [results, setResults] = useState<string | null>(null)
    const [siteResults, setSiteResults] = useState<any[] | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isSiteLoading, setIsSiteLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [siteError, setSiteError] = useState<string | null>(null)
    const [isOutOfScope, setIsOutOfScope] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [isLocationLoading, setIsLocationLoading] = useState(false)
    const [locationError, setLocationError] = useState<string | null>(null)
    const [showMap, setShowMap] = useState(false)
    const [serviceLocation, setServiceLocation] = useState<{
        lat: number
        lng: number
        name: string
        address: string
        distance?: string
    } | null>(null)
    const [isLocationQuery, setIsLocationQuery] = useState(false)

    // Novos estados para a interpretação da consulta
    const [isInterpreting, setIsInterpreting] = useState(false)
    const [interpretedQuery, setInterpretedQuery] = useState<{
        interpretedQuery: string
        keywords: string[]
        serviceType: string
        isLocationQuery: boolean
        originalQuery: string
        language: string
    } | null>(null)

    // Novos estados para gravação de áudio e síntese de voz
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const [isTranscribing, setIsTranscribing] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    // Função para expandir o componente
    const expandComponent = () => {
        setIsExpanded(true)
    }

    // Função para obter a localização do usuário
    const shareLocation = () => {
        if (!navigator.geolocation) {
            setLocationError("Seu navegador não suporta geolocalização.")
            return
        }

        setIsLocationLoading(true)
        setLocationError(null)

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                setUserLocation({ lat: latitude, lng: longitude })
                setIsLocationLoading(false)

                // Se já houver uma consulta interpretada, atualizar a busca com a localização
                if (interpretedQuery) {
                    setShowMap(interpretedQuery.isLocationQuery)
                }
            },
            (error) => {
                console.error("Erro ao obter localização:", error)
                setLocationError(
                    error.code === 1
                        ? "Permissão para acessar sua localização foi negada."
                        : "Não foi possível obter sua localização. Verifique se o GPS está ativado.",
                )
                setIsLocationLoading(false)
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        )
    }

    // Nova função para interpretar a consulta do usuário com IA
    const interpretQuery = async (userQuery: string) => {
        setIsInterpreting(true)

        try {
            const response = await fetch("/api/interpret-query", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query: userQuery }),
            })

            if (!response.ok) {
                throw new Error("Erro ao interpretar consulta")
            }

            const data = await response.json()

            // Adicionar detecção de idioma ao objeto data
            const enhancedData = {
                ...data,
                language: data.language || "pt", // Valor padrão é português
            }

            setInterpretedQuery(enhancedData)

            // Verificar se é uma consulta de localização
            if (enhancedData.isLocationQuery) {
                setIsLocationQuery(true)

                // Se já temos a localização do usuário, mostrar o mapa
                if (userLocation) {
                    setShowMap(true)
                } else {
                    // Se não temos a localização, solicitar
                    shareLocation()
                }
            } else {
                setIsLocationQuery(false)
                setShowMap(false)
            }

            return enhancedData
        } catch (err) {
            console.error("Erro ao interpretar consulta:", err)
            // Em caso de erro, usar a consulta original
            return {
                interpretedQuery: userQuery,
                keywords: [],
                serviceType: "",
                isLocationQuery: false,
                originalQuery: userQuery,
                language: "pt", // Valor padrão é português
            }
        } finally {
            setIsInterpreting(false)
        }
    }

    // Modificar a função handleSearch para usar a interpretação da consulta
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return

        // Garantir que o componente esteja expandido
        setIsExpanded(true)

        // Limpar resultados anteriores
        setResults(null)
        setSiteResults(null)
        setError(null)
        setSiteError(null)

        // Interpretar a consulta do usuário
        const interpreted = await interpretQuery(query)

        // Iniciar ambas as buscas em paralelo com a consulta interpretada
        searchVectorStore(interpreted.interpretedQuery)

        // Para a busca no site, usar uma versão simplificada da consulta
        // Extrair apenas as palavras-chave principais sem aspas
        const siteSearchQuery =
            interpreted.keywords.length > 0 ? interpreted.keywords.slice(0, 3).join(" ") : interpreted.interpretedQuery

        searchSite(siteSearchQuery)
    }

    const searchVectorStore = async (processedQuery: string) => {
        setIsLoading(true)
        setError(null)
        setIsOutOfScope(false)
        setResults(null)

        try {
            const response = await fetch("/api/search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: processedQuery,
                    language: interpretedQuery?.language || "pt", // Enviar o idioma detectado
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Erro ao processar a busca")
            }

            const data = await response.json()

            if (!data.result || data.result.trim() === "") {
                throw new Error("Não foi possível encontrar resultados para sua busca")
            }

            setResults(data.result)
            setIsOutOfScope(data.isOutOfScope || false)
        } catch (err) {
            console.error("Erro na busca do vector store:", err)
            setError(err instanceof Error ? err.message : "Ocorreu um erro ao processar sua busca")
        } finally {
            setIsLoading(false)
        }
    }

    const searchSite = async (processedQuery: string) => {
        setIsSiteLoading(true)
        setSiteError(null)
        setSiteResults(null)

        try {
            // Remover aspas da consulta para melhorar os resultados no portal
            const cleanQuery = processedQuery.replace(/["']/g, "").trim()

            // Usar a consulta limpa para a busca no site
            const searchQuery = cleanQuery || query.replace(/["']/g, "").trim()

            const response = await fetch(`/api/site-search?q=${encodeURIComponent(searchQuery)}`)

            // Log para depuração
            console.log("Status da resposta da API site-search:", response.status)
            console.log("URL da busca:", `/api/site-search?q=${encodeURIComponent(searchQuery)}`)

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Erro ao processar a busca no site")
            }

            const data = await response.json()

            // Log para depuração
            console.log("Dados recebidos da API site-search:", data)

            // Verificar se há resultados
            if (!data.results || data.results.length === 0) {
                setSiteResults([
                    {
                        title: "Nenhum resultado encontrado",
                        url: "#",
                        description: "Tente refinar sua busca ou usar termos diferentes.",
                    },
                ])
            } else {
                setSiteResults(data.results)
            }
        } catch (err) {
            console.error("Erro na busca do site:", err)
            setSiteError(err instanceof Error ? err.message : "Ocorreu um erro ao processar sua busca no site")

            // Mesmo com erro, mostrar uma mensagem amigável como resultado
            setSiteResults([
                {
                    title: "Serviço temporariamente indisponível",
                    url: "https://capital.sp.gov.br",
                    description: "Tente novamente mais tarde ou acesse diretamente o portal da Prefeitura.",
                },
            ])
        } finally {
            setIsSiteLoading(false)
        }
    }

    // Função para iniciar o reconhecimento de voz usando a API Web Speech
    const startListening = () => {
        if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
            setIsListening(true)

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            const recognition = new SpeechRecognition()

            recognition.lang = "pt-BR"
            recognition.continuous = false
            recognition.interimResults = false

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript
                setQuery(transcript)
                setIsListening(false)
            }

            recognition.onerror = () => {
                setIsListening(false)
            }

            recognition.onend = () => {
                setIsListening(false)
            }

            recognition.start()
        } else {
            alert("Seu navegador não suporta reconhecimento de voz.")
            setIsListening(false)
        }
    }

    // Nova função para iniciar a gravação de áudio usando MediaRecorder
    const startRecording = async () => {
        try {
            expandComponent()

            // Solicitar permissão para acessar o microfone
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

            // Criar um novo MediaRecorder
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []

            // Configurar o evento de dados disponíveis
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data)
                }
            }

            // Configurar o evento de parada
            mediaRecorder.onstop = async () => {
                // Criar um blob com os chunks de áudio
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })

                // Transcrever o áudio
                await transcribeAudio(audioBlob)

                // Parar todas as faixas do stream
                stream.getTracks().forEach((track) => track.stop())
            }

            // Iniciar a gravação
            mediaRecorder.start()
            setIsRecording(true)

            // Parar a gravação após 10 segundos se o usuário não parar manualmente
            setTimeout(() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                    stopRecording()
                }
            }, 10000)
        } catch (error) {
            console.error("Erro ao iniciar gravação:", error)
            alert("Não foi possível acessar o microfone. Verifique as permissões do navegador.")
            setIsRecording(false)
        }
    }

    // Função para parar a gravação
    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
        }
    }

    // Função para transcrever o áudio usando a API
    const transcribeAudio = async (audioBlob: Blob) => {
        try {
            setIsTranscribing(true)

            // Criar um FormData para enviar o arquivo
            const formData = new FormData()
            formData.append("audio", audioBlob)

            // Enviar o áudio para a API de transcrição
            const response = await fetch("/api/transcribe", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                throw new Error("Erro ao transcrever áudio")
            }

            const data = await response.json()

            // Definir o texto transcrito como consulta
            if (data.text) {
                setQuery(data.text)
            }
        } catch (error) {
            console.error("Erro ao transcrever áudio:", error)
            alert("Não foi possível transcrever o áudio. Por favor, tente novamente.")
        } finally {
            setIsTranscribing(false)
        }
    }

    // Função para converter texto em fala
    const speakText = async (text: string) => {
        try {
            // Parar qualquer áudio em reprodução
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current = null
            }

            setIsSpeaking(true)

            // Limpar o texto de marcações markdown e links
            const cleanText = text
                .replace(/\*\*(.*?)\*\*/g, "$1") // Remover negrito
                .replace(/\[(.*?)\]$$.*?$$/g, "$1") // Remover links
                .replace(/#{1,6}\s(.*?)(\n|$)/g, "$1. ") // Converter cabeçalhos em texto normal

            // Enviar o texto para a API de síntese de voz
            const response = await fetch("/api/text-to-speech", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    text: cleanText,
                    voice: "alloy", // Voz padrão
                }),
            })

            if (!response.ok) {
                throw new Error("Erro ao sintetizar voz")
            }

            // Criar um blob com a resposta
            const audioBlob = await response.blob()
            const audioUrl = URL.createObjectURL(audioBlob)

            // Criar um elemento de áudio e reproduzir
            const audio = new Audio(audioUrl)
            audioRef.current = audio

            // Configurar eventos
            audio.onended = () => {
                setIsSpeaking(false)
                URL.revokeObjectURL(audioUrl)
            }

            audio.onerror = () => {
                setIsSpeaking(false)
                URL.revokeObjectURL(audioUrl)
            }

            // Reproduzir o áudio
            await audio.play()
        } catch (error) {
            console.error("Erro ao sintetizar voz:", error)
            setIsSpeaking(false)
            alert("Não foi possível reproduzir o texto. Por favor, tente novamente.")
        }
    }

    // Função para parar a reprodução de áudio
    const stopSpeaking = () => {
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current = null
            setIsSpeaking(false)
        }
    }

    // Função para renderizar um link como botão
    const renderButton = (props, children, type) => {
        if (type === "normal") {
            return (
                <a
                    {...props}
                    className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-3 rounded text-sm no-underline transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Info className="w-4 h-4 mr-1" />
                    Solicitar serviço
                </a>
            )
        } else if (type === "anonimo") {
            return (
                <a
                    {...props}
                    className="inline-flex items-center bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-3 rounded text-sm no-underline transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <EyeOff className="w-4 h-4 mr-1" />
                    Solicitar anonimamente
                </a>
            )
        }

        return (
            <a
                {...props}
                className="text-orange-600 hover:underline"
                target={props.href?.startsWith("http") ? "_blank" : undefined}
                rel={props.href?.startsWith("http") ? "noopener noreferrer" : undefined}
            >
                {children}
            </a>
        )
    }

    // Função para dividir o resultado em serviços individuais
    const splitResultsIntoServices = (markdown) => {
        if (!markdown) return []

        // Dividir por separador de serviços (---)
        const services = markdown
            .split("---")
            .map((service) => service.trim())
            .filter(Boolean)

        return services
    }

    // Renderizar os resultados como cards
    const renderResultsAsCards = () => {
        if (!results) return null

        const services = splitResultsIntoServices(results)

        return (
            <div className="space-y-6">
                {services.map((serviceMarkdown, index) => (
                    <Card key={index} className="overflow-hidden">
                        <CardContent className="p-0">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <div></div> {/* Espaço vazio para alinhamento */}
                                    <button
                                        onClick={() => speakText(serviceMarkdown)}
                                        disabled={isSpeaking}
                                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
                                        aria-label="Ouvir texto"
                                    >
                                        {isSpeaking ? (
                                            <StopCircle className="w-4 h-4" onClick={stopSpeaking} />
                                        ) : (
                                            <Volume2 className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                <ReactMarkdown
                                    components={{
                                        a: ({ node, children, ...props }) => {
                                            // Verificar qual tipo de botão é baseado no texto do link
                                            const linkText = String(children).trim()

                                            if (linkText === "SOLICITAR_NORMAL") {
                                                return renderButton(props, children, "normal")
                                            } else if (linkText === "SOLICITAR_ANONIMO") {
                                                return renderButton(props, children, "anonimo")
                                            } else if (props.href && props.href.includes("action=solicitar")) {
                                                return renderButton(props, children, "normal")
                                            } else if (props.href && props.href.includes("anonimo=true")) {
                                                return renderButton(props, children, "anonimo")
                                            }

                                            return renderButton(props, children, "link")
                                        },
                                        h3: ({ node, children, ...props }) => (
                                            <CardHeader className="p-0 pb-4">
                                                <CardTitle {...props} className="text-xl font-bold">
                                                    {children}
                                                </CardTitle>
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {/* Os botões serão inseridos aqui pelo componente 'a' */}
                                                </div>
                                            </CardHeader>
                                        ),
                                    }}
                                >
                                    {serviceMarkdown}
                                </ReactMarkdown>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    // Renderizar os resultados do site
    const renderSiteResults = () => {
        if (!siteResults) return null

        return (
            <div className="space-y-2">
                {siteResults.map((result, index) => (
                    <a
                        key={index}
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block hover:bg-gray-100 transition-colors rounded-md overflow-hidden"
                    >
                        <div className="p-3 flex items-center max-h-[48px]">
                            <div className="flex-1 overflow-hidden">
                                <h3 className="font-medium text-sm text-orange-600 truncate">{result.title}</h3>
                                <p className="text-xs text-gray-500 truncate">{result.description}</p>
                            </div>
                            <Globe className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                        </div>
                    </a>
                ))}
            </div>
        )
    }

    // Renderizar informações sobre a interpretação da consulta
    const renderQueryInterpretation = () => {
        if (!interpretedQuery) return null

        return (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-start">
                    <Sparkles className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-blue-700">Interpretação da IA</p>
                        <p className="text-xs text-blue-600 mt-1">
                            Identificamos que você está buscando:{" "}
                            <span className="font-medium">{interpretedQuery.serviceType || "Serviço da Prefeitura"}</span>
                            {interpretedQuery.language !== "pt" && (
                                <span className="ml-2 font-medium">
                                    (Idioma detectado: {interpretedQuery.language === "en" ? "Inglês" : interpretedQuery.language})
                                </span>
                            )}
                        </p>
                        {interpretedQuery.keywords.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                                {interpretedQuery.keywords.map((keyword, index) => (
                                    <span key={index} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // Modificar o JSX de retorno para implementar a expansão/contração
    return (
        <div
            className={`bg-orange-500 shadow-md overflow-hidden transition-all duration-100 ease-in-out ${isExpanded ? "bg-white max-h-[2000px] rounded-lg" : "max-h-[160px] gradient-header rounded-[2rem]"
                }`}
        >
            <div
                className={`text-white transition-all duration-300 ${isExpanded ? "py-6 px-6 bg-orange-500" : "py-3 px-4 flex justify-center"
                    }`}
            >
                <h2
                    className={`font-bold transition-all duration-300 ${isExpanded ? "text-2xl md:text-3xl" : "text-lg md:text-xl"
                        }`}
                >
                    Prefeitura IA
                </h2>
                {isExpanded && (
                    <p className="text-lg transition-opacity duration-300 opacity-100">
                        Encontre rapidamente os serviços da Prefeitura de São Paulo.
                    </p>
                )}
            </div>

            <div className={`transition-all duration-300 ${isExpanded ? "p-6" : "px-4 py-3"}`}>
                <form onSubmit={handleSearch} className={`${isExpanded ? "mb-6" : "mb-0"}`}>
                    <div className={`relative ${!isExpanded ? "gradient-border" : ""}`}>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={expandComponent}
                            onClick={expandComponent}
                            placeholder="O que você está procurando? Ex: poda de árvore, IPTU, calçada quebrada"
                            className={`w-full bg-white ${isExpanded
                                ? "p-4 pr-24 border-gray-300 rounded-lg"
                                : "py-3 pr-24 pl-4 border-transparent rounded-full text-sm"
                                } border focus:outline-none focus:ring-2 focus:ring-orange-500`}
                            maxLength={500}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-2 z-50">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault()
                                    expandComponent()
                                    isRecording ? stopRecording() : startRecording()
                                }}
                                disabled={isLoading || isSiteLoading || isInterpreting || isTranscribing}
                                className={`p-2 rounded-full ${isRecording || isTranscribing
                                    ? "bg-red-500 text-white"
                                    : "bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                                    }`}
                                aria-label="Gravar áudio"
                            >
                                {isTranscribing ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : isRecording ? (
                                    <StopCircle className="w-5 h-5" />
                                ) : (
                                    <Mic className="w-5 h-5" />
                                )}
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || isSiteLoading || isInterpreting || isTranscribing || !query.trim()}
                                className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 disabled:opacity-50"
                                aria-label="Buscar"
                            >
                                {isLoading || isSiteLoading || isInterpreting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Search className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                    {isExpanded && (
                        <div className="mt-2 text-xs text-gray-500 flex items-center">
                            <Info className="w-3 h-3 mr-1" />
                            Descreva o serviço que você precisa em linguagem simples ou use o microfone para falar
                        </div>
                    )}
                </form>

                {/* Mostrar informações sobre a interpretação da consulta */}
                {isExpanded &&
                    interpretedQuery &&
                    !isInterpreting &&
                    !isLoading &&
                    !isSiteLoading &&
                    renderQueryInterpretation()}

                {/* Exibir o mapa quando necessário */}
                {isExpanded && showMap && (
                    <div className="mb-6 mt-4">
                        <LocationMap
                            userLocation={userLocation}
                            searchQuery={interpretedQuery?.serviceType || query}
                            onServiceFound={(service) => setServiceLocation(service)}
                        />
                        {locationError && (
                            <div className="mt-2 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                <p>{locationError}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Se houver um erro de localização mas não estamos mostrando o mapa, exibir uma mensagem */}
                {isExpanded && locationError && !showMap && (
                    <div className="mb-6 mt-2 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                        <p>{locationError}</p>
                    </div>
                )}

                {/* Só mostrar o conteúdo abaixo se estiver expandido */}
                {isExpanded && (
                    <>
                        {(isLoading || isSiteLoading || isInterpreting || isTranscribing) && (
                            <div className="flex flex-col justify-center items-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-2" />
                                <p className="text-gray-600">
                                    {isTranscribing
                                        ? "Transcrevendo áudio..."
                                        : isInterpreting
                                            ? "Interpretando sua consulta..."
                                            : "Buscando informações..."}
                                </p>
                            </div>
                        )}

                        {(results || siteResults) && !isLoading && !isSiteLoading && !isInterpreting && !isTranscribing && (
                            <div className="space-y-6">
                                {/* Primeiro mostrar os resultados da Vector Store */}
                                {results && !error && (
                                    <div
                                        className={`p-4 rounded-lg ${isOutOfScope ? "bg-yellow-50 border border-yellow-200" : "bg-gray-50"}`}
                                    >
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-bold text-lg">Serviços Encontrados</h3>
                                            {results && (
                                                <button
                                                    onClick={() => speakText(results)}
                                                    disabled={isSpeaking}
                                                    className="p-2 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-700 flex items-center"
                                                    aria-label="Ouvir todos os resultados"
                                                >
                                                    {isSpeaking ? (
                                                        <>
                                                            <StopCircle className="w-4 h-4 mr-1" />
                                                            <span className="text-xs">Parar</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Volume2 className="w-4 h-4 mr-1" />
                                                            <span className="text-xs">Ouvir</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>

                                        {renderResultsAsCards()}

                                        <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-500">
                                            {isOutOfScope ? (
                                                <div className="flex items-start">
                                                    <Info className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                                                    <p>Para outros assuntos, ligue para o SP156.</p>
                                                </div>
                                            ) : (
                                                <p className="flex items-center">
                                                    <Info className="w-4 h-4 mr-2 flex-shrink-0" />
                                                    Para mais informações, ligue 156 ou acesse o portal da Prefeitura.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Depois mostrar os resultados do site */}
                                {siteResults && !siteError && (
                                    <div className="p-4 rounded-lg bg-gray-50">
                                        <h3 className="font-bold text-lg mb-2">Resultados do Portal da Prefeitura</h3>

                                        {renderSiteResults()}

                                        <div className="mt-4 pt-2 border-t border-gray-200 text-xs text-gray-500">
                                            <p className="flex items-center">
                                                <Info className="w-3 h-3 mr-1 flex-shrink-0" />
                                                Resultados do portal oficial da Prefeitura de São Paulo
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Mostrar erros se houver */}
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                                        <div className="flex items-start">
                                            <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <h3 className="font-bold text-lg mb-2">Erro</h3>
                                                <p>{error}</p>
                                                <p className="mt-2 text-sm">
                                                    Por favor, tente novamente com termos diferentes ou mais específicos.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {siteError && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                                        <div className="flex items-start">
                                            <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <h3 className="font-bold text-lg mb-2">Erro</h3>
                                                <p>{siteError}</p>
                                                <p className="mt-2 text-sm">
                                                    Por favor, tente novamente com termos diferentes ou mais específicos.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {!results &&
                            !siteResults &&
                            !isLoading &&
                            !isSiteLoading &&
                            !isInterpreting &&
                            !isTranscribing &&
                            !error &&
                            !siteError && (
                                <div className="text-center py-8 text-gray-500">
                                    <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>Digite sua dúvida ou use o microfone para buscar serviços da Prefeitura.</p>
                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl mx-auto text-left">
                                        <div className="bg-gray-50 p-3 rounded-md">
                                            <p className="font-medium text-sm">Exemplos de buscas:</p>
                                            <ul className="text-xs mt-1 space-y-1">
                                                <li>• Árvore precisa de poda</li>
                                                <li>• Segunda via do IPTU</li>
                                                <li>• Calçada quebrada</li>
                                            </ul>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-md">
                                            <p className="font-medium text-sm">Serviços populares:</p>
                                            <ul className="text-xs mt-1 space-y-1">
                                                <li>• Poda de árvores</li>
                                                <li>• Reparos em vias públicas</li>
                                                <li>• Matrícula escolar</li>
                                                <li>• Bilhete Único</li>
                                            </ul>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-md">
                                            <p className="font-medium text-sm">Experimente falar:</p>
                                            <ul className="text-xs mt-1 space-y-1">
                                                <li>• "Preciso podar uma árvore na minha rua"</li>
                                                <li>• "Como faço para pagar o IPTU?"</li>
                                                <li>• "Where can I find information about public transportation?"</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                    </>
                )}
            </div>
        </div>
    )
}
