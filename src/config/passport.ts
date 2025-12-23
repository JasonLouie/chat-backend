import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { ExtractJwt, Strategy as JWTStrategy } from "passport-jwt";
import type { Request } from "express";
import { AuthService } from "../services/AuthService.js";

const authService = new AuthService;

// Local strategy for logging in
passport.use(new LocalStrategy({ session: false }, async (username, password, done) => {
    try {
        const user = await authService.login(username, password);
        if (!user) return done(null, false, { message: "Invalid credentials" });
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

// JWT Strategy for verifying access token
function cookieExtractor (req: Request) {
    return req?.cookies?.["accessToken"] || null;
}

passport.use(new JWTStrategy(
    { jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
    ]),
    secretOrKey: process.env.TOKEN_SECRET!
    },
    async (jwtPayload, done) => {
        try {
            const user = await authService.findUserById(jwtPayload.sub);
            if (!user) return done(null, false);
            return done(null, user);
        } catch (err) {
            return done(err, false);
        }
    }
));