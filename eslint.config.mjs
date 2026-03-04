import nextConfig from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: [".next/", "node_modules/", "public/", "prisma/migrate-pg-to-mongo.ts"],
  },
  {
    rules: {
      // Allow unused vars prefixed with _ (common pattern for intentionally ignored params)
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
];

export default eslintConfig;
