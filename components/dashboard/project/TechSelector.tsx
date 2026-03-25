import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type UseFormSetValue } from "react-hook-form";
import { type CreateProjectInput } from "@/lib/validations";

interface TechSelectorProps {
  techStack: string[];
  techInput: string;
  setTechInput: (val: string) => void;
  addTech: (current: string[], setValue: UseFormSetValue<CreateProjectInput>) => void;
  removeTech: (index: number, current: string[], setValue: UseFormSetValue<CreateProjectInput>) => void;
  setValue: UseFormSetValue<CreateProjectInput>;
  maxTech: number;
}

export function TechSelector({
  techStack,
  techInput,
  setTechInput,
  addTech,
  removeTech,
  setValue,
  maxTech,
}: TechSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Tech Stack</Label>
      <div className="flex gap-2">
        <Input
          value={techInput}
          onChange={(e) => setTechInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTech(techStack, setValue);
            }
          }}
          placeholder={`Add technology (max ${maxTech})`}
          aria-label="Tech stack input"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => addTech(techStack, setValue)}
          aria-label="Add tech"
        >
          Add
        </Button>
      </div>
      <ul className="flex flex-wrap gap-1" aria-label="Selected technologies">
        {techStack.map((tech, index) => (
          <li
            key={`${tech}-${index}`}
            className="bg-muted inline-flex items-center gap-1 rounded px-2 py-1 text-xs"
          >
            {tech}
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => removeTech(index, techStack, setValue)}
              className="text-muted-foreground hover:text-foreground h-auto p-0"
              aria-label={`Remove ${tech}`}
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
