/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-expressions */
// @ts-nocheck
"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
// Adicionar os imports para os ícones de avaliação
import {
    Search,
    Mic,
    Loader2,
    AlertTriangle,
    Info,
    EyeOff,
    Globe,
    Sparkles,
    Volume2,
    StopCircle,
    ThumbsUp,
    ThumbsDown,
    MapPin,
    HelpCircle
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// Corrigir o caminho de importação
import LocationMap from "@/features/location-map"
import { speechToText, textToSpeech } from "@/lib/speech-service"
import HelpModal from "@/components/help-modal"

export default function PrefeituraDigital() {
    // Adicionar o estilo ao documento
    useEffect(() => {
        const styleElement = document.createElement("style")
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
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)

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

    // Novos estados para síntese de voz
    const [isSpeaking, setIsSpeaking] = useState(false)

    // Adicionar estados para controlar a avaliação
    const [feedbackGiven, setFeedbackGiven] = useState(false)
    const [feedbackType, setFeedbackType] = useState<"positive" | "negative" | null>(null)
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

    // Referência para o formulário
    const formRef = useRef<HTMLFormElement>(null)

    // Inicializar os serviços de fala
    useEffect(() => {
        // Configurar callbacks para o serviço de reconhecimento de fala
        speechToText.setCallbacks(
            // Callback para texto intermediário
            (text) => {
                console.log("Texto intermediário: ", text)
                setQuery(text)
            },
            // Callback para erros
            (error) => {
                console.error("Erro no reconhecimento de fala:", error)
                setIsRecording(false)
            },
            // Callback para resultado final
            (finalText) => {
                console.log("Texto final: ", finalText)
                setQuery(finalText)
                setIsRecording(false)
            },
            // Novo callback para busca automática
            (searchText) => {
                console.log("Executando busca automática com: ", searchText)
                // Executar a busca automaticamente após o reconhecimento
                if (searchText.trim() && formRef.current) {
                    // Simular o envio do formulário
                    formRef.current.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
                }
            },
        )

        // Configurar callbacks para o serviço de síntese de fala
        textToSpeech.setCallbacks(
            // Callback para estado de reprodução
            (isPlaying) => {
                setIsSpeaking(isPlaying)
            },
            // Callback para erros
            (error) => {
                console.error("Erro na síntese de fala:", error)
                setIsSpeaking(false)
            },
        )
    }, [])

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
                /*if (userLocation) {
                    setShowMap(true)
                } else {
                    // Se não temos a localização, solicitar
                    shareLocation()
                }*/
                setShowMap(false)
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

        console.log("Executando busca com: ", query)

        // Garantir que o componente esteja expandido
        setIsExpanded(true)

        // Limpar resultados anteriores
        setResults(null)
        setSiteResults(null)
        setError(null)
        setSiteError(null)
        setFeedbackGiven(false)
        setFeedbackType(null)
        setFeedbackMessage(null)

        // Interpretar a consulta do usuário
        const interpreted = await interpretQuery(query)

        // Iniciar ambas as buscas em paralelo com a consulta interpretada
        searchVectorStore(interpreted.interpretedQuery, interpreted.language)

        // Para a busca no site, usar uma versão simplificada da consulta
        // Extrair apenas as palavras-chave principais sem aspas
        const siteSearchQuery =
            interpreted.keywords.length > 0 ? interpreted.keywords.slice(0, 3).join(" ") : interpreted.interpretedQuery

        if (interpreted.language !== "pt") {
            translateQueryToPortuguese(siteSearchQuery).then((translatedQuery) => {
                searchSite(translatedQuery)
            })
        } else {
            searchSite(siteSearchQuery)
        }
    }

    const searchVectorStore = async (processedQuery: string, detectedLanguage = "pt") => {
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
                    language: detectedLanguage || "pt", // Enviar o idioma detectado
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

    const translateQueryToPortuguese = async (query: string): Promise<string> => {
        try {
            const response = await fetch("/api/translate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    text: query,
                    targetLanguage: "pt", // Traduzir para português
                }),
            })

            if (!response.ok) {
                throw new Error("Erro ao traduzir consulta")
            }

            const data = await response.json()
            console.log("Consulta traduzida para português:", data.translatedText)
            return data.translatedText || query // Retornar o texto traduzido ou o original em caso de falha
        } catch (err) {
            console.error("Erro ao traduzir consulta:", err)
            return query // Em caso de erro, retornar a consulta original
        }
    }

    // Função para iniciar o reconhecimento de fala usando o Azure Speech
    const startRecording = async () => {
        expandComponent()
        setIsRecording(true)

        console.log("Iniciando gravação...")
        const success = await speechToText.startRecognition()

        if (!success) {
            console.error("Falha ao iniciar reconhecimento")
            setIsRecording(false)
        }
    }

    // Função para parar o reconhecimento de fala
    const stopRecording = () => {
        console.log("Parando gravação...")
        speechToText.stopRecognition()
        setIsRecording(false)
    }

    // Função para converter texto em fala usando o Azure Speech
    const speakText = async (text: string) => {
        // Limpar o texto de marcações markdown e links
        const cleanText = text
            .replace(/\*\*(.*?)\*\*/g, "$1") // Remover negrito
            .replace(/\[(.*?)\]$.*?$/g, "$1") // Remover links
            .replace(/#{1,6}\s(.*?)(\n|$)/g, "$1. ") // Converter cabeçalhos em texto normal
            .replace(/\[SOLICITAR_NORMAL\].*?$/gm, "") // Remover marcadores especiais
            .replace(/\[SOLICITAR_ANONIMO\].*?$/gm, "") // Remover marcadores especiais

        // Selecionar a voz com base no idioma detectado
        const voiceName =
            interpretedQuery?.language === "en"
                ? "en-US-JennyNeural"
                : interpretedQuery?.language === "es"
                    ? "es-ES-ElviraNeural"
                    : "pt-BR-AntonioNeural"

        await textToSpeech.speak(cleanText, voiceName)
    }

    // Função para parar a reprodução de áudio
    const stopSpeaking = () => {
        textToSpeech.stop()
    }

    // Função para renderizar um link como botão
    const renderButton = (props, children, type) => {
        if (type === "normal") {
            return (
                <a
                    {...props}
                    className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-3 mb-2 rounded-md text-sm no-underline transition-colors"
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
                    className="inline-flex items-center bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-3 mb-2 rounded-md text-sm no-underline transition-colors"
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
                className="text-orange-600 my-2 hover:underline"
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

    // Modificar a função renderResultsAsCards para implementar a divisão em 2 blocos no desktop
    // Substituir a função renderResultsAsCards existente com esta versão:

    const renderResultsAsCards = () => {
        if (!results) return null

        const services = splitResultsIntoServices(results)

        return (
            <div className="space-y-6">
                {services.map((serviceMarkdown, index) => (
                    <Card key={index} className="overflow-hidden">
                        <CardContent className="p-0">
                            <div className="p-4 md:p-5 leading-6">
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
                                            <CardHeader className="p-0 pb-3">
                                                <CardTitle {...props} className="text-lg font-bold">
                                                    {children}
                                                </CardTitle>
                                                <div className="flex flex-wrap gap-2 mt-2">
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

    // Modificar a função renderSiteResults para otimizar o espaço
    // Substituir a função renderSiteResults existente com esta versão:

    const renderSiteResults = () => {
        if (!siteResults) return null

        return (
            <div className="space-y-1">
                {siteResults.map((result, index) => (
                    <a
                        key={index}
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block hover:bg-gray-100 transition-colors rounded-md overflow-hidden"
                    >
                        <div className="p-2 flex items-center">
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

        const getLanguageName = (code) => {
            const languages = {
                pt: "Português",
                en: "Inglês",
                es: "Espanhol",
                fr: "Francês",
                it: "Italiano",
                de: "Alemão",
                ja: "Japonês",
                zh: "Chinês",
                ru: "Russo",
                ar: "Árabe",
            }
            return languages[code] || code
        }

        return (
            <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                <div className="flex items-start">
                    <Sparkles className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-blue-700">Interpretação da IA</p>
                        <p className="text-xs text-blue-600 mt-1">
                            Identificamos que você está buscando:{" "}
                            <span className="font-medium">{interpretedQuery.serviceType || "Serviço da Prefeitura"}</span>
                            {interpretedQuery.language !== "pt" && (
                                <span className="ml-2 font-medium">
                                    (Idioma detectado: {getLanguageName(interpretedQuery.language)})
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

    const renderLocationInfo = () => {
        if (!isLocationQuery || !interpretedQuery) return null

        return (
            <div className="mb-6 mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-blue-700">Informações de Localização</p>
                        <p className="text-xs text-blue-600 mt-1">
                            Para obter o endereço exato do {interpretedQuery.serviceType || "serviço"} mais próximo, você pode ligar
                            para o SP156 ou consultar o site oficial da Prefeitura.
                        </p>
                        <p className="text-xs text-blue-600 mt-2">
                            Ative o GPS do seu dispositivo para ver no mapa a unidade mais próxima.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // Modificar a seção que exibe os resultados para incluir os botões de avaliação
    // Adicionar função para lidar com o feedback
    const handleFeedback = useCallback(
        (type: "positive" | "negative") => {
            setFeedbackType(type)
            setFeedbackGiven(true)
            setFeedbackMessage(
                type === "positive"
                    ? "Obrigado pelo feedback positivo!"
                    : "Agradecemos seu feedback. Vamos trabalhar para melhorar.",
            )

            // Aqui você poderia enviar o feedback para uma API
            console.log(`Feedback ${type} para a consulta: "${query}"`)
        },
        [query],
    )

    // Modificar o JSX de retorno para implementar a expansão/contração
    return (
        <div
            className={`bg-secondary mb-10 shadow-md overflow-hidden transition-all duration-100 ease-in-out ${isExpanded ? "bg-white max-h-[5000px] rounded-md" : "max-h-[160px] rounded-md"
                }`}
        >
            <div
                className={`text-white transition-all duration-300 ${isExpanded ? "py-6 px-6 bg-secondary" : "py-3 px-4 flex justify-center"
                    }`}
            >
                <div className="flex items-center gap-2">
                    <h2
                        className={`font-bold transition-all duration-300 ${isExpanded ? "text-2xl md:text-3xl" : "text-lg md:text-xl"
                            }`}
                    >
                        Portal IA
                    </h2>
                    <button
                        onClick={() => setIsHelpModalOpen(true)}
                        className="p-1 rounded-full bg-white/30 hover:bg-white/50 text-white transition-colors"
                        aria-label="Informações sobre o Portal IA"
                    >
                        <HelpCircle className="w-5 h-5" />
                    </button>
                </div>
                {isExpanded && (
                    <p className="text-lg transition-opacity duration-300 opacity-100">
                        Encontre rapidamente os serviços da Prefeitura de São Paulo.
                    </p>
                )}

                <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
            </div>

            <div className={`transition-all duration-300 ${isExpanded ? "p-6 border-b border-r border-l border-secondary rounded-b-md shadow-lg shadow-secondary" : "px-4 py-3"}`}>
                <form ref={formRef} onSubmit={handleSearch} className={`${isExpanded ? "mb-6 bg-transparent" : "mb-0"}`}>
                    <div className={`relative ${!isExpanded ? "" : ""}`}>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={expandComponent}
                            onClick={expandComponent}
                            placeholder="Descreva o que você está procurando - Exemplo: poda de árvore, IPTU, calçada quebrada, onde tem uma UBS perto de mim"
                            className={`w-full h-16 bg-white placeholder:text-foreground/50 ${isExpanded
                                ? "p-4 pr-24 border-gray-300 rounded-md"
                                : "py-3 pr-24 pl-4 border-transparent rounded-md text-sm"
                                } border focus:outline-none focus:ring-2 focus:ring-secondary`}
                            maxLength={500}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-4 z-50">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault()
                                    expandComponent()
                                    isRecording ? stopRecording() : startRecording()
                                }}
                                disabled={isLoading || isSiteLoading || isInterpreting}
                                className={`hover:cursor-pointer p-2 rounded-md ${isRecording ? "bg-red-500 text-white" : "bg-gray-200 hover:bg-gray-200 disabled:opacity-50"
                                    }`}
                                aria-label="Gravar áudio"
                            >
                                {isRecording ? <StopCircle className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || isSiteLoading || isInterpreting || !query.trim()}
                                className="bg-secondary text-white p-2 rounded-md hover:bg-secondary disabled:opacity-50 hover:cursor-pointer disabled:hover:cursor-not-allowed"
                                aria-label="Buscar"
                            >
                                {isLoading || isSiteLoading || isInterpreting ? (
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                ) : (
                                    <Search className="w-8 h-8" />
                                )}
                            </button>
                        </div>
                    </div>
                    {isExpanded && (
                        <div className="mt-2 text-sm text-gray-600 flex items-center">
                            <Info className="w-4 h-4 mr-1" />
                            Descreva o serviço que você precisa em linguagem simples, em qualquer idioma, ou use o microfone para falar
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

                {isExpanded &&
                    isLocationQuery &&
                    !showMap &&
                    renderLocationInfo()}

                {/* Exibir o mapa quando necessário */}
                {isExpanded && showMap && (
                    <div className="mb-6 mt-4">
                        <LocationMap
                            userLocation={userLocation}
                            searchQuery={interpretedQuery?.serviceType || query}
                            onServiceFound={(service) => setServiceLocation(service)}
                        />
                        {locationError && (
                            <div className="mt-2 bg-red-50 text-red-600 p-3 rounded-md text-sm">
                                <p>{locationError}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Se houver um erro de localização mas não estamos mostrando o mapa, exibir uma mensagem */}
                {isExpanded && locationError && !showMap && (
                    <div className="mb-6 mt-2 bg-red-50 text-red-600 p-3 rounded-md text-sm">
                        <p>{locationError}</p>
                    </div>
                )}

                {/* Só mostrar o conteúdo abaixo se estiver expandido */}
                {isExpanded && (
                    <>
                        {(isLoading || isSiteLoading || isInterpreting) && (
                            <div className="flex flex-col justify-center items-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-2" />
                                <p className="text-gray-600">
                                    {isInterpreting ? "Interpretando sua consulta..." : "Buscando informações..."}
                                </p>
                            </div>
                        )}

                        {(results || siteResults) && !isLoading && !isSiteLoading && !isInterpreting && (
                            <div className="space-y-6">
                                {/* Seção de feedback */}
                                {!feedbackGiven ? (
                                    <div key="top-feedback-buttons" className="p-2 bg-gray-50 rounded-md">
                                        <p className="text-sm text-center mb-2">Esta resposta foi útil?</p>
                                        <div className="flex justify-center gap-4">
                                            <button
                                                onClick={() => handleFeedback("positive")}
                                                className="flex items-center text-sm gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-full transition-colors"
                                            >
                                                <ThumbsUp className="w-4 h-4" />
                                                <span>Sim, foi útil</span>
                                            </button>
                                            <button
                                                onClick={() => handleFeedback("negative")}
                                                className="flex items-center text-sm gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-full transition-colors"
                                            >
                                                <ThumbsDown className="w-4 h-4" />
                                                <span>Não foi útil</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        key="feedback-message"
                                        className={`p-4 rounded-md text-center ${feedbackType === "positive" ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"
                                            }`}
                                    >
                                        <p>{feedbackMessage}</p>
                                        {feedbackType === "negative" && (
                                            <p className="text-sm mt-2">Sua opinião nos ajuda a melhorar o serviço.</p>
                                        )}
                                    </div>
                                )}
                                <div className="md:flex md:gap-6 text-sm">
                                    {/* Coluna de resultados da Vector Store */}
                                    {results && !error && (
                                        <div
                                            key="vector-results"
                                            className={`p-4 rounded-md ${isOutOfScope ? "bg-yellow-50 border border-yellow-200" : "bg-gray-50"} md:w-2/3`}
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

                                            <div className="mt-4 pt-3 border-t border-gray-200 text-sm text-gray-500">
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

                                    {/* Coluna de resultados do site */}
                                    {siteResults && !siteError && (
                                        <div key="site-results" className="p-4 rounded-md bg-gray-50 md:w-1/3">
                                            <h3 className="font-bold text-lg mb-2">Resultados do Portal</h3>

                                            {renderSiteResults()}

                                            <div className="mt-3 pt-2 border-t border-gray-200 text-xs text-gray-500">
                                                <p className="flex items-center">
                                                    <Info className="w-3 h-3 mr-1 flex-shrink-0" />
                                                    Resultados do portal oficial da Prefeitura
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Seção de feedback */}
                                {!feedbackGiven ? (
                                    <div key="feedback-buttons" className="p-4 bg-gray-50 rounded-md">
                                        <p className="text-sm text-center mb-3">Esta resposta foi útil?</p>
                                        <div className="flex justify-center gap-4">
                                            <button
                                                onClick={() => handleFeedback("positive")}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-full transition-colors"
                                            >
                                                <ThumbsUp className="w-5 h-5" />
                                                <span>Sim, foi útil</span>
                                            </button>
                                            <button
                                                onClick={() => handleFeedback("negative")}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-full transition-colors"
                                            >
                                                <ThumbsDown className="w-5 h-5" />
                                                <span>Não foi útil</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        key="feedback-message"
                                        className={`p-4 rounded-md text-center ${feedbackType === "positive" ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"
                                            }`}
                                    >
                                        <p>{feedbackMessage}</p>
                                        {feedbackType === "negative" && (
                                            <p className="text-sm mt-2">Sua opinião nos ajuda a melhorar o serviço.</p>
                                        )}
                                    </div>
                                )}

                                {/* Mostrar erros se houver */}
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
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
                                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
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

                        {!results && !siteResults && !isLoading && !isSiteLoading && !isInterpreting && !error && !siteError && (
                            <div className="text-center py-8 text-gray-500">
                                <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>Digite sua dúvida ou use o microfone para buscar serviços e informações da Prefeitura de São Paulo.</p>
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
                                            <li>• Descomplica</li>
                                            <li>• Reparos em vias públicas</li>
                                            <li>• Matrícula escolar</li>
                                            <li>• Bilhete Único</li>
                                        </ul>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-md">
                                        <p className="font-medium text-sm">Experimente escrever:</p>
                                        <ul className="text-xs mt-1 space-y-1">
                                            <li>• Preciso podar uma árvore na minha rua</li>
                                            <li>• Como faço para pagar o IPTU?</li>
                                            <li>• Where can I find information about public transportation?</li>
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
