"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { useAuthForm } from "@/hooks/useAuthForm";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .pipe(z.string().email("Please enter a valid email address")),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .pipe(z.string().email("Please enter a valid email address")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one digit"),
});

interface AuthFormProps {
  mode: "login" | "signup";
}

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

export function AuthForm({ mode }: AuthFormProps) {
  const { serverError, isPending, onSubmit } = useAuthForm(mode);

  const schema = mode === "login" ? loginSchema : signupSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData | SignupFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const submitLabel = (() => {
    if (isPending) return "Loading...";
    return mode === "login" ? "Sign in" : "Create account";
  })();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Email
        </label>
        <Input
          id="email"
          type="text"
          inputMode="email"
          placeholder="you@example.com"
          autoComplete="email"
          className="h-11"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-destructive text-sm">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <PasswordInput
          id="password"
          label={mode === "login" ? "Password" : "Create password"}
          placeholder="••••••••"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="h-11"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-destructive text-sm">{errors.password.message}</p>
        )}
        {mode === "signup" && !errors.password && (
          <ul className="text-muted-foreground ml-1 space-y-1 text-xs">
            <li>• At least 8 characters</li>
            <li>• One uppercase letter</li>
            <li>• One lowercase letter</li>
            <li>• One number</li>
          </ul>
        )}
      </div>

      {serverError && (
        <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
          {serverError}
        </div>
      )}

      <Button
        type="submit"
        className="h-11 w-full font-medium"
        disabled={isPending}
      >
        {submitLabel}
      </Button>
    </form>
  );
}
