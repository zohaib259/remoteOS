export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        {/* Header text */}
        <p className="text-sm font-medium text-gray-600 tracking-wide uppercase mb-8">
          OOPS! PAGE NOT FOUND
        </p>

        {/* Large 404 text */}
        <div className="mb-8">
          <h1 className="text-9xl md:text-[12rem] font-black text-custom-950 leading-none">
            404
          </h1>
        </div>

        {/* Description text */}
        <p className="text-lg md:text-xl text-gray-700 font-medium max-w-md mx-auto leading-relaxed">
          WE ARE SORRY, BUT THE PAGE YOU REQUESTED WAS NOT FOUND
        </p>

        {/* Optional: Add a button to go back home */}
        <div className="mt-12">
          <button
            onClick={() => window.history.back()}
            className="bg-custom-950 text-white cursor-pointer px-8 py-3 rounded-lg font-medium hover:bg-custom-900 border-gray-500 transition-colors duration-200"
          >
            GO BACK
          </button>
        </div>
      </div>
    </div>
  );
}
