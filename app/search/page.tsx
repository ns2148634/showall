"use client";

import { Suspense } from "react";
import SearchPage from "./SearchPage";

export default function Page() {
  return (
    <Suspense fallback={<div>搜尋頁載入中...</div>}>
      <SearchPage />
    </Suspense>
  );
}
