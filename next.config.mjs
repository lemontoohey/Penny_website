/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  basePath: isProd ? '/camille_website' : '',
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fixes npm packages that depend on Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        module: false,
        v8: false,
        perf_hooks: false,
        child_process: false,
        worker_threads: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
      };
    }
    return config;
  },
};

export default nextConfig;
