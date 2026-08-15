/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Ini untuk mengabaikan error TypeScript saat build
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;