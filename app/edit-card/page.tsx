import EditCardPage from "./EditCardPage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <EditCardPage />
    </Suspense>
  );
}
