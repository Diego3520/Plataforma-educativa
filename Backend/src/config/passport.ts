import passport, { Profile as PassportProfile } from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from 'passport-google-oauth20';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import dotenv from 'dotenv';
dotenv.config();

// Logs detallados para debugging
console.log('=== Configuración Microsoft OAuth ===');
console.log('BACKEND_URL:', process.env.BACKEND_URL);
console.log('MICROSOFT_CALLBACK_URL:', process.env.MICROSOFT_CALLBACK_URL);
console.log('URL Final:', process.env.MICROSOFT_CALLBACK_URL || `${process.env.BACKEND_URL}/api/auth/microsoft/callback`);
console.log('===============================');
console.log('Microsoft Callback URL:', process.env.MICROSOFT_CALLBACK_URL || `${process.env.BACKEND_URL}/api/auth/microsoft/callback`);

// Configurar Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
  scope: ['profile', 'email']
}, (_accessToken: string, _refreshToken: string, profile: GoogleProfile, done: (error: any, user?: any) => void) => {
  // Passport guardará el perfil en req.user
  return done(null, profile);
}));

// Logs de depuración
console.log('=== Configuración Microsoft OAuth ===');
console.log('MICROSOFT_CLIENT_ID:', process.env.MICROSOFT_CLIENT_ID);
console.log('CALLBACK_URL configurada:', process.env.MICROSOFT_CALLBACK_URL || `${process.env.BACKEND_URL}/api/auth/microsoft/callback`);

// Configurar Microsoft Strategy
passport.use(new MicrosoftStrategy({
  clientID: process.env.MICROSOFT_CLIENT_ID || '',
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
  callbackURL: process.env.MICROSOFT_CALLBACK_URL || `${process.env.BACKEND_URL}/api/auth/microsoft/callback`,
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