import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // keep Next.js + TS defaults
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],

    rules: {
      // --- General relaxed rules ---
      "@typescript-eslint/no-unused-vars": [
        "off", // disable warnings for unused vars
      ],
      "@typescript-eslint/no-explicit-any": "off", // allow `any`
      "@typescript-eslint/no-empty-object-type": "off", // allow `{}` type
      "react-hooks/exhaustive-deps": "off", // disable missing deps warnings
      "react/no-unescaped-entities": "off", // allow unescaped quotes in JSX
      "@next/next/no-img-element": "off", // allow <img> tags instead of <Image />

      // optional — suppress annoying react-hooks warnings globally
      "react-hooks/rules-of-hooks": "warn",

      // optional — allow unused imports in dev
      "no-unused-vars": "off",
      "no-console": "off",
    },
  },
];

export default eslintConfig;


// import { dirname } from "path";
// import { fileURLToPath } from "url";
// import { FlatCompat } from "@eslint/eslintrc";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const compat = new FlatCompat({
//   baseDirectory: __dirname,
// });

// const eslintConfig = [
//   ...compat.extends("next/core-web-vitals", "next/typescript"),
//   {
//     ignores: [
//       "node_modules/**",
//       ".next/**",
//       "out/**",
//       "build/**",
//       "next-env.d.ts",
//     ],
//   },
// ];

// export default eslintConfig;
