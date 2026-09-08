import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 defaults this to [75] and silently coerces anything else to the
    // nearest allowed value, so the header photographs were being re-encoded
    // at 75 regardless of the quality prop.
    qualities: [75, 86],
    // The cluster artwork is our own SVG, served from /public. Next refuses to
    // optimise SVG by default because a hostile one can carry script; these
    // headers neutralise that for the ones we do allow.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
