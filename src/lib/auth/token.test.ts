import { describe,expect,it } from "vitest";
import { generateExpiry,isTokenExpired,generateVerificationToken } from "./token";


describe("token module",()=>{
    describe('generateVerificationToken()',() =>{
        it('should generate a token',()=>{
            const tokenGenerated = generateVerificationToken();
            expect(tokenGenerated).not.toBe('')
        })
        it("should return a string",()=>{
            const tokenGenerated = generateVerificationToken();
            const typeOfTokenGenerated = typeof tokenGenerated
            expect(typeOfTokenGenerated).toBe('string')
        })

        it('should generate unique tokens',()=>{
            const token1 = generateVerificationToken()
            const token2 = generateVerificationToken()

            expect(token1).not.toBe(token2)
        })
    })

    describe('generateExpiry()',()=>{
        const currentTime = new Date("2026-06-09T10:00:00Z");
        it('should return a future date',()=>{
            const expiryDate = generateExpiry(1,currentTime)
            const isValid = expiryDate>currentTime
            expect(isValid).toBe(true)
        })

        it('should correctly add hours',()=>{
            const expiryDate = generateExpiry(8,currentTime)
            const currentDate = new Date(currentTime)
            currentDate.setHours(currentDate.getHours()+8)
            const isValid = currentDate.getTime() === expiryDate.getTime()
            expect(isValid).toBe(true)
        })

        it('should go past for negative hours',()=>{
            const expiryDate = generateExpiry(-8,currentTime)
            const currentDate = new Date(currentTime)
            currentDate.setHours(currentDate.getHours()-8)
            const isValid = currentDate.getTime() === expiryDate.getTime()
            expect(isValid).toBe(true)
        })

    })


    describe('isTokenExpired',()=>{
            it("should return false for a valid token", () => {

        const futureDate = new Date();

        futureDate.setHours(
        futureDate.getHours() + 1
        );

        const isExpired =
        isTokenExpired(futureDate);

        expect(isExpired).toBe(false);

        });

        it("should return true for an expired token", () => {

        const pastDate = new Date();

        pastDate.setHours(
        pastDate.getHours() - 1
        );

        const isExpired =
        isTokenExpired(pastDate);

        expect(isExpired).toBe(true);

        });


    })
})