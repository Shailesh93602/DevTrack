"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { useAuthForm } from "@/hooks/useAuthForm";

import { loginSchema, signupSchema, type LoginFormData, type SignupFormData } from "@/lib/validations/auth";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const { serverError, successMessage, isPending, onSubmit } = useAuthForm(mode);

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
    <form
      method="POST"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(onSubmit)(e);
      }}
      className="space-y-4"
      noValidate
    >
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Email
        </label>
        <Input
          id="email"
          type="email"
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
        
        {mode === "login" && (
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        )}

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
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-md p-3 text-sm">
          {serverError}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-500/10 text-green-600 border border-green-500/20 rounded-md p-3 text-sm">
          {successMessage}
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
