/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    "ffmpeg-static",
    "@aws-sdk/client-s3",
    "@aws-sdk/s3-request-presigner",
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), "ffmpeg-static"];
    }
    return config;
  },
};

export default nextConfig;
