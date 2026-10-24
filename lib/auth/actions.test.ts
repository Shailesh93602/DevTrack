import { beforeEach, describe, expect, it, vi } from "vitest";

const signUp = vi.fn();
const signInWithPassword = vi.fn();
const ensureUserInDb = vi.fn();

vi.mock("@/lib/auth/supabase-server", () => ({
  createServerSupabaseClient: async () => ({
    auth: { signUp, signInWithPassword },
  }),
}));
vi.mock("@/lib/services/user", () => ({ ensureUserInDb }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

const { login, signup } = await import("@/lib/auth/actions");

const EMAIL = "owner@example.com";

function signupForm(): FormData {
  const form = new FormData();
  form.set("email", EMAIL);
  form.set("password", "Attacker1pass");
  return form;
}

describe("signup with an email that already has an account", () => {
  beforeEach(() => {
    signUp.mockReset();
    signInWithPassword.mockReset();
    ensureUserInDb.mockReset();
    signInWithPassword.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });
  });

  // With email confirmation on, Supabase answers a repeat signup with a fake
  // user: a random id and no identities. ensureUserInDb matches on email and
  // re-keys the row to that id, which cascades the owner's data away.
  it("does not re-key the existing user row to Supabase's obfuscated id", async () => {
    signUp.mockResolvedValue({
      data: { user: { id: "fake-random-id", email: EMAIL, identities: [] } },
      error: null,
    });

    await signup({}, signupForm());

    expect(ensureUserInDb).not.toHaveBeenCalled();
  });

  it("still creates the row for a genuinely new account", async () => {
    signUp.mockResolvedValue({
      data: {
        user: {
          id: "new-user-id",
          email: EMAIL,
          identities: [{ id: "identity-1" }],
        },
      },
      error: null,
    });

    await signup({}, signupForm());

    expect(ensureUserInDb).toHaveBeenCalledWith("new-user-id", EMAIL);
  });
});

function credentialsForm(password: string): FormData {
  const form = new FormData();
  form.set("email", EMAIL);
  form.set("password", password);
  return form;
}

describe("password rules", () => {
  beforeEach(() => {
    signUp.mockReset();
    signInWithPassword.mockReset();
    signInWithPassword.mockResolvedValue({ error: null });
  });

  // Accounts created before the strength rules existed must still sign in.
  it("login accepts a password that fails the signup strength rules", async () => {
    await expect(login({}, credentialsForm("weak"))).rejects.toThrow(
      "NEXT_REDIRECT"
    );
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: EMAIL,
      password: "weak",
    });
  });

  it("login still rejects an empty password", async () => {
    const result = await login({}, credentialsForm(""));
    expect(result.error).toBeTruthy();
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("signup still enforces the strength rules", async () => {
    const result = await signup({}, credentialsForm("weak"));
    expect(result.error).toBeTruthy();
    expect(signUp).not.toHaveBeenCalled();
  });
});
