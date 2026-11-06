/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "ffmpeg-static",
      "@aws-sdk/client-s3",
      "@aws-sdk/s3-request-presigner",
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), "ffmpeg-static"];
    }
    return config;
  },
  async redirects() {
    return [
      {
        source: "/dashboard/agency/:path*",
        destination: "/dashboard",
        permanent: false,
      },
      {
        source: "/dashboard/agency",
        destination: "/dashboard",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
