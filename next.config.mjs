/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/register",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig