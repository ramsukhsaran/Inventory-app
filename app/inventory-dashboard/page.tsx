
import Sidebar from '@/components/sidebar';
import prisma from '../lib/prisma';
import { getCurrentUser } from '../lib/auth';
import { IndianRupee, TrendingUp } from 'lucide-react';
import ProductChart from '@/components/product-charts';
import CustomActiveShapePieChart from '@/components/product-stock-pie-chart';
import EfficiencyChart from '@/components/EfficiencyChart';
import LiveStockChart from '@/components/LiveStockChart';

const InventoryDashboardPage = async () => {
  const user = await getCurrentUser();
  // prisma query to get the total number of products for the current user ( where is very important here)
  const [totalproduct, lowStockProduct, allProducts] = await Promise.allSettled([
    prisma.product.count({ where: { userId: user.id } }),
    prisma.product.count({ where: { userId: user.id, lowStockAt: { not: null, }, quantity: { lte: 5 } } }),
    prisma.product.findMany({ where: { userId: user.id }, select: { price: true, quantity: true, createdAt: true } }),
  ]);

  // Unwrap settled Promise results properly
  const totalproducts = totalproduct.status === "fulfilled" ? totalproduct.value : 0;
  const lowStockProducts = lowStockProduct.status === "fulfilled" ? lowStockProduct.value : 0
  const allProductsValue = allProducts.status === "fulfilled" ? allProducts.value : [];

  const recentProducts: any = await prisma.product.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  const weeklyProductData = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - i * 7)
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekStart.setHours(23, 59, 59, 999);

    const weekLabel = `${String(weekStart.getMonth() + 1).padStart(2, "0")}/${String(weekStart.getDate() + 1).padStart(2, "0")}`
    const weekproducts = allProductsValue?.filter((product: any) => {
      const productdate = new Date(product.createdAt)
      return productdate >= weekStart && productdate <= weekEnd

    })
    weeklyProductData.push({
      week: weekLabel,
      products: weekproducts.length
    })
  }
  const totalValue = allProductsValue.reduce(
    (acc: number, product: any) =>
      acc + Number(product.price) * Number(product.quantity),
    0
  );
  const instockCount = allProductsValue.filter((p) => p.quantity > 5).length;
  const lowStockCount = allProductsValue.filter((p: any) => p.quantity <= 5 && p.quantity >= 1).length
  const outofStockCount = allProductsValue.filter((p) => p.quantity === 0).length;

  const inStockPercenatage = totalproducts > 0 ? Math.round((instockCount / totalproducts * 100)) : 0
  const lowStockPercentage = totalproducts > 0 ? Math.round((lowStockCount / totalproducts * 100)) : 0
  const outofStockPercentage = totalproducts > 0 ? Math.round((outofStockCount / totalproducts * 100)) : 0

  return (
    <div className='min-h-screen bg-gray-50'>
      <Sidebar currentPath="/inventory-dashboard" />
      <main className='ml-64 p-8'>
        <header className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-semibold text-gray-900'>Dashboard</h1>
              <p className='text-sm text-gray-500'>Welcome back, Here is your Inventory Overview.</p>
            </div>
          </div>
        </header>

        <LiveStockChart  />
        {/* Key Metrics Section */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-8'>
          {/* Key Metrics Section */}
          <div className='bg-white rounded-lg shadow-md border-gray-200 p-6'>
            <h2 className='text-lg font-semibold text-gray-900 mb-4'>Key Metrics</h2>
            <div className='grid grid-cols-3 gap-6'>
              <div className='text-center'>
                <div className='text-3xl font-bold text-gray-900' >{Number(totalproducts)}</div>
                <div className='text-sm  text-gray-600'>Total Products</div>
                <div className='flex items-center justify-center mt-1'>
                  <span className='text-xs text-green'>+{Number(totalproducts)}</span>
                  <TrendingUp className='w-3 h-3 text-green-600 ml-1' />
                </div>
              </div>

              <div className='text-center'>
                <div className='text-2xl font-bold text-gray-900' >
                  &#8377;{totalValue.toFixed(2)}
                </div>
                <div className='text-sm  text-gray-600'>Total Value</div>
                <div className='flex items-center justify-center mt-1'>
                  <span className='text-xs text-green'>+{totalValue.toFixed(2)}</span>
                  <TrendingUp className='w-3 h-3 text-green-600 ml-1' />
                </div>
              </div>
              <div className='text-center'>
                <div className='text-3xl font-bold text-gray-900' >{Number(lowStockProducts)}</div>
                <div className='text-sm  text-gray-600'>Low Stock</div>
                <div className='flex items-center justify-center mt-1'>
                  <span className='text-xs text-green'>+{Number(lowStockProducts)}</span>
                  <TrendingUp className='w-3 h-3 text-green-600 ml-1' />
                </div>
              </div>
            </div>
          </div>
          {/* Products Per week Analytics */}
          <div className='bg-white rounded-lg shadow-md border-gray-200 p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-lg font-semibold text-gray-900'>New Products per week</h2>
            </div>
            <div className=' h-48'>
              <ProductChart data={weeklyProductData} />
            </div>
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-8'>
          <div className='bg-white rounded-lg border-gray-200 p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-lg font-semibold text-gray-900 p-1'>Stock Level</h2>
            </div>
            <div className='space-y-3 '>
              {recentProducts?.map((product: any, key: any) => {
                const stockLevel = product.quantity === 0 ? 0 : product.quantity <= (product.lowStockProducts || 5) ? 1 : 2
                const bgColors = ["bg-red-600", "bg-yellow-600", "bg-green-600"]
                const textColors = ["text-red-600", "text-yellow-600", "text-green-600"]

                return <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className='flex items-center space-x-3'>
                    <div className={`w-3 h-3 rounded-full ${bgColors[stockLevel]}`} />
                    <span className='text-sm font-medium text-gray-900'>{product.name}</span>
                  </div>
                  <div className={`text-sm font-medium ${textColors[stockLevel]}`}>{product.quantity} units</div>
                </div>
              })}
            </div>
          </div>
          {/*  Effiency chart */}
          <EfficiencyChart
            inStock={inStockPercenatage}
            lowStock={lowStockPercentage}
            outOfStock={outofStockPercentage}
          />
        </div>
      </main>

    </div>
  )
}

export default InventoryDashboardPage;