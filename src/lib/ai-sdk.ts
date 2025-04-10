import { azure, createAzure } from "@ai-sdk/azure"
import { AzureOpenAI } from "openai"

// Configuração do cliente Azure OpenAI para uso direto quando necessário
export const azureOpenAI = new AzureOpenAI({
    endpoint: "https://ia-niass-east2.openai.azure.com",
    apiKey: process.env.AZURE_OPENAI_API_KEY || "",
    apiVersion: "2024-12-01-preview",
})

// Update the Azure provider configuration to include resourceName
export const azureProvider = createAzure({
    apiKey: process.env.AZURE_OPENAI_API_KEY || "",
    //endpoint: "https://ia-niass-east2.openai.azure.com",
    apiVersion: "2024-12-01-preview",
    resourceName: "ia-niass-east2", // Add this line
})

// Configuração dos modelos com AI SDK para Azure
export const models = {
    // Modelo para interpretação de consultas
    interpreter: azure("4o-mini"),

    // Modelo para tradução
    translator: azure("4o-mini"),

    // Modelo para transcrição de áudio
    audioTranscriber: azure("gpt-4o-mini-audio"),
}

// Função para registrar informações de uso e cache
export function logUsage(usage: any, providerMetadata: any) {
    console.log(`Usage:`, {
        ...usage,
        // Para Azure, os metadados podem ser diferentes
        cachedPromptTokens: providerMetadata?.azure?.cachedPromptTokens || 0,
        reasoningTokens: providerMetadata?.azure?.reasoningTokens || 0,
    })
}
