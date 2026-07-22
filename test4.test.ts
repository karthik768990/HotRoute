import { test, expect } from 'vitest'; import prisma from './src/lib/prisma'; test('db', async () = console.log(await prisma.user.findMany()); expect(1).toBe(1); });  
