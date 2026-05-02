/** @type {import('next').NextConfig} */
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/media-proxy/:path*',
        destination: `${apiBaseUrl}/media/:path*`,
      },
      {
        source: '/api/usuarios/:id/perfil-publico',
        destination: `${apiBaseUrl}/api/usuarios/:id/perfil-publico/`,
      },
      {
        source: '/api/:path*/',
        destination: `${apiBaseUrl}/api/:path*/`,
      },
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/api/:path*`,
      },
    ]
  },
};

export default nextConfig;
