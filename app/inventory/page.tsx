import Sidebar from "@/components/sidebar"
import prisma from "../lib/prisma"
import { getCurrentUser } from "../lib/auth";
import { deleteProduct } from "../lib/actions/products";



const Inventory = async ({ }) => {
    const user = await getCurrentUser();
    const totalProducts = await prisma.product.findMany({ where: { userId: user.id } })

    return <div className="min-h-screen bg-gray-50">
           <Sidebar currentPath="/inventory" />
           <main className="ml-64 p-8">
             <div className="mb-8">
               <div className="flex items-center justify-between">
                 <div>
                    <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
                    <p className="text-sm text-gray-500">Manage your ietms and track inventory levels.</p>
                 </div>
               </div>
             </div>

             <div className="space-y-6">


                {/* Product table */}
                <div className=" bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full">
                       <thead className="bg-gray-50">
                           <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Low Stock At</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                           </tr>
                       </thead>
                       <tbody className="bg-white divide-y divide-gray-200">
                         {totalProducts.map((item:any,key:any)=>{
                          return  <tr key={key} className="hover:bg-gray-50">
                            <td className="px-6 py-4  text-sm  text-gray-500" >{item.name}</td>
                            <td className="px-6 py-4  text-sm  text-gray-500" >{item.sku || "-"}</td>
                            <td className="px-6 py-4  text-sm  text-gray-500" >&#8377;{Number(item.price).toFixed(2)}</td>
                            <td className="px-6 py-4  text-sm  text-gray-500" >{item.quantity}</td>
                            <td className="px-6 py-4  text-sm  text-gray-500" >{item.lowStockAt || "-" }</td>
                            <td className="px-6 py-4  text-sm  text-gray-500">
                                 <form action={async (formData:FormData)=>{
                                    "use server"
                                   await deleteProduct(formData);
                                 }}>
                                    <input type="hidden" name="id" value={item.id} />
                                    <button className="text-red-600 hover:text-red-900 cursor-pointer">Delete</button>
                                 </form>
                            </td>
                            </tr>
                         })}
                       </tbody>
                    </table>
                </div>

             </div>

           </main>
    </div>
}

export default Inventory