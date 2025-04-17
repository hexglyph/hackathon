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
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
                    <h2 className="text-xl font-bold text-orange-600">City Hall AI - Features</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100" aria-label="Close">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-2 flex items-center">
                                <Search className="w-5 h-5 mr-2 text-orange-500" />
                                Smart Search
                            </h3>
                            <p className="text-gray-700">
                                Type your question in natural language to find information about São Paulo City Hall services. Example:
                                "How do I request tree pruning?" or "I need a copy of my property tax bill".
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2 flex items-center">
                                <Mic className="w-5 h-5 mr-2 text-orange-500" />
                                Voice Recognition
                            </h3>
                            <p className="text-gray-700">
                                Click on the microphone icon to ask your question by voice. The system will automatically recognize what
                                you said and search for the information.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2 flex items-center">
                                <Globe className="w-5 h-5 mr-2 text-orange-500" />
                                Multiple Language Support
                            </h3>
                            <p className="text-gray-700">
                                Ask questions in any language (Portuguese, English, Spanish, etc.) and receive answers in the same
                                language automatically.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2 flex items-center">
                                <Volume2 className="w-5 h-5 mr-2 text-orange-500" />
                                Text-to-Speech
                            </h3>
                            <p className="text-gray-700">
                                Click on the speaker icon to hear the answer out loud, ideal for people with visual impairments or when
                                you're on the move.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2 flex items-center">
                                <MapPin className="w-5 h-5 mr-2 text-orange-500" />
                                Service Location
                            </h3>
                            <p className="text-gray-700">
                                For questions about service locations (e.g., "Where is the nearest health center?"), the system can show
                                information about the closest locations.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2 flex items-center">
                                <ThumbsUp className="w-5 h-5 mr-2 text-orange-500" />
                                Feedback
                            </h3>
                            <p className="text-gray-700">
                                After receiving an answer, you can rate whether it was helpful or not, helping to improve the system for
                                all users.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-orange-50 rounded-lg border border-orange-100">
                        <h3 className="font-semibold text-orange-700 mb-2">Tip</h3>
                        <p className="text-orange-700 text-sm">
                            For best results, be specific in your question. For example, instead of just asking "Property tax", try
                            "How do I get a copy of my property tax bill?" or "When is the 2024 property tax due?".
                        </p>
                    </div>
                </div>

                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    )
}
