"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Loader2, Check, AlertTriangle, Download, Upload, Trash } from "lucide-react"

export default function ServicesProcessorAPI() {
    const [services, setServices] = useState<any[]>([])
    const [processedServices, setProcessedServices] = useState<any[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [totalItems, setTotalItems] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string)
                setServices(json)
                setTotalItems(json.length)
                setSuccess(`Arquivo carregado com sucesso. ${json.length} serviços encontrados.`)
                setError(null)
            } catch (err) {
                setError("Erro ao processar o arquivo JSON. Verifique se o formato está correto.")
                console.error(err)
            }
        }
        reader.onerror = () => {
            setError("Erro ao ler o arquivo.")
        }
        reader.readAsText(file)
    }

    const processServices = async () => {
        if (services.length === 0) {
            setError("Nenhum serviço para processar. Faça upload do arquivo JSON primeiro.")
            return
        }

        setIsProcessing(true)
        setError(null)
        setSuccess(null)
        setCurrentIndex(0)

        const processed: any[] = []

        for (let i = 0; i < services.length; i++) {
            setCurrentIndex(i + 1)

            try {
                // Chamar a API para processar o serviço
                const response = await fetch("/api/process-services", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ service: services[i] }),
                })

                if (!response.ok) {
                    throw new Error(`Erro ao processar serviço: ${response.statusText}`)
                }

                const result = await response.json()

                // Se o serviço não foi pulado, adicionar aos processados
                if (!result.skipped) {
                    processed.push(result)
                }
            } catch (err) {
                console.error(`Erro ao processar serviço ${services[i].id}:`, err)
                // Continuar com o próximo serviço
            }

            // Add a small delay to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 100))
        }

        setProcessedServices(processed)
        setIsProcessing(false)
        setSuccess(
            `Processamento concluído. ${processed.length} serviços processados (${services.length - processed.length} removidos).`,
        )
    }

    const downloadProcessedServices = () => {
        if (processedServices.length === 0) {
            setError("Nenhum serviço processado para download.")
            return
        }

        const dataStr = JSON.stringify(processedServices, null, 2)
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

        const link = document.createElement("a")
        link.setAttribute("href", dataUri)
        link.setAttribute("download", "services-processed.json")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const clearAll = () => {
        setServices([])
        setProcessedServices([])
        setCurrentIndex(0)
        setTotalItems(0)
        setError(null)
        setSuccess(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-2xl font-bold mb-6">Processador de Serviços (API)</h1>

            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Upload do Arquivo JSON</h2>

                <div className="mb-4">
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        ref={fileInputRef}
                        className="hidden"
                        id="file-upload"
                    />
                    <label
                        htmlFor="file-upload"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-md cursor-pointer transition-colors"
                    >
                        <Upload size={20} />
                        Selecionar arquivo JSON
                    </label>
                    {services.length > 0 && <p className="mt-2 text-sm text-gray-600">{services.length} serviços carregados</p>}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={processServices}
                        disabled={isProcessing || services.length === 0}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isProcessing ? <Loader2 className="animate-spin" size={18} /> : null}
                        Processar Serviços
                    </button>

                    <button
                        onClick={downloadProcessedServices}
                        disabled={processedServices.length === 0 || isProcessing}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Download size={18} />
                        Download JSON Processado
                    </button>

                    <button
                        onClick={clearAll}
                        disabled={isProcessing}
                        className="flex items-center justify-center gap-2 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Trash size={18} />
                        Limpar
                    </button>
                </div>
            </div>

            {isProcessing && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-lg font-semibold mb-3">Processando Serviços</h2>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div
                            className="bg-orange-500 h-2.5 rounded-full"
                            style={{ width: `${(currentIndex / totalItems) * 100}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                        Processando serviço {currentIndex} de {totalItems}
                    </p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6 flex items-start">
                    <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md mb-6 flex items-start">
                    <Check className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <p>{success}</p>
                </div>
            )}

            {processedServices.length > 0 && !isProcessing && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Prévia dos Serviços Processados</h2>
                    <div className="overflow-auto max-h-96 border border-gray-200 rounded-md">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nome
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Resumo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Keywords
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {processedServices.slice(0, 10).map((service) => (
                                    <tr key={service.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{service.nome}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{service.resumo}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{service.keywords}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {processedServices.length > 10 && (
                            <div className="px-6 py-3 bg-gray-50 text-sm text-gray-500">
                                Mostrando 10 de {processedServices.length} serviços processados
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
