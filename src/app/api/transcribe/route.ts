import { type NextRequest, NextResponse } from "next/server"
import { AzureOpenAI } from "openai"
import { createHash } from "crypto"

// Configuração do cliente Azure OpenAI
const azureOpenAI = new AzureOpenAI({
    endpoint: "https://ia-niass-east2.openai.azure.com",
    apiKey: process.env.AZURE_OPENAI_API_KEY || "",
    apiVersion: "2024-12-01-preview",
})

// Função para gerar uma chave de cache baseada no conteúdo do áudio
async function generateAudioCacheKey(audioBlob: Blob): Promise<string> {
    // Converter o blob para um buffer
    const arrayBuffer = await audioBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Criar um hash do conteúdo do áudio
    return createHash("sha256").update(buffer).digest("hex").substring(0, 32)
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const audioFile = formData.get("audio") as File

        if (!audioFile) {
            return NextResponse.json({ error: "Nenhum arquivo de áudio fornecido" }, { status: 400 })
        }

        // Converter o arquivo para um buffer
        const buffer = Buffer.from(await audioFile.arrayBuffer())

        // Criar um objeto Blob com o buffer
        const blob = new Blob([buffer], { type: audioFile.type })

        // Gerar uma chave de cache baseada no conteúdo do áudio
        const cacheKey = await generateAudioCacheKey(blob)

        // Converter o blob para base64
        const base64Audio = Buffer.from(await blob.arrayBuffer()).toString("base64")

        // Criar o objeto de conteúdo para a mensagem
        const content = [
            {
                type: "audio",
                audio: {
                    data: base64Audio,
                    mime_type: audioFile.type,
                },
            },
        ]

        // Usar o modelo gpt-4o-mini-audio através da API de chat completions
        const completion = await azureOpenAI.chat.completions.create({
            model: "gpt-4o-mini-audio",
            messages: [
                {
                    role: "user",
                    content: content,
                },
            ],
            max_tokens: 5000,
            temperature: 0.3,
            cache_key: cacheKey, // Adicionar a chave de cache
        })

        // Extrair o texto transcrito da resposta
        const transcribedText = completion.choices[0].message.content || ""

        return NextResponse.json({ text: transcribedText })
    } catch (error) {
        console.error("Erro ao transcrever áudio:", error)
        return NextResponse.json(
            { error: "Erro ao processar a transcrição do áudio. Por favor, tente novamente." },
            { status: 500 },
        )
    }
}
