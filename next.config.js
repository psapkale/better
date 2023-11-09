/** @type {import('next').NextConfig} */
const nextConfig = {
   images: {
      domains: ['lh3.googleusercontent.com', 'res.cloudinary.com'],
   },
   experimentals: {
      serverComponentsExternalPackages: ['cloudinay', 'graphql-request'],
   },
};

module.exports = nextConfig;
