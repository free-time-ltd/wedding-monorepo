import { invitationTable, usersTable } from "@repo/db/schema";
import type { RsvpRepository } from "./rsvp-repository";

type User = typeof usersTable.$inferSelect;
type Invitation = typeof invitationTable.$inferSelect;

export class RsvpService {
  private role: "inviter" | "invitee" | "unknown" = "unknown";

  constructor(
    private rsvp: Invitation | null = null,
    private currentUser: User,
    private rsvpRepository: RsvpRepository
  ) {}

  async init() {
    this.role = await this.determineRole();

    return this;
  }

  private async determineRole(): Promise<typeof this.role> {
    if (!this.rsvp) return "unknown";

    if (this.rsvp?.userId === this.currentUser.id) return "inviter";

    return "unknown";
  }

  async createUserFromName(name: string) {
    await this.rsvpRepository.createUser({ name });

    return this;
  }
}
