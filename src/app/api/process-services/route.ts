import { type NextRequest, NextResponse } from "next/server"
import { AzureOpenAI } from "openai"

// Configuração do cliente Azure OpenAI
const azureOpenAI = new AzureOpenAI({
    endpoint: "https://ia-niass-east2.openai.azure.com",
    apiKey: process.env.AZURE_OPENAI_API_KEY || "",
    apiVersion: "2024-12-01-preview",
})

export async function POST(request: NextRequest) {
    try {
        const { service } = await request.json()

        if (!service) {
            return NextResponse.json({ error: "Nenhum serviço fornecido" }, { status: 400 })
        }

        // Skip services with "Nome não encontrado"
        if (service.nome === "Nome não encontrado") {
            return NextResponse.json({ skipped: true, reason: "Nome não encontrado" })
        }

        // Combine all relevant fields for context
        const serviceContext = `
            Nome do serviço: ${service.nome || ""}
            Descrição: ${service.descricao || ""}
            O que é: ${service.oQueE || ""}
            Quando solicitar: ${service.quandoSolicitar || ""}
            Público alvo: ${service.publicoAlvo || ""}
            Órgão responsável: ${service.orgaoResponsavel || ""}
        `.trim()

        // Skip if there's not enough information
        if (serviceContext.length < 20) {
            return NextResponse.json({ skipped: true, reason: "Informações insuficientes" })
        }

        // Usar o Azure OpenAI para gerar palavras-chave
        const keywordsResponse = await azureOpenAI.chat.completions.create({
            model: "o4-mini",
            messages: [
                {
                    role: "system",
                    content: `Você é um assistente especializado em serviços públicos municipais. Sua tarefa é analisar serviços da Prefeitura de São Paulo e gerar palavras-chave relevantes.`,
                },
                {
                    role: "user",
                    content: `
                    Analise este serviço da Prefeitura de São Paulo e gere uma lista de palavras-chave relevantes.
                    Inclua:
                    1. Termos exatos do nome e descrição
                    2. Sinônimos comuns
                    3. Formas alternativas que os cidadãos podem usar para descrever este serviço
                    4. Termos relacionados ao órgão responsável
                    5. Problemas que este serviço resolve
                    
                    Serviço:
                    ${serviceContext}
                    
                    Retorne apenas uma lista de palavras-chave separadas por vírgula, sem numeração ou formatação adicional.
                    Limite a resposta a no máximo 15 palavras-chave relevantes.`,
                },
            ],
            reasoning_effort: "low",
        })

        // Clean up the response
        const keywords = keywordsResponse.choices[0].message.content?.trim() || ""

        // Create a summary if it doesn't exist
        let summary = service.resumo
        if (!summary || summary.trim() === "") {
            const summaryResponse = await azureOpenAI.chat.completions.create({
                model: "o4-mini",
                messages: [
                    {
                        role: "system",
                        content: `Você é um assistente especializado em serviços públicos municipais. Sua tarefa é criar resumos concisos para serviços da Prefeitura de São Paulo.`,
                    },
                    {
                        role: "user",
                        content: `
                        Crie um resumo curto e objetivo para este serviço da Prefeitura de São Paulo.
                        O resumo deve ter no máximo 2 frases e explicar claramente o que é o serviço e quando utilizá-lo.
                        
                        Serviço:
                        ${serviceContext}`,
                    },
                ],
                reasoning_effort: "low",
            })

            summary = summaryResponse.choices[0].message.content?.trim() || ""
            console.log("Resumo gerado:", summary)
            console.log("Keywords gerado:", keywords)
        }

        // Return the updated service
        return NextResponse.json({
            ...service,
            keywords,
            resumo: summary,
        })
    } catch (error) {
        console.error("Erro ao processar serviço:", error)
        return NextResponse.json({ error: "Erro ao processar o serviço" }, { status: 500 })
    }
}
