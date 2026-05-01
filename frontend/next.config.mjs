/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/media-proxy/:path*',
        destination: 'http://127.0.0.1:8000/media/:path*',
      },
      {
        source: '/api/usuarios/:id/perfil-publico',
        destination: 'http://127.0.0.1:8000/api/usuarios/:id/perfil-publico/',
      },
      {
        source: '/api/:path*/',
        destination: 'http://127.0.0.1:8000/api/:path*/',
      },
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*',
      },
    ]
  },
};

export default nextConfig;
