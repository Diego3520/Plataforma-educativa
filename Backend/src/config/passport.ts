import passport, { Profile as PassportProfile } from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from 'passport-google-oauth20';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import dotenv from 'dotenv';
dotenv.config();

// Configurar Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || `${process.env.BACKEND_URL}/auth/google/callback`,
  scope: ['profile', 'email']
}, (_accessToken: string, _refreshToken: string, profile: GoogleProfile, done: (error: any, user?: any) => void) => {
  return done(null, profile);
}));

// Configurar Microsoft Strategy
passport.use(new MicrosoftStrategy({
  clientID: process.env.MICROSOFT_CLIENT_ID || '',
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
  callbackURL: process.env.MICROSOFT_CALLBACK_URL || `${process.env.BACKEND_URL}/auth/microsoft/callback`,
  scope: ['user.read', 'user.readbasic.all', 'mail.read']
}, (_accessToken: string, _refreshToken: string, profile: PassportProfile, done: (error: any, user?: any) => void) => {
  return done(null, profile);
}));

// Serializar y deserializar usuario
passport.serializeUser((user: any, done: (error: any, id?: any) => void) => {
  done(null, user);
});

passport.deserializeUser((obj: any, done: (error: any, user?: any) => void) => {
  done(null, obj);
});

export default passport;