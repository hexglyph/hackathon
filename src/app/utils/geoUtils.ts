// Constantes
export const SAO_PAULO_CENTER = { lat: -23.555153873167974, lng: -46.51717973826744 }
export const GRID_SIZE = 5 // metros
export const GRID_SIZE_DEGREES = GRID_SIZE / 111000 // Conversão aproximada de metros para graus

// Calcular número da célula a partir de coordenadas lat/lng
export function calculateCellNumber(lat: number, lng: number): number {
    const latOffset = Math.round((lat - SAO_PAULO_CENTER.lat) / GRID_SIZE_DEGREES)
    const lngOffset = Math.round((lng - SAO_PAULO_CENTER.lng) / GRID_SIZE_DEGREES)
    return latOffset * 1000000 + lngOffset
}

// Calcular coordenadas da célula a partir do número
export function calculateCellCoordinates(cellNumber: number): {
    latRange: [number, number]
    lngRange: [number, number]
} {
    const latOffset = Math.floor(cellNumber / 1000000)
    const lngOffset = cellNumber % 1000000

    const lat = SAO_PAULO_CENTER.lat + latOffset * GRID_SIZE_DEGREES
    const lng = SAO_PAULO_CENTER.lng + lngOffset * GRID_SIZE_DEGREES

    return {
        latRange: [lat, lat + GRID_SIZE_DEGREES],
        lngRange: [lng, lng + GRID_SIZE_DEGREES],
    }
}

// Calcular distância entre dois pontos em metros
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3 // raio da Terra em metros
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lng2 - lng1) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
}

// Verificar se um ponto está dentro de um polígono
export function isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
    const x = point[0]
    const y = point[1]

    let inside = false
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i][0]
        const yi = polygon[i][1]
        const xj = polygon[j][0]
        const yj = polygon[j][1]

        const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
        if (intersect) inside = !inside
    }

    return inside
}

