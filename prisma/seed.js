import { PrismaClient } from '../app/generated/prisma/index.js'



const prisma = new PrismaClient();

async function main() {
    const demoUserId = "4e43d69e-6909-4022-80ad-abb0f8d5aabd";

    await prisma.product.createMany({
        data: Array.from({length: 25}).map((_, index) => ({
           userId: demoUserId,
           name: `Product ${index + 1}`,
           price:(Math.random()*90+10).toFixed(2),
           quantity: Math.floor(Math.random()*20),
           lowStockAt:5,
           createdAt: new Date(Date.now() - 1000*60*60*24*(index*5))
        })),
    })

    console.log("Seeding completed.");
    console.log("Added 25 products for demo user:", demoUserId);
}

main()
   .catch((e)=>{
         console.error(e);
         process.exit(1);
   })
   .finally(async ()=>{
         await prisma.$disconnect();
   });