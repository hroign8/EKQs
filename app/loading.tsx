export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-gold-500/30 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-gold-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-burgundy-900 font-medium">Loading...</p>
      </div>
    </div>
  )
}
