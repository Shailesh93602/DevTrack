import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import { getDsaProblems } from "@/lib/services/dsa-problem";
import { DsaProblemForm } from "@/components/dashboard/DsaProblemForm";
import { DsaProblemList, type DsaProblem } from "@/components/dashboard/DsaProblemList";

type RawProblem = {
  id: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  pattern: string;
  platform: string;
  solvedAt: Date;
};

function serializeProblem(problem: RawProblem): DsaProblem {
  return {
    id: problem.id,
    title: problem.title,
    difficulty: problem.difficulty,
    pattern: problem.pattern,
    platform: problem.platform,
    solvedAt: problem.solvedAt.toISOString(),
  };
}

export default async function DsaProblemsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { problems } = await getDsaProblems(user.id, { limit: 50, offset: 0 });

  const serializedProblems = problems.map(serializeProblem);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">DSA Problems</h2>
        <p className="text-sm text-muted-foreground">
          Track the problems you solve and patterns you learn.
        </p>
      </div>

      <Separator />

      <Card className="rounded-lg border border-border shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Add Problem</CardTitle>
          <CardDescription>Log a new problem you solved.</CardDescription>
        </CardHeader>
        <CardContent>
          <DsaProblemForm />
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-4 text-sm font-semibold text-foreground">Problems</h3>
        <Card className="rounded-lg border border-border shadow-none">
          <CardContent className="px-6 py-0">
            <DsaProblemList problems={serializedProblems} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
