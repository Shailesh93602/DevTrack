import { redirect, notFound } from "next/navigation";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { ArrowLeft, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import { getProjectById } from "@/lib/services/project";
import { PROJECT_STATUS_CONFIG } from "@/lib/constants";
import { MilestoneList } from "@/components/dashboard/MilestoneList";
import { serializeMilestone } from "@/lib/utils/serialization";

interface ProjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const project = await getProjectById(user.id, id);
  if (!project) notFound();

  const status =
    PROJECT_STATUS_CONFIG[project.status as keyof typeof PROJECT_STATUS_CONFIG];
  const serializedMilestones = project.milestones.map(serializeMilestone);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
      </div>

      <div>
        <div className="flex items-center gap-3">
          <FolderKanban className="text-primary h-6 w-6" />
          <h2 className="text-foreground text-xl font-semibold">
            {project.name}
          </h2>
          <Badge variant={status.variant}>
            <div className={`mr-1.5 h-2 w-2 rounded-full ${status.dotClass}`} />
            {status.label}
          </Badge>
        </div>
        {project.description && (
          <p className="text-muted-foreground mt-2 text-sm">
            {project.description}
          </p>
        )}
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <MilestoneList
            projectId={project.id}
            milestones={serializedMilestones}
          />
        </div>

        <div className="space-y-6">
          <Card className="border-border rounded-lg border shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-muted-foreground text-xs">Progress</p>
                <p className="text-foreground text-2xl font-semibold">
                  {project.progress}%
                </p>
              </div>

              {project.techStack.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-2 text-xs">
                    Tech Stack
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {project.techStack.map((tech: string) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {project.dueDate && (
                <div>
                  <p className="text-muted-foreground text-xs">Due Date</p>
                  <p className="text-foreground text-sm">
                    {project.dueDate.toLocaleDateString("en-US", {
                      timeZone: "UTC",
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {project.activityLogs.length > 0 && (
            <Card className="border-border rounded-lg border shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.activityLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-start gap-2">
                      <div className="bg-muted mt-1.5 h-1.5 w-1.5 rounded-full" />
                      <div>
                        <p className="text-foreground text-sm">
                          {log.action.replaceAll("_", " ").toLowerCase()}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {log.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
