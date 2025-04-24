export default function AuthLayout(
    {children}: {
        children: React.ReactNode
    }
) {
    return (
        <main className="w-full min-h-screen bg-gray-100 flex items-center justify-center py-4">
            <div className="w-full max-w-3xl bg-white text-dark p-6 rounded-lg shadow-lg">
                <div className="grid  grid-cols-1 sm:grid-cols-2 gap-y-10">
                    {children}
                </div>
            </div>
        </main>
    )
}