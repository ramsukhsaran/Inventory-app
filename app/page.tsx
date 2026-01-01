import Link from "next/link";

const Home = () => {
   
  return (
    <div className='min-h-screen bg-linear-to-br from-purple-400 via-pink-500 to-red-500 flex flex-col items-center justify-center'>
    <div className="container mx-auto px-4 py-16">
        <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Inventory Management System
            </h1>
            <p className="text-lg text-gray-700 mb-8">
              Welcome to the Inventory Management System. Manage your products efficiently and effectively.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/sign-in" className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors">Sign-in</Link>
            
              <Link href="#" className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold transition-colors">Learn More</Link>
           
            </div>
        </div>
    </div>
    </div>
  )
}
export default Home;
