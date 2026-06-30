import { createInterface, type Interface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

/** True when we can run an interactive session (stdin/stdout are a terminal). */
export function isInteractive(): boolean {
  return Boolean(stdin.isTTY && stdout.isTTY);
}

/**
 * A thin wrapper around `readline/promises` that owns its lifecycle. Create
 * one, run the prompts you need, then call {@link Prompter.close}.
 */
export class Prompter {
  private readonly rl: Interface;

  constructor() {
    this.rl = createInterface({ input: stdin, output: stdout });
  }

  /** Ask a free-text question, returning `fallback` when left blank. */
  async ask(question: string, fallback = ""): Promise<string> {
    const suffix = fallback ? ` (${fallback})` : "";
    const answer = (await this.rl.question(`${question}${suffix}: `)).trim();
    return answer || fallback;
  }

  /** Ask a yes/no question. */
  async confirm(question: string, defaultYes = true): Promise<boolean> {
    const hint = defaultYes ? "Y/n" : "y/N";
    const answer = (await this.rl.question(`${question} [${hint}] `))
      .trim()
      .toLowerCase();
    if (!answer) return defaultYes;
    return answer === "y" || answer === "yes";
  }

  close(): void {
    this.rl.close();
  }
}
