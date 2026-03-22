import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import path from "node:path";

// Load .env.local so env vars are available outside Next.js runtime
config({ path: path.resolve(process.cwd(), ".env.local") });

export const TEST_USER = {
  email: "devtrack.e2e.test@gmail.com",
  password: "TestPassword123!",
};

export default async function globalSetup() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn(
      "[global-setup] SUPABASE_SERVICE_ROLE_KEY not set — skipping test user setup. Tests will likely fail."
    );
    return;
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Delete all existing test users to start clean
  const { data: users, error: listError } = await adminClient.auth.admin.listUsers();
  if (listError) {
    console.warn("[global-setup] Could not list users:", listError.message);
    return;
  }

  const staleUsers = users.users.filter(
    (u) => u.email?.startsWith("devtrack.e2e.") && u.email.endsWith("@gmail.com")
  );
  for (const user of staleUsers) {
    const { error } = await adminClient.auth.admin.deleteUser(user.id);
    if (error) {
      console.warn(`[global-setup] Could not delete ${user.email}:`, error.message);
    } else {
      console.log("[global-setup] Deleted test user:", user.email);
    }
  }

  // Pre-create the test user as email-confirmed so tests never need to send real emails
  const { error: createError } = await adminClient.auth.admin.createUser({
    email: TEST_USER.email,
    password: TEST_USER.password,
    email_confirm: true,
  });

  if (createError) {
    console.warn("[global-setup] Could not pre-create test user:", createError.message);
  } else {
    console.log("[global-setup] Pre-created confirmed test user:", TEST_USER.email);
  }
}
