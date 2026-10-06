/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // The site does not use next/image. Turning the optimizer off removes the
    // /_next/image endpoint (and its attack surface); the old config allowed
    // proxying images from any https host.
    unoptimized: true,
  },
}

module.exports = nextConfig
