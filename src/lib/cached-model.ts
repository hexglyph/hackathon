import {
    type LanguageModelV1,
    type LanguageModelV1Middleware,
    type LanguageModelV1StreamPart,
    simulateReadableStream,
    wrapLanguageModel,
} from "ai"
import { createHash } from "crypto"

// Função para gerar uma chave de cache baseada no conteúdo
function generateCacheKey(content: any): string {
    const stringContent = typeof content === "string" ? content : JSON.stringify(content)
    return createHash("sha256").update(stringContent).digest("hex").substring(0, 32)
}

// Cache em memória para desenvolvimento
// Em produção, você usaria Redis ou outro armazenamento persistente
const memoryCache = new Map<string, any>()

// Middleware de cache para o AI SDK
export const cacheMiddleware: LanguageModelV1Middleware = {
    wrapGenerate: async ({ doGenerate, params }) => {
        // Gerar uma chave de cache baseada nos parâmetros
        const cacheKey = generateCacheKey({
            prompt: params.prompt,
            temperature: params.temperature,
            maxTokens: params.maxTokens,
            function: "generate",
        })

        // Verificar se o resultado está no cache
        const cached = memoryCache.get(cacheKey)
        if (cached) {
            console.log("Cache hit for generate")
            return cached
        }

        // Se não estiver no cache, gerar o resultado
        console.log("Cache miss for generate")
        const result = await doGenerate()

        // Armazenar o resultado no cache
        memoryCache.set(cacheKey, result)

        return result
    },

    wrapStream: async ({ doStream, params }) => {
        // Gerar uma chave de cache baseada nos parâmetros
        const cacheKey = generateCacheKey({
            prompt: params.prompt,
            temperature: params.temperature,
            maxTokens: params.maxTokens,
            function: "stream",
        })

        // Verificar se o resultado está no cache
        const cached = memoryCache.get(cacheKey)
        if (cached) {
            console.log("Cache hit for stream")
            return {
                stream: simulateReadableStream({
                    initialDelayInMs: 0,
                    chunkDelayInMs: 10,
                    chunks: cached,
                }),
                rawCall: { rawPrompt: null, rawSettings: {} },
            }
        }

        // Se não estiver no cache, gerar o resultado
        console.log("Cache miss for stream")
        const { stream, ...rest } = await doStream()

        // Coletar todos os chunks para armazenar no cache
        const chunks: LanguageModelV1StreamPart[] = []
        const transformStream = new TransformStream<LanguageModelV1StreamPart, LanguageModelV1StreamPart>({
            transform(chunk, controller) {
                chunks.push(chunk)
                controller.enqueue(chunk)
            },
            flush() {
                // Armazenar os chunks no cache
                memoryCache.set(cacheKey, chunks)
            },
        })

        return {
            stream: stream.pipeThrough(transformStream),
            ...rest,
        }
    },
}

// Função para envolver um modelo com o middleware de cache
export const cached = (model: LanguageModelV1) =>
    wrapLanguageModel({
        middleware: cacheMiddleware,
        model,
    })
