const { PrismaPg } = require('@prisma/adapter-pg'); const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL }); console.log(adapter);  
