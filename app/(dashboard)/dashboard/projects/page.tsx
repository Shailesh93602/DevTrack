import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import { getProjects } from "@/lib/services/project";
import { ProjectForm } from "@/components/dashboard/ProjectForm";
import { ProjectList } from "@/components/dashboard/ProjectList";

import { serializeProject } from "@/lib/utils/serialization";

export default async function ProjectsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { projects } = await getProjects(user.id, { limit: 50, offset: 0 });
  const serializedProjects = projects.map(serializeProject);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground text-lg font-semibold">Projects</h2>
        <p className="text-muted-foreground text-sm">
          Manage your side projects and track milestones.
        </p>
      </div>

      <Separator />

      <Card className="border-border rounded-lg border shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Create Project</CardTitle>
          <CardDescription>Start tracking a new project.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm />
        </CardContent>
      </Card>

      <div>
        <h3 className="text-foreground mb-4 text-sm font-semibold">
          Your Projects
        </h3>
        <Card className="border-border rounded-lg border shadow-none">
          <CardContent className="px-6 py-0">
            <ProjectList projects={serializedProjects} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
