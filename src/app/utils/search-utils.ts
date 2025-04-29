/**
 * Utilitários para melhorar a busca e lidar com variações de escrita e erros ortográficos
 */

// Função para normalizar texto (remover acentos, converter para minúsculas)
export function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .replace(/[^\w\s]/g, "") // Remove caracteres especiais
        .trim()
}

// Função para calcular a distância de Levenshtein (distância de edição)
export function levenshteinDistance(a: string, b: string): number {
    const matrix = Array(b.length + 1)
        .fill(null)
        .map(() => Array(a.length + 1).fill(null))

    for (let i = 0; i <= a.length; i++) {
        matrix[0][i] = i
    }

    for (let j = 0; j <= b.length; j++) {
        matrix[j][0] = j
    }

    for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
            const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1, // Deleção
                matrix[j - 1][i] + 1, // Inserção
                matrix[j - 1][i - 1] + substitutionCost, // Substituição
            )
        }
    }

    return matrix[b.length][a.length]
}

// Função para calcular a similaridade entre duas strings (0-1)
export function calculateSimilarity(a: string, b: string): number {
    if (a.length === 0 && b.length === 0) return 1
    if (a.length === 0 || b.length === 0) return 0

    const distance = levenshteinDistance(a, b)
    const maxLength = Math.max(a.length, b.length)
    return 1 - distance / maxLength
}

// Função para verificar se uma string contém outra, considerando similaridade
export function fuzzyContains(text: string, search: string, threshold = 0.8): boolean {
    if (!text || !search) return false

    const normalizedText = normalizeText(text)
    const normalizedSearch = normalizeText(search)

    // Verificar correspondência exata após normalização
    if (normalizedText.includes(normalizedSearch)) return true

    // Verificar palavras individuais
    const textWords = normalizedText.split(/\s+/)
    const searchWords = normalizedSearch.split(/\s+/)

    // Para cada palavra da busca, verificar se há uma palavra similar no texto
    for (const searchWord of searchWords) {
        if (searchWord.length < 3) continue // Ignorar palavras muito curtas

        let foundSimilar = false
        for (const textWord of textWords) {
            if (textWord.length < 3) continue // Ignorar palavras muito curtas

            const similarity = calculateSimilarity(textWord, searchWord)
            if (similarity >= threshold) {
                foundSimilar = true
                break
            }
        }

        if (!foundSimilar) return false
    }

    return true
}

// Mapeamento de sinônimos comuns para serviços da prefeitura
export const synonymsMap: Record<string, string[]> = {
    lixo: ["entulho", "resíduo", "detrito", "resto", "descarte", "rejeito"],
    entulho: ["lixo", "resíduo", "detrito", "resto", "descarte", "rejeito", "caliça", "material de construção"],
    catabagulho: ["cata bagulho", "cata-bagulho", "catabagulho", "coleta de entulho", "coleta de móveis", "coleta de bagulho"],
    poda: ["corte", "aparar", "podar", "cortar", "aparagem", "galho", "árvore"],
    arvore: ["árvore", "arbusto", "planta", "vegetação"],
    buraco: ["cratera", "vala", "furo", "abertura", "tapa-buraco", "tapaburaco", "tapa buraco"],
    iluminacao: ["iluminação", "luz", "lâmpada", "poste", "luminária"],
    calcada: ["calçada", "passeio", "pavimento", "piso"],
    esgoto: ["bueiro", "boca de lobo", "galeria", "drenagem", "água servida"],
    agua: ["água", "vazamento", "infiltração", "alagamento"],
    rua: ["via", "avenida", "estrada", "logradouro", "travessa", "alameda"],
    transporte: ["ônibus", "onibus", "bilhete", "passe", "tarifa", "condução", "lotação"],
    saude: ["saúde", "hospital", "ubs", "posto", "médico", "medico", "atendimento"],
    educacao: ["educação", "escola", "creche", "vaga", "matrícula", "matricula", "ensino"],
    iptu: ["imposto", "tributo", "taxa", "carnê", "carne", "boleto"],
    documento: ["certidão", "certidao", "alvará", "alvara", "licença", "licenca", "autorização", "autorizacao"],
    cemiterio: ["cemitério", "sepultamento", "jazigo", "funeral", "velório", "velorio", "exumação", "exumacao"],
}

// Função para expandir a busca com sinônimos
export function expandSearchWithSynonyms(searchTerm: string): string[] {
    const normalizedSearch = normalizeText(searchTerm)
    const searchWords = normalizedSearch.split(/\s+/)
    const expandedTerms = [normalizedSearch]

    // Para cada palavra na busca, adicionar sinônimos
    for (let i = 0; i < searchWords.length; i++) {
        const word = searchWords[i]
        const synonyms = synonymsMap[word] || []

        for (const synonym of synonyms) {
            // Criar uma nova versão da busca substituindo a palavra pelo sinônimo
            const newWords = [...searchWords]
            newWords[i] = synonym
            expandedTerms.push(newWords.join(" "))
        }
    }

    return [...new Set(expandedTerms)] // Remover duplicatas
}

// Função para buscar serviços com correspondência fuzzy
export function fuzzySearchServices(services: any[], searchTerm: string, threshold = 0.7): any[] {
    if (!searchTerm || searchTerm.trim() === "") return []

    const expandedSearchTerms = expandSearchWithSynonyms(searchTerm)
    const results: any[] = []
    const resultIds = new Set<number>() // Para evitar duplicatas

    for (const service of services) {
        // Pular se já adicionamos este serviço
        if (resultIds.has(service.id)) continue

        // Verificar correspondência em cada campo relevante
        const fieldsToSearch = [
            service.name,
            service.category,
            ...(service.keywords || []),
            service.description,
            service.resumo,
        ].filter(Boolean) // Remover campos undefined/null

        // Verificar cada termo de busca expandido
        for (const term of expandedSearchTerms) {
            let matched = false

            for (const field of fieldsToSearch) {
                if (typeof field !== "string") continue

                if (fuzzyContains(field, term, threshold)) {
                    matched = true
                    break
                }
            }

            if (matched) {
                results.push(service)
                resultIds.add(service.id)
                break // Não precisamos verificar outros termos para este serviço
            }
        }
    }

    return results
}

// Função para classificar resultados por relevância
export function rankSearchResults(results: any[], searchTerm: string): any[] {
    const normalizedSearch = normalizeText(searchTerm)

    return results.sort((a, b) => {
        // Calcular pontuação para o serviço A
        let scoreA = 0
        if (normalizeText(a.name).includes(normalizedSearch)) scoreA += 10
        if (a.keywords && a.keywords.some((k: string) => normalizeText(k).includes(normalizedSearch))) scoreA += 5
        if (a.category && normalizeText(a.category).includes(normalizedSearch)) scoreA += 3

        // Calcular pontuação para o serviço B
        let scoreB = 0
        if (normalizeText(b.name).includes(normalizedSearch)) scoreB += 10
        if (b.keywords && b.keywords.some((k: string) => normalizeText(k).includes(normalizedSearch))) scoreB += 5
        if (b.category && normalizeText(b.category).includes(normalizedSearch)) scoreB += 3

        return scoreB - scoreA // Ordenar por pontuação decrescente
    })
}
