/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import { AzureOpenAI } from "openai"

// Cliente Azure OpenAI para gerenciamento do vector store
const azureOpenAI = new AzureOpenAI({
    endpoint: "https://ia-niass-east2.openai.azure.com/",
    apiKey: process.env.AZURE_OPENAI_API_KEY || "",
    apiVersion: "2024-05-01-preview",
})

// ID do Vector Store no Azure OpenAI
const VECTOR_STORE_ID = "vs_CV873rENwjFOLLzVEtWU3M0u"

// Função para adicionar um documento ao vector store
export async function addDocumentToVectorStore(document: {
    title: string
    content: string
    url: string
    category: string
}) {
    try {
        // Criar um arquivo com o conteúdo do documento
        const file = await azureOpenAI.files.create({
            file: new Blob([JSON.stringify(document)], { type: "application/json" }),
            purpose: "assistants",
        })

        // Adicionar o arquivo ao vector store
        await azureOpenAI.beta.vectorStores.files.create(VECTOR_STORE_ID, {
            file_id: file.id,
            metadata: {
                title: document.title,
                url: document.url,
                category: document.category,
            },
        })

        return {
            success: true,
            fileId: file.id,
        }
    } catch (error) {
        console.error("Erro ao adicionar documento ao vector store:", error)
        return {
            success: false,
            error: error.message,
        }
    }
}

// Função para remover um documento do vector store
export async function removeDocumentFromVectorStore(fileId: string) {
    try {
        // Remover o arquivo do vector store
        await azureOpenAI.beta.vectorStores.files.del(VECTOR_STORE_ID, fileId)

        // Excluir o arquivo
        await azureOpenAI.files.del(fileId)

        return {
            success: true,
        }
    } catch (error) {
        console.error("Erro ao remover documento do vector store:", error)
        return {
            success: false,
            error: error.message,
        }
    }
}

// Função para criar um vector store (executar apenas uma vez)
export async function createVectorStore() {
    try {
        const vectorStore = await azureOpenAI.beta.vectorStores.create({
            name: "Serviços da Prefeitura de São Paulo",
            description: "Vector store contendo informações sobre serviços da Prefeitura de São Paulo",
            embedding_model: "text-embedding-ada-002",
        })

        return {
            success: true,
            vectorStoreId: vectorStore.id,
        }
    } catch (error) {
        console.error("Erro ao criar vector store:", error)
        return {
            success: false,
            error: error.message,
        }
    }
}

// Função para listar todos os documentos no vector store
export async function listVectorStoreDocuments() {
    try {
        const files = await azureOpenAI.beta.vectorStores.files.list(VECTOR_STORE_ID)

        return {
            success: true,
            files: files.data,
        }
    } catch (error) {
        console.error("Erro ao listar documentos do vector store:", error)
        return {
            success: false,
            error: error.message,
        }
    }
}

