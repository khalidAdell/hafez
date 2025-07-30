import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hafez.share.net.sa",
        pathname: "/uploads/all/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/ar",
        permanent: false,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
