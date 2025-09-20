export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  WEB_PORT: process.env.WEB_PORT || "3000",
  CMS_URL: process.env.PAYLOAD_PUBLIC_SERVER_URL || "http://localhost:3001",
  CMS_API_URL: `${
    process.env.PAYLOAD_PUBLIC_SERVER_URL || "http://localhost:3001"
  }/api`,
} as const;
