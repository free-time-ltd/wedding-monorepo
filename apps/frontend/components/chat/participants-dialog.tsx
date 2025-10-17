import { Guest } from "@/store/chatStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { GuestList } from "../guest-list";

interface Props {
  open: boolean;
  name: string;
  guests: Guest[];
  onOpenChange?: (open: boolean) => void;
}

export function ParticipantsDialog({
  open,
  onOpenChange,
  name,
  guests,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            Стая &quot;{name}&quot;
          </DialogTitle>
          <DialogDescription>
            Списък с всички гости, които могат да четат съобщенията Ви.
          </DialogDescription>
        </DialogHeader>
        <GuestList guests={guests} striped searchable />
      </DialogContent>
    </Dialog>
  );
}
