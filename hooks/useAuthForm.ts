import { useState } from "react";
import { login, signup } from "@/lib/auth/actions";

export function useAuthForm(mode: "login" | "signup") {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (data: { email: string; password: string }) => {
    setServerError(null);
    setIsPending(true);

    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);

    const action = mode === "login" ? login : signup;
    const result = await action({}, formData);

    setIsPending(false);

    if (result?.error) {
      setServerError(result.error);
    }

    return result;
  };

  const clearServerError = () => setServerError(null);

  return {
    serverError,
    isPending,
    onSubmit,
    clearServerError,
  };
}
