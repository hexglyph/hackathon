export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-600 mb-4">Página Não Encontrada</h2>
                <p className="text-gray-500 mb-6">Desculpe, não conseguimos encontrar a página que você está procurando.</p>
            </div>
        </div>
    )
}

