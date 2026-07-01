/** @type {import('next').NextConfig} */
const nextConfig = {
  // standalone solo para builds Docker — Vercel usa su propio sistema
  ...(process.env.BUILD_STANDALONE === "1" && { output: "standalone" }),
};

export default nextConfig;
