import { describe, expect, it } from "vitest";
import { generateJWTToken, verifyToken } from "./jwt";

process.env.JWT_SECRET_KEY = "test-secret-key-for-vitest";



describe("JWT Module", () => {
    describe('generateJWTToken()', () => {
        it('should check token exist', () => {
            const userId = 'xvhbjwnmgrdiuhjnmerdfbhjndrfjnm'
            const token = generateJWTToken(userId)
            expect(token).not.toBe("")
        })

        it('should check token is a string', () => {
            const userId = 'xvhbjwnmgrdiuhjnmerdfbhjndrfjnm'
            const token = generateJWTToken(userId)
            const tokenType = typeof token
            expect(tokenType).toBe('string')
        })
        it("should check token is not empty", () => {

            const userId = 'xvhbjwnmgrdiuhjnmerdfbhjndrfjnm'
            const token = generateJWTToken(userId)
            expect(token).not.toBe("")

        })

    })

    describe("verifyToken()", () => {
        it('should verify a valid token', () => {
            const userId = 'xvhbjwnmgrdiuhjnmerdfbhjndrfjnm'
            const token = generateJWTToken(userId)
            const payLoad = verifyToken(token)
            expect(payLoad.userId).toBe(userId)
        })

        it('should reject a malformed token', () => {
            expect(() => {
                verifyToken("this-is-not-a-jwt");
            }).toThrow();
        })

        it('should reject a tampered token', () => {
            const userId = 'xvhbjwnmgrdiuhjnmerdfbhjndrfjnm'
            const token = generateJWTToken(userId)
            const tamperedToken = token + 'abc'
            expect(() => {
                verifyToken(tamperedToken);
            }).toThrow();
        })
    })
})