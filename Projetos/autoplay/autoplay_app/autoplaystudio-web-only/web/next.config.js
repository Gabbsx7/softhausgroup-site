/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  images: {
    domains: ['localhost', 'placehold.co', 'hgraqbucwvqkbbhhhtps.supabase.co'],
  },
  webpack: (config, { isServer, dev }) => {
    // Configurações para reduzir uso de memória durante build
    config.externals = config.externals || []
    if (isServer) {
      config.externals.push('canvas', 'konva', 'react-konva')
    }

    // Configurações mais agressivas de memória
    config.optimization = config.optimization || {}
    config.optimization.minimize = !dev
    config.optimization.splitChunks = {
      chunks: 'all',
      maxSize: 244000,
      cacheGroups: {
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: -10,
          chunks: 'all',
        },
      },
    }

    // Resolver para evitar problemas com SSR
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      fs: false,
      path: false,
    }

    return config
  },
}

module.exports = nextConfig
