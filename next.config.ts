import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Adicionado para suportar `node-gyp` dependências como `pdf-parse`
    if (!isServer) {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            "fs": false
        };
    }
    config.externals.push('node-gyp');
    config.externals.push('pdf-parse');
    
    return config;
  },
};

export default nextConfig;
