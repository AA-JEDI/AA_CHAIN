/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config) => {
        // Fix for wagmi/viem dynamic imports
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            net: false,
            tls: false,
        };
        // Ignore problematic modules
        config.externals.push('pino-pretty', 'lokijs', 'encoding');
        return config;
    },
}

export default nextConfig
