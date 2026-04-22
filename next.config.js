/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
  async headers() {
    const isProd = process.env.NODE_ENV === "production";
    const scriptSrc = [
      "'self'",
      "'unsafe-inline'",
      ...(isProd ? [] : ["'unsafe-eval'"]),
      "https://va.vercel-scripts.com",
      "https://vercel.live",
    ].join(" ");
    const security = [
      { key: "X-DNS-Prefetch-Control", value: "on" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ...(isProd ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" }] : []),
      {
        key: "Permissions-Policy",
        value:
          "camera=(), microphone=(), geolocation=(self), interest-cohort=(), payment=(self), usb=(), browsing-topics=()",
      },
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          `script-src ${scriptSrc}`,
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https:",
          "font-src 'self' data:",
          "connect-src 'self' https: wss:",
          "object-src 'none'",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join("; "),
      },
    ];
    return [
      { source: "/:path*", headers: security },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/photos/**',
      },
    ],
  },
};

module.exports = nextConfig;
