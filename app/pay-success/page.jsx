import { Suspense } from "react";
import PaySuccessClient from "./PaySuccessClient";

export default function Page() {
  return (
    <Suspense>
      <PaySuccessClient />
    </Suspense>
  );
}
