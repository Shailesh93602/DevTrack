"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  completedAt: string | null;
  order: number;
}

interface MilestoneListProps {
  projectId: string;
  milestones: Milestone[];
}

export function MilestoneList({ projectId, milestones }: MilestoneListProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/project/${projectId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          order: milestones.length,
        }),
      });

      if (!response.ok) throw new Error("Failed to add milestone");

      setNewTitle("");
      setIsAdding(false);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggle(milestoneId: string, isCompleted: boolean) {
    if (isCompleted) return; // Already completed

    setTogglingId(milestoneId);
    try {
      const response = await fetch(
        `/api/project/${projectId}/milestones/${milestoneId}/complete`,
        { method: "POST" }
      );

      if (!response.ok) throw new Error("Failed to complete milestone");
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(milestoneId: string) {
    setDeletingId(milestoneId);
    try {
      const response = await fetch(
        `/api/project/${projectId}/milestones/${milestoneId}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to delete milestone");
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  }

  const completedCount = milestones.filter((m) => m.completedAt).length;
  const progress =
    milestones.length > 0
      ? Math.round((completedCount / milestones.length) * 100)
      : 0;

  return (
    <Card className="border-border rounded-lg border shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Milestones</CardTitle>
          <Badge variant="secondary">
            {completedCount}/{milestones.length}
          </Badge>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="bg-muted h-2 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {milestones.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-sm">
            No milestones yet. Add your first milestone to track progress.
          </p>
        ) : (
          <div className="space-y-2">
            {milestones.map((milestone) => {
              const isCompleted = !!milestone.completedAt;
              return (
                <div
                  key={milestone.id}
                  className="border-border flex items-start gap-3 rounded-md border p-3"
                >
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={() =>
                      handleToggle(milestone.id, isCompleted)
                    }
                    disabled={isCompleted || togglingId === milestone.id}
                    className="mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <CheckCircle2 className="text-primary h-4 w-4" />
                      ) : (
                        <Circle className="text-muted-foreground h-4 w-4" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          isCompleted
                            ? "text-muted-foreground line-through"
                            : "text-foreground"
                        }`}
                      >
                        {milestone.title}
                      </span>
                    </div>
                    {milestone.description && (
                      <p className="text-muted-foreground mt-1 text-xs">
                        {milestone.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(milestone.id)}
                    disabled={deletingId === milestone.id}
                    className="text-muted-foreground hover:text-destructive h-auto p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {isAdding ? (
          <form onSubmit={handleAdd} className="space-y-3 pt-2">
            <div className="space-y-2">
              <Label htmlFor="milestone-title">Milestone Title</Label>
              <Input
                id="milestone-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Design database schema"
                disabled={isSubmitting}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting || !newTitle.trim()}>
                {isSubmitting ? "Adding..." : "Add Milestone"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsAdding(false);
                  setNewTitle("");
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Milestone
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
