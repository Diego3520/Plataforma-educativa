import passport from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile, VerifyCallback } from 'passport-google-oauth20';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';

// Google Strategy
passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken: string, refreshToken: string, profile: GoogleProfile, done: VerifyCallback) => {
        return done(null, profile);
    }
));

// Microsoft Strategy
passport.use(new MicrosoftStrategy({
        clientID: process.env.MICROSOFT_CLIENT_ID!,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
        callbackURL: process.env.MICROSOFT_CALLBACK_URL!,
        scope: ['user.read'],
    },
    async (accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) => {
        return done(null, profile);
    }
));

passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((obj, done) => {
    done(null, obj as any);
});

export default passport;
