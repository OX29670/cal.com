const { withAxiom } = require("next-axiom");
const { withSentryConfig } = require("@sentry/nextjs");

const plugins = [withAxiom];

/** @type {import("next").NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
    env: {
    GOOGLE_CLIENT_ID: '758394206603-4gqllatk9qndjb804to5seotpu3v89ua.apps.googleusercontent.com',
    GOOGLE_CLIENT_SECRET: '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',
    NEXT_PUBLIC_GOOGLE_CALLBACK_URL: 'https://cal-production-8042.up.railway.app/api/auth/callback/google',
  },
  transpilePackages: [
    "@calcom/app-store",
    "@calcom/dayjs",
    "@calcom/emails",
    "@calcom/features",
    "@calcom/lib",
    "@calcom/prisma",
    "@calcom/trpc",
  ],
  async headers() {
    return [
      {
        source: "/docs",
        headers: [
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, OPTIONS, PATCH, DELETE, POST, PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Content-Type, api_key, Authorization",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return {
      afterFiles: [
        // This redirects requests received at / the root to the /api/ folder.
        {
          source: "/v:version/:rest*",
          destination: "/api/v:version/:rest*",
        },
        {
          source: "/api/v2",
          destination: `${process.env.NEXT_PUBLIC_API_V2_ROOT_URL}/health`,
        },
        {
          source: "/api/v2/health",
          destination: `${process.env.NEXT_PUBLIC_API_V2_ROOT_URL}/health`,
        },
        {
          source: "/api/v2/docs/:path*",
          destination: `${process.env.NEXT_PUBLIC_API_V2_ROOT_URL}/docs/:path*`,
        },
        {
          source: "/api/v2/:path*",
          destination: `${process.env.NEXT_PUBLIC_API_V2_ROOT_URL}/api/v2/:path*`,
        },
        // This redirects requests to api/v*/ to /api/ passing version as a query parameter.
        {
          source: "/api/v:version/:rest*",
          destination: "/api/:rest*?version=:version",
        },
        // Keeps backwards compatibility with old webhook URLs
        {
          source: "/api/hooks/:rest*",
          destination: "/api/webhooks/:rest*",
        },
      ],
      fallback: [
        // These rewrites are checked after both pages/public files
        // and dynamic routes are checked
        {
          source: "/:path*",
          destination: `/api/:path*`,
        },
      ],
    };
  },
};

if (!!process.env.NEXT_PUBLIC_SENTRY_DSN) {
  plugins.push((nextConfig) =>
    withSentryConfig(nextConfig, {
      autoInstrumentServerFunctions: true,
      hideSourceMaps: true,
    })
  );
}

module.exports = () => plugins.reduce((acc, next) => next(acc), nextConfig);
