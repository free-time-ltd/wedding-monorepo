import { Button } from "@repo/ui/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { CircleX } from "@repo/ui/icons";
import { ComponentProps } from "react";

interface Props extends ComponentProps<typeof Select> {
  families: Array<{
    id: number;
    name: string;
    members: Array<{
      id: string;
      name: string;
    }>;
  }>;
  showClear?: boolean;
  onClear?: () => void;
}

export function FamilySelector({
  families,
  showClear,
  onClear,
  ...props
}: Props) {
  return (
    <div className="flex gap-2">
      <Select {...props}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Изберете семейство" />
        </SelectTrigger>

        <SelectContent>
          {families.map((family) => (
            <SelectGroup key={`user-family-${family.id}`}>
              <SelectItem value={String(family.id)}>{family.name}</SelectItem>
              {family.members.map((member) => (
                <div
                  className="pl-6 py-1 text-xs text-muted-foreground"
                  key={`family-member-${member.id}`}
                >
                  {member.name}
                </div>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
      {showClear && (
        <Button variant="destructive" size="icon-sm" onClick={onClear}>
          <CircleX />
        </Button>
      )}
    </div>
  );
}
