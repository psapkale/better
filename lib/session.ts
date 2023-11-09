import { getServerSession } from 'next-auth/next';
import { NextAuthOptions, User } from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';
import GoogleProvider from 'next-auth/providers/google';
import jsonwebtoken from 'jsonwebtoken';
import { JWT } from 'next-auth/jwt';
import { SessionInterface, UserProfile } from '@/common.types';
import { createUser, getUser } from './actions';

export const authOptions: NextAuthOptions = {
   // authOptions of type NextAuthOptions
   providers: [
      GoogleProvider({
         clientId: process.env.GOOGLE_CLIENT_ID!, // Can be undefined
         clientSecret: process.env.GOOGLE_CLIENT_SECRET!, // Can be undefined
      }),
   ],
   jwt: {
      encode: ({ secret, token }) => {
         const encodedToken = jsonwebtoken.sign(
            {
               ...token,
               iss: 'grafbase',
               exp: Math.floor(Date.now() / 1000) * 60 * 60,
            },
            secret
         );

         return encodedToken;
      },
      decode: async ({ secret, token }) => {
         const decodedToken = jsonwebtoken.verify(token!, secret);

         return decodedToken as JWT;
      },
   },
   theme: {
      colorScheme: 'light',
      logo: '/logo.png',
   },
   callbacks: {
      // Callback function every time user visits the page
      async session({ session }) {
         // Google user only have name, email and avatarUrl
         // But db user have projects, description, githubUrl, linkedinUrl ...
         // So we need to convert Google user to db user

         const email = session?.user?.email as string;

         try {
            const data = (await getUser(email)) as { user?: UserProfile };

            const newSession = {
               ...session,
               user: {
                  ...session.user,
                  ...data?.user,
               }, // Here we are connecting the Google user to the db user
            };
            return newSession;
         } catch (error) {
            console.log('Error retrieving user data', error);
            // Session is always expected to return a session
            return session;
         }
      },

      // Callback function every time user logges in
      async signIn({ user }: { user: AdapterUser | User }) {
         try {
            // get the user if they exist
            const userExists = (await getUser(user?.email as string)) as {
               user?: UserProfile;
            };

            // if they don't exist, create them
            if (!userExists.user) {
               await createUser(
                  user.name as string,
                  user.email as string,
                  user.image as string
               );
            }

            return true;
         } catch (error) {
            console.log(error);
            return false;
         }
      },
   },
};

export async function getCurrentUser() {
   const session = (await getServerSession(authOptions)) as SessionInterface;

   return session;
}
