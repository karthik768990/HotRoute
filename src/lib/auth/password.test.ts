import {describe,it,expect} from "vitest"
import { hashPassword,verifyPassword } from "./password" 


describe("Password Module ",()=>{
    describe("hashPassword()",()=>{
        it("should return a hashed value",async ()=>{
            const password = 'password';
            const hashedPassword = await hashPassword(password)
            expect(hashedPassword).toBeTruthy()
        });

        it("should not return the original password",async()=>{
            const password = 'password123'
            const hashedPassword = await hashPassword(password)

            expect(hashedPassword).not.toBe(password)
        });
        
        it("should generate different hashed for the same password",async()=>{
            const password = 'password123'
            const hash1 = await hashPassword(password)
            const hash2 = await hashPassword(password)

            expect(hash1).not.toBe(hash2)

        });
    })



    describe("verifyPassword()",()=>{
        it("should validate the correct password"),async ()=>{
            const password = 'password123'
            const hashedPassword = await hashPassword(password)
            const isValid = await verifyPassword(password,hashedPassword)

            expect(isValid).toBe(true)
        }

    })
        it("should reject the incorrect password",async ()=>{
            const password = 'password'
            const hashedPassword  = await hashPassword(password)

            const isValid= await verifyPassword("passsword",hashedPassword)
            expect(isValid).toBe(false)

        })

        it("should reject passwords with different casing",async()=>{
            const password = 'password'
            const hashedPassword= await hashPassword(password)
            const isValid = await verifyPassword('paSsword',hashedPassword)
            expect(isValid).toBe(false)
        })
        

    })