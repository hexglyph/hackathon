import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { models, logUsage } from "@/lib/ai-sdk"

export async function POST(request: NextRequest) {
    try {
        const { text, targetLanguage = "en" } = await request.json()

        if (!text) {
            return NextResponse.json({ error: "Nenhum texto fornecido" }, { status: 400 })
        }

        // Determinar o sistema prompt baseado no idioma alvo
        let languageName = "inglês"
        switch (targetLanguage) {
            case "en":
                languageName = "inglês"
                break
            case "es":
                languageName = "espanhol"
                break
            case "fr":
                languageName = "francês"
                break
            case "it":
                languageName = "italiano"
                break
            case "de":
                languageName = "alemão"
                break
            case "ja":
                languageName = "japonês"
                break
            case "zh":
                languageName = "chinês"
                break
            case "ru":
                languageName = "russo"
                break
            case "ar":
                languageName = "árabe"
                break
            default:
                languageName = targetLanguage
        }

        const systemPrompt = `Você é um tradutor especializado. Traduza o seguinte texto do português para o ${languageName}. 
    Mantenha todas as formatações Markdown, links e estrutura original. 
    Não traduza nomes próprios, URLs ou códigos. 
    Mantenha os marcadores especiais como [SOLICITAR_NORMAL] e [SOLICITAR_ANONIMO].`

        // Usar o AI SDK para traduzir o texto
        const {
            text: translatedText,
            usage,
            providerMetadata,
        } = await generateText({
            model: models.translator,
            system: systemPrompt,
            prompt: text,
            temperature: 0.7,
        })

        // Registrar informações de uso e cache
        logUsage(usage, providerMetadata)

        return NextResponse.json({ translatedText })
    } catch (error) {
        console.error("Erro ao traduzir texto:", error)
        return NextResponse.json({ error: "Erro ao processar a tradução. Por favor, tente novamente." }, { status: 500 })
    }
}
