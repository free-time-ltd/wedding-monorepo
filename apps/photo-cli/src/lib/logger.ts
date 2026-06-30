/**
 * Minimal, TTY-aware logger. Colors are disabled automatically when output is
 * piped or when the `NO_COLOR` environment variable is set.
 */

const useColor = process.stdout.isTTY === true && !process.env.NO_COLOR;

const paint = (code: string, text: string): string =>
  useColor ? `\x1b[${code}m${text}\x1b[0m` : text;

const c = {
  dim: (t: string) => paint("2", t),
  red: (t: string) => paint("31", t),
  green: (t: string) => paint("32", t),
  yellow: (t: string) => paint("33", t),
  blue: (t: string) => paint("34", t),
  cyan: (t: string) => paint("36", t),
  bold: (t: string) => paint("1", t),
};

export const logger = {
  info(message: string): void {
    console.log(`${c.blue("•")} ${message}`);
  },
  success(message: string): void {
    console.log(`${c.green("✓")} ${message}`);
  },
  warn(message: string): void {
    console.warn(`${c.yellow("!")} ${message}`);
  },
  error(message: string): void {
    console.error(`${c.red("✗")} ${message}`);
  },
  step(current: number, total: number, message: string): void {
    console.log(`${c.cyan(`[${current}/${total}]`)} ${message}`);
  },
  dim(message: string): void {
    console.log(c.dim(message));
  },
  heading(message: string): void {
    console.log(`\n${c.bold(message)}`);
  },
};

export const color = c;
