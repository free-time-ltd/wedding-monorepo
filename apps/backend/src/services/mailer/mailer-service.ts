import { generateId } from "@repo/utils/generateId";
import { type CreateEmailOptions, Resend } from "resend";

export class MailerService {
  private mailer: Resend;

  constructor(
    resendKey: string,
    private pretend: boolean = false,
    private logger: (msg: string, data?: unknown) => void = console.log
  ) {
    this.mailer = new Resend(resendKey);
  }

  async send(payload: CreateEmailOptions) {
    if (this.pretend) {
      this.logger("[Pretend Mailer] Email send skipped", payload);

      return {
        data: {
          id: generateId(),
        },
        error: null,
      };
    }

    return this.mailer.emails.send(payload);
  }
}
