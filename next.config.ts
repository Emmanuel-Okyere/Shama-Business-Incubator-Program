import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 defaults this to [75] and silently coerces anything else to the
    // nearest allowed value, so the header photographs were being re-encoded
    // at 75 regardless of the quality prop.
    qualities: [75, 86],
  },
};

export default nextConfig;
