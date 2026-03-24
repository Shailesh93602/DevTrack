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
import { analyzePatterns } from "@/lib/services/pattern-intelligence";
import { DsaProblemForm } from "@/components/dashboard/DsaProblemForm";
import { PaginatedProblemList } from "@/components/dashboard/PaginatedProblemList";
import { PatternIntelligencePanel } from "@/components/dashboard/PatternIntelligencePanel";

import { serializeProblem } from "@/lib/utils/serialization";

export default async function DsaProblemsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { problems, total } = await getDsaProblems(user.id, {
    limit: 10,
    offset: 0,
  });
  const patternAnalysis = await analyzePatterns(user.id);

  const serializedProblems = problems.map(serializeProblem);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground text-lg font-semibold">DSA Problems</h2>
        <p className="text-muted-foreground text-sm">
          Track the problems you solve and patterns you learn. ({total} total)
        </p>
      </div>

      <Separator />

      <Card className="border-border rounded-lg border shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Add Problem</CardTitle>
          <CardDescription>Log a new problem you solved.</CardDescription>
        </CardHeader>
        <CardContent>
          <DsaProblemForm />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h3 className="text-foreground mb-4 text-sm font-semibold">
            Problems
          </h3>
          <Card className="border-border rounded-lg border shadow-none">
            <CardContent className="px-6 py-0">
              <PaginatedProblemList initialProblems={serializedProblems} />
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="text-foreground mb-4 text-sm font-semibold">
            Pattern Insights
          </h3>
          <PatternIntelligencePanel analysis={patternAnalysis} />
        </div>
      </div>
    </div>
  );
}
