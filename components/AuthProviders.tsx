'use client';

import { getProviders, signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Button from './Button';

type Provider = {
   id: string;
   name: string;
   type: string;
   signInUrl: string;
   callBackUrl: string;
   signInUrlParams?: Record<string, string> | undefined; // optional
};

type Providers = Record<string, Provider>;

const AuthProviders = () => {
   const [providers, setProviders] = useState<Providers | null>(null); // Provide type (feature of typescript)

   useEffect(() => {
      const fetchProviders = async () => {
         const res = await getProviders();
         setProviders(res);
      };

      fetchProviders();
   }, []);

   if (providers) {
      return (
         <div>
            {Object.values(providers).map((provider: Provider, i) => (
               <Button
                  key={i}
                  title='Sign In'
                  handleClick={() => signIn(provider?.id)}
               />
            ))}
         </div>
      );
   }
};

export default AuthProviders;
