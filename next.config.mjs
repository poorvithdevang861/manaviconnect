/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  // Old section URLs still arrive from notifications and shared links; query strings are passed through.
  async redirects() {
    return [
      { source: "/news", destination: "/updates?type=news", permanent: false },
      { source: "/stories", destination: "/updates?type=stories", permanent: false },
      { source: "/jobs", destination: "/career", permanent: false },
      { source: "/jobs/new", destination: "/career/new", permanent: false },
    ];
  },
};

export default nextConfig;
