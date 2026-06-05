import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ connectionString: "postgresql://postgres:mysecretpassword@localhost:5432/fintrack_db?schema=public" });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear any existing records first to start clean
  await prisma.expense.deleteMany({});
  
  await prisma.expense.createMany({
    data: [
      { 
        amount: 50000, 
        category: "Makanan & Minuman", 
        description: "Makan siang nasi padang",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 hari lalu
      },
      { 
        amount: 25000, 
        category: "Transportasi", 
        description: "Ojek online ke kantor",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 hari lalu
      },
      { 
        amount: 120000, 
        category: "Belanja", 
        description: "Beli buku tulis & pulpen",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // kemarin
      },
      { 
        amount: 45000, 
        category: "Makanan & Minuman", 
        description: "Kopi latte sore",
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 jam lalu
      },
      { 
        amount: 15000, 
        category: "Transportasi", 
        description: "TransJakarta pulang",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 jam lalu
      }
    ]
  });
  console.log("Seed data inserted successfully!");
  await pool.end();
}

main().catch(console.error);
