import { redirect } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const konamiCode = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
] as const;

export function useKonamiKode(onActivate?: () => void) {
  const keyStrokes = useRef<string[]>([]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      keyStrokes.current.push(e.key);

      if (keyStrokes.current.length > konamiCode.length) {
        keyStrokes.current.shift();
      }

      const matches = konamiCode.every(
        (key, i) => key === keyStrokes.current[i]
      );

      if (matches) {
        keyStrokes.current = [];
        onActivate?.();
      }
    };

    window.addEventListener("keyup", handleKeyPress);

    return () => {
      window.removeEventListener("keyup", handleKeyPress);
    };
  }, [onActivate]);
}

export function useAdminRedirect() {
  useKonamiKode(handleKonamiCode);
  const [activated, setActivated] = useState(false);

  function handleKonamiCode() {
    setActivated(true);
    redirect("/login");
  }

  useEffect(() => {
    let timerId: number;
    if (activated) {
      timerId = window.setTimeout(() => setActivated(false), 1000);
    }

    return () => {
      if (timerId) {
        window.clearTimeout(timerId);
      }
    };
  }, [activated]);

  return activated;
}
