"use client"
import { X, Mic, Globe, Volume2, MapPin, Search, ThumbsUp } from "lucide-react"

interface HelpModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
                    <h2 className="text-xl font-bold text-secondary">Portal IA - Features</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100" aria-label="Fechar">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-2 flex items-center">
                                <Search className="w-5 h-5 mr-2 text-secondary" />
                                Busca Inteligente
                            </h3>
                            <p className="text-gray-700">
                                Digite sua dúvida em linguagem natural para encontrar informações sobre serviços da Prefeitura de São
                                Paulo. Exemplo: Como faço para solicitar poda de árvore? ou Preciso da segunda via do IPTU.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2 flex items-center">
                                <Mic className="w-5 h-5 mr-2 text-secondary" />
                                Reconhecimento de Voz
                            </h3>
                            <p className="text-gray-700">
                                Clique no ícone do microfone para fazer sua pergunta por voz. O sistema reconhecerá automaticamente o
                                que você disse e buscará as informações.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2 flex items-center">
                                <Globe className="w-5 h-5 mr-2 text-secondary" />
                                Suporte a Múltiplos Idiomas
                            </h3>
                            <p className="text-gray-700">
                                Faça perguntas em qualquer idioma (português, inglês, espanhol, etc.) e receba respostas no mesmo idioma
                                automaticamente.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2 flex items-center">
                                <Volume2 className="w-5 h-5 mr-2 text-secondary" />
                                Síntese de Voz
                            </h3>
                            <p className="text-gray-700">
                                Clique no ícone de alto-falante para ouvir a resposta em voz alta, ideal para pessoas com dificuldades
                                visuais ou para quando você estiver em movimento.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2 flex items-center">
                                <ThumbsUp className="w-5 h-5 mr-2 text-secondary" />
                                Feedback
                            </h3>
                            <p className="text-gray-700">
                                Após receber uma resposta, você pode avaliar se ela foi útil ou não, ajudando a melhorar o sistema para
                                todos os usuários.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-orange-600 transition-colors"
                    >
                        Entendi
                    </button>
                </div>
            </div>
        </div>
    )
}
