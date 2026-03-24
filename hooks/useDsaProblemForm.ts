import { useState } from "react";
import { useRouter } from "next/navigation";

export function useDsaProblemForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const clearErrors = () => {
    setSubmitError(null);
  };

  return {
    submitError,
    setSubmitError,
    clearErrors,
    router,
  };
}
