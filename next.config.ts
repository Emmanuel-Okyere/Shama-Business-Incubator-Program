import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The cluster artwork is our own SVG, served from /public. Next refuses to
    // optimise SVG by default because a hostile one can carry script; these
    // headers neutralise that for the ones we do allow.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
