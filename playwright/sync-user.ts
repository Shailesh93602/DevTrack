import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { config } from "dotenv";

// Load environment variables
config({ path: path.resolve(process.cwd(), ".env.local") });

const prisma = new PrismaClient();
const authFile = path.resolve(process.cwd(), "playwright/.auth/user.json");

async function syncUser() {
  console.log("Starting user synchronization...");

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const testUserEmail =
      process.env.PLAYWRIGHT_TEST_USER_EMAIL || "devtrack.e2e.test@gmail.com";
    const testUserPassword =
      process.env.PLAYWRIGHT_TEST_USER_PASSWORD || "TestPassword123!";

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 1. Sign in to Supabase to get the session
    console.log(`Signing in as ${testUserEmail}...`);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testUserEmail,
      password: testUserPassword,
    });

    if (error) throw error;
    if (!data.session) throw new Error("No session returned from Supabase");

    // 2. Prepare the storage state
    const storageState = {
      cookies: [],
      origins: [
        {
          origin: new URL(supabaseUrl).origin,
          localStorage: [
            {
              name: `sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`,
              value: JSON.stringify(data.session),
            },
          ],
        },
      ],
    };

    // 3. Ensure directory exists
    const dir = path.dirname(authFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 4. Write the file
    fs.writeFileSync(authFile, JSON.stringify(storageState, null, 2));
    console.log(`Successfully synced user session to ${authFile}`);
  } catch (error) {
    console.error("Failed to sync user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

await syncUser();
