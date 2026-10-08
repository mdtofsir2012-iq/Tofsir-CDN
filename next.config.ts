import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  images:{
    domains:['lh3.googleusercontent.com', 'avatars.githubusercontent.com']
  },
  experimental:{
    staleTimes:{
      dynamic:300,
      static:3600
    },
    serverActions: {
      bodySizeLimit: '25mb'
    }
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key, Authorization" },
        ]
      }
    ]
  }
};

export default nextConfig;
