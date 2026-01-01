"use client";
export default function EfficiencyChart({ inStock, lowStock, outOfStock }: any) {
  // Ensure values are numbers to prevent hydration mismatches
  const inStockNum = Number(inStock) || 0;
  const lowStockNum = Number(lowStock) || 0;
  const outOfStockNum = Number(outOfStock) || 0;

  // Calculate circumference (2 * π * r) where r = 15.9155
  // This gives us approximately 100, so percentages work directly
  const circumference = 2 * Math.PI * 15.9155;

  // Calculate dash array values based on percentages
  const lowStockDash = (lowStockNum / 100) * circumference;
  const inStockDash = (inStockNum / 100) * circumference;
  const outOfStockDash = (outOfStockNum / 100) * circumference;

  // Calculate cumulative offsets so segments stack sequentially
  const lowStockOffset = 0;
  const inStockOffset = -lowStockDash;
  const outOfStockOffset = -(lowStockDash + inStockDash);

  // Create title strings to ensure consistent rendering
  const lowStockTitle = `Low Stock: ${lowStockNum}%`;
  const inStockTitle = `In Stock: ${inStockNum}%`;
  const outOfStockTitle = `Out of Stock: ${outOfStockNum}%`;

  return (
    <div className="bg-white rounded-lg border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Efficiency</h2>

      </div>
      <div className="flex items-center gap-40">
        <div className="relative w-48 h-48 group">
          <svg
            viewBox="0 0 36 36"
            className="w-full h-full -rotate-90"
          >
            {/* Background */}
            <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#e5e7eb" strokeWidth="3" />

            {/* Low Stock - First segment */}
            <circle
              className="stroke-yellow-400 hover:opacity-80 transition-all duration-300"
              strokeDasharray={`${lowStockDash} ${circumference}`}
              strokeDashoffset={lowStockOffset}
              cx="18"
              cy="18"
              r="15.9155"
              strokeWidth="3"
              fill="none"
            >
              <title>{lowStockTitle}</title>
            </circle>

            {/* In Stock - Second segment */}
            <circle
              className="stroke-emerald-500 hover:opacity-80 transition-all duration-300"
              strokeDasharray={`${inStockDash} ${circumference}`}
              strokeDashoffset={inStockOffset}
              cx="18"
              cy="18"
              r="15.9155"
              strokeWidth="3"
              fill="none"
            >
              <title>{inStockTitle}</title>
            </circle>

            {/* Out of Stock - Third segment */}
            <circle
              className="stroke-red-500 hover:opacity-80 transition-all duration-300"
              strokeDasharray={`${outOfStockDash} ${circumference}`}
              strokeDashoffset={outOfStockOffset}
              cx="18"
              cy="18"
              r="15.9155"
              strokeWidth="3"
              fill="none"
            >
              <title>{outOfStockTitle}</title>
            </circle>
          </svg>

          {/* Hover Labels */}
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div className="bg-white text-gray-800 text-sm font-medium px-2 py-1 rounded shadow opacity-100 group-hover:opacity-0 transition-opacity duration-300">
              Inventory Efficiency
            </div>
            <div className="absolute bg-white text-gray-800 text-sm font-medium px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <h1>LowStock: {lowStockNum}%, </h1>
              <h1>InStock: {inStockNum}%, </h1>
              <h1>OutStock: {outOfStockNum}%</h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col text-sm text-gray-600">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full bg-green-600`} />
            <span>In Stock ({inStockNum}%)</span>

          </div>
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full bg-red-600`} />
            <span>out Stock ({outOfStockNum}%)</span>


          </div>
          <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full bg-yellow-400`} />
              <span>Low Stock ({lowStockNum}%)</span>
            

          </div>


        </div>
      </div>
    </div>
  );
}
