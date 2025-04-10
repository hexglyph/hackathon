import { type NextRequest, NextResponse } from "next/server"
import { AzureOpenAI } from "openai"
import { createHash } from "crypto"

// Configuração do cliente Azure OpenAI
const azureOpenAI = new AzureOpenAI({
    endpoint: "https://ia-niass-east2.openai.azure.com",
    apiKey: process.env.AZURE_OPENAI_API_KEY || "",
    apiVersion: "2024-12-01-preview",
})

// Função para gerar uma chave de cache baseada no texto e voz
function generateCacheKey(text: string, voice: string): string {
    return createHash("sha256").update(`${text}-${voice}`).digest("hex").substring(0, 32)
}

export async function POST(request: NextRequest) {
    try {
        const { text, voice = "alloy" } = await request.json()

        if (!text) {
            return NextResponse.json({ error: "Nenhum texto fornecido" }, { status: 400 })
        }

        // Limitar o tamanho do texto para evitar problemas com a API
        const maxLength = 4000
        const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + "..." : text

        // Gerar uma chave de cache baseada no texto e voz
        const cacheKey = generateCacheKey(truncatedText, voice)

        // Converter texto para fala
        const mp3 = await azureOpenAI.audio.speech.create({
            model: "tts-1",
            voice: voice,
            input: truncatedText
        })

        // Converter o buffer para um ArrayBuffer
        const buffer = await mp3.arrayBuffer()

        // Retornar o áudio como uma resposta com o tipo de conteúdo correto
        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "audio/mpeg",
                "Content-Length": buffer.byteLength.toString(),
            },
        })
    } catch (error) {
        console.error("Erro ao converter texto para fala:", error)
        return NextResponse.json(
            { error: "Erro ao processar a conversão de texto para fala. Por favor, tente novamente." },
            { status: 500 },
        )
    }
}
