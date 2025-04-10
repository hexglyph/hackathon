import { toast } from "react-toastify"

export interface GovernedCell {
    cellNumber: number
    name: string
    expiresAt: string
}

export function updateGovernedCells(newCell: GovernedCell, action: "add" | "remove") {
    try {
        const storedCells = localStorage.getItem("governedCells")
        let cells: GovernedCell[] = storedCells ? JSON.parse(storedCells) : []

        if (action === "add") {
            cells = [...cells, newCell]
        } else if (action === "remove") {
            cells = cells.filter((cell) => cell.cellNumber !== newCell.cellNumber)
        }

        localStorage.setItem("governedCells", JSON.stringify(cells))
        localStorage.setItem("governedCellsTimestamp", Date.now().toString())

        // Dispatch a custom event to notify components that the data has changed
        window.dispatchEvent(new CustomEvent("governedCellsUpdated"))
    } catch (error) {
        console.error("Error updating governed cells:", error)
        toast.error("Failed to update governed cells. Please refresh the page.")
    }
}

export function getGovernedCells(): GovernedCell[] {
    const storedCells = localStorage.getItem("governedCells")
    return storedCells ? JSON.parse(storedCells) : []
}

