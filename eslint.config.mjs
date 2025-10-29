import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
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
      "@typescript-eslint/no-explicit-any": "off",        // 關掉 any 警告
      "@typescript-eslint/no-unused-vars": "warn",        // 未使用變數僅警告，不阻斷編譯
      "prefer-const": "off",                              // 關掉 const 警告
      "react-hooks/rules-of-hooks": "off",                // 關掉 React Hooks 錯誤
      "no-warning-comments": "off",                       // 關掉 TODO/FIXME 型註警告
      "@next/next/no-img-element": "warn",                // img 用法僅警告，不阻斷
    },
  },
];
