import { Guest } from "@/store/chatStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { getInitials } from "../guest-selector/utils";

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
        <div className="guest-list">
          <label>Изберете вашето име</label>
          <div className="border border-border rounded-lg max-h-96 overflow-y-auto">
            <div className="divide-y divide-border">
              {guests.map((guest) => (
                <button
                  key={guest.id}
                  className={`w-full p-4 flex items-center gap-4 hover:bg-accent/5 transition-colors`}
                >
                  <div className="avatar">
                    <div className="rounded-full border size-10 bg-accent/20 text-accent font-medium flex items-center justify-center">
                      {getInitials(guest.name)}
                    </div>
                  </div>

                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">{guest.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {guest.table.label}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
