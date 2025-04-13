"use client"

import {
    AudioConfig,
    AutoDetectSourceLanguageConfig,
    ResultReason,
    SpeakerAudioDestination,
    SpeechConfig,
    SpeechRecognizer,
    SpeechSynthesizer,
} from "microsoft-cognitiveservices-speech-sdk"

// Função para obter o token do Azure Speech
export const getSpeechToken = async () => {
    try {
        const response = await fetch("/api/speech-token", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })

        if (!response.ok) {
            throw new Error(`Erro ao obter token: ${response.status} ${response.statusText}`)
        }

        return await response.json()
    } catch (error) {
        console.error("Erro ao obter token do Azure Speech:", error)
        return {
            error: true,
            errorMessage: error instanceof Error ? error.message : "Erro desconhecido",
            token: "",
            region: "",
        }
    }
}

// Classe para gerenciar o reconhecimento de fala (Speech-to-Text)
export class SpeechToTextService {
    private recognizer: SpeechRecognizer | undefined
    private isListening = false
    private onTextCallback: ((text: string) => void) | null = null
    private onErrorCallback: ((error: string) => void) | null = null
    private onFinalResultCallback: ((text: string) => void) | null = null
    private onSearchCallback: ((text: string) => void) | null = null

    constructor() { }

    public setCallbacks(
        onText: (text: string) => void,
        onError: (error: string) => void,
        onFinalResult: (text: string) => void,
        onSearch?: (text: string) => void,
    ) {
        this.onTextCallback = onText
        this.onErrorCallback = onError
        this.onFinalResultCallback = onFinalResult
        this.onSearchCallback = onSearch || null
    }

    public async startRecognition() {
        if (this.isListening) {
            this.stopRecognition()
        }

        try {
            const tokenResponse = await getSpeechToken()

            if (tokenResponse.error) {
                if (this.onErrorCallback) {
                    this.onErrorCallback(tokenResponse.errorMessage)
                }
                return false
            }

            const speechConfig = SpeechConfig.fromAuthorizationToken(tokenResponse.token, tokenResponse.region)
            speechConfig.speechRecognitionLanguage = "pt-BR"

            const audioConfig = AudioConfig.fromDefaultMicrophoneInput()

            // Configurar para detectar automaticamente o idioma entre português, inglês e espanhol
            const autoDetectSourceLanguageConfig = AutoDetectSourceLanguageConfig.fromLanguages(["pt-BR", "en-US", "es-ES"])

            this.recognizer = SpeechRecognizer.FromConfig(speechConfig, autoDetectSourceLanguageConfig, audioConfig)

            this.recognizer.recognizing = (s, e) => {
                console.log("Reconhecendo: ", e.result.text)
                if (this.onTextCallback) {
                    this.onTextCallback(e.result.text)
                }
            }

            this.recognizer.recognized = (s, e) => {
                console.log("Reconhecido: ", e.result.text, "Razão: ", e.result.reason)
                if (e.result.reason === ResultReason.RecognizedSpeech && e.result.text) {
                    const finalText = e.result.text
                    console.log("Texto final reconhecido: ", finalText)

                    if (this.onFinalResultCallback) {
                        this.onFinalResultCallback(finalText)
                    }

                    // Executar a busca automaticamente após reconhecer o texto final
                    if (this.onSearchCallback && finalText.trim()) {
                        console.log("Executando busca automática com: ", finalText)
                        setTimeout(() => {
                            if (this.onSearchCallback) {
                                this.onSearchCallback(finalText)
                            }
                        }, 500) // Pequeno atraso para garantir que o texto foi atualizado na UI
                    }

                    // Parar o reconhecimento após obter um resultado final
                    this.stopRecognition()
                }
            }

            this.recognizer.canceled = (s, e) => {
                console.log("Reconhecimento cancelado: ", e.errorDetails)
                if (this.onErrorCallback) {
                    this.onErrorCallback(e.errorDetails || "Reconhecimento de fala cancelado")
                }
                this.isListening = false
            }

            this.recognizer.sessionStopped = (s, e) => {
                console.log("Sessão de reconhecimento parada")
                this.isListening = false
            }

            console.log("Iniciando reconhecimento contínuo...")
            this.recognizer.startContinuousRecognitionAsync(
                () => {
                    console.log("Reconhecimento contínuo iniciado com sucesso")
                    this.isListening = true
                },
                (error) => {
                    console.error("Erro ao iniciar reconhecimento contínuo: ", error)
                    if (this.onErrorCallback) {
                        this.onErrorCallback(`Erro ao iniciar reconhecimento: ${error}`)
                    }
                    this.isListening = false
                },
            )

            return true
        } catch (error) {
            console.error("Erro ao iniciar reconhecimento: ", error)
            if (this.onErrorCallback) {
                this.onErrorCallback(`Erro ao iniciar reconhecimento: ${error instanceof Error ? error.message : error}`)
            }
            return false
        }
    }

    public stopRecognition() {
        if (this.recognizer && this.isListening) {
            console.log("Parando reconhecimento...")
            this.recognizer.stopContinuousRecognitionAsync(
                () => {
                    console.log("Reconhecimento parado com sucesso")
                    this.isListening = false
                },
                (error) => {
                    console.error("Erro ao parar reconhecimento: ", error)
                    if (this.onErrorCallback) {
                        this.onErrorCallback(`Erro ao parar reconhecimento: ${error}`)
                    }
                },
            )
        }
    }

    public isRecognizing() {
        return this.isListening
    }
}

// Classe para gerenciar a síntese de fala (Text-to-Speech)
export class TextToSpeechService {
    private player: SpeakerAudioDestination | undefined
    private synthesizer: SpeechSynthesizer | undefined
    private isPlaying = false
    private onPlayingCallback: ((isPlaying: boolean) => void) | null = null
    private onErrorCallback: ((error: string) => void) | null = null

    constructor() { }

    public setCallbacks(onPlaying: (isPlaying: boolean) => void, onError: (error: string) => void) {
        this.onPlayingCallback = onPlaying
        this.onErrorCallback = onError
    }

    public async speak(text: string, voiceName = "pt-BR-AntonioNeural") {
        if (this.isPlaying) {
            this.stop()
        }

        try {
            const tokenResponse = await getSpeechToken()

            if (tokenResponse.error) {
                if (this.onErrorCallback) {
                    this.onErrorCallback(tokenResponse.errorMessage)
                }
                return false
            }

            const speechConfig = SpeechConfig.fromAuthorizationToken(tokenResponse.token, tokenResponse.region)
            speechConfig.speechSynthesisVoiceName = voiceName

            this.player = new SpeakerAudioDestination()
            const audioConfig = AudioConfig.fromSpeakerOutput(this.player)

            this.synthesizer = new SpeechSynthesizer(speechConfig, audioConfig)

            this.player.onAudioEnd = () => {
                this.isPlaying = false
                if (this.onPlayingCallback) {
                    this.onPlayingCallback(false)
                }
            }

            this.synthesizer.speakTextAsync(
                text,
                (result) => {
                    if (result.reason === ResultReason.SynthesizingAudioCompleted) {
                        this.isPlaying = true
                        if (this.onPlayingCallback) {
                            this.onPlayingCallback(true)
                        }
                    } else {
                        if (this.onErrorCallback) {
                            this.onErrorCallback(result.errorDetails || "Erro na síntese de fala")
                        }
                        this.isPlaying = false
                        if (this.onPlayingCallback) {
                            this.onPlayingCallback(false)
                        }
                    }
                    this.synthesizer?.close()
                },
                (error) => {
                    if (this.onErrorCallback) {
                        this.onErrorCallback(`Erro na síntese de fala: ${error}`)
                    }
                    this.isPlaying = false
                    if (this.onPlayingCallback) {
                        this.onPlayingCallback(false)
                    }
                    this.synthesizer?.close()
                },
            )

            return true
        } catch (error) {
            if (this.onErrorCallback) {
                this.onErrorCallback(`Erro na síntese de fala: ${error instanceof Error ? error.message : error}`)
            }
            return false
        }
    }

    public stop() {
        if (this.player && this.isPlaying) {
            this.player.pause()
            this.isPlaying = false
            if (this.onPlayingCallback) {
                this.onPlayingCallback(false)
            }
        }
    }

    public isCurrentlyPlaying() {
        return this.isPlaying
    }
}

// Instâncias singleton dos serviços
export const speechToText = new SpeechToTextService()
export const textToSpeech = new TextToSpeechService()
