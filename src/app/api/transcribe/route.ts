/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { type NextRequest, NextResponse } from "next/server"
import { AzureOpenAI } from "openai"

// Configuração do cliente Azure OpenAI
const azureOpenAI = new AzureOpenAI({
    endpoint: "https://ia-niass-east2.openai.azure.com",
    apiKey: process.env.AZURE_OPENAI_API_KEY || "",
    apiVersion: "2024-12-01-preview",
})

// Função para simplificar o tipo MIME para o formato esperado pela API
function simplifyMimeType(mimeType: string): string {
    // Extrair apenas a parte após o "/"
    const parts = mimeType.split("/")
    if (parts.length === 2) {
        return parts[1]
    }
    return mimeType
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const audioFile = formData.get("audio") as File

        if (!audioFile) {
            return NextResponse.json({ error: "Nenhum arquivo de áudio fornecido" }, { status: 400 })
        }

        // Obter o tipo MIME simplificado (ex: "audio/webm" -> "webm")
        const simplifiedType = simplifyMimeType(audioFile.type)

        // Converter o arquivo para um buffer
        const arrayBuffer = await audioFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Criar um objeto de arquivo para a API do OpenAI com o tipo simplificado
        const file = new File([buffer], `audio.${simplifiedType}`, { type: simplifiedType })

        const base64str = Buffer.from(buffer).toString("base64")

        const messages = [
            {
                role: "user",
                content: [{
                    type: "input_audio",
                    input_audio: {
                        data: base64str,
                        format: "wav"
                    }
                }],
            }
        ]

        // Usar a API de transcrições com o modelo Whisper
        const transcription = await azureOpenAI.chat.completions.create({
            model: "4o-audio",
            modalities: ["text"],
            messages: [
                {
                    name: "Transcribe",
                    role: "user",
                    content: [{
                        type: "input_audio",
                        input_audio: {
                            data: base64str,
                            format: "wav"
                        }
                    }],
                }
            ],
            store: true,
            temperature: 0.7,
            max_completion_tokens: 2048,
            stream: false,
            response_format: "text",
        })

        console.log("Transcrição concluída com sucesso")

        return NextResponse.json({ text: transcription.choices[0].message.content }, { status: 200 })
    } catch (error) {
        console.error("Erro ao transcrever áudio:", error)
        console.error("Detalhes do erro da API:", error.error)

        // Fornecer informações mais detalhadas sobre o erro
        let errorMessage = "Erro ao processar a transcrição do áudio. Por favor, tente novamente."

        if (error.response) {
            errorMessage = `Erro ${error.response.status}: ${error.response.data?.error?.message || errorMessage}`
            console.error("Detalhes do erro da API:", error.response.data)
        }

        return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
}
