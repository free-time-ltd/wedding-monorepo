"use client";

import { useEffect, useState } from "react";

interface Props {
  date: Date;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function Countdown({ date: weddingDate }: Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const calcTimeLeft = () => {
      const now = new Date();
      const difference = weddingDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calcTimeLeft();
    const timer = setInterval(calcTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [weddingDate]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    const element = document.getElementById("countdown");
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const timeUnits = [
    { value: timeLeft.days, label: "Дни" },
    { value: timeLeft.hours, label: "Часа" },
    { value: timeLeft.minutes, label: "Минути" },
    { value: timeLeft.seconds, label: "Секунди" },
  ];

  return (
    <section id="countdown">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-xl md:text-2xl text-muted-foreground font-light">
          Обратното броене до
        </p>
        <h2 className="font-serif text-4xl md:text-5xl text-primary">
          Нашият специален ден
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 pt-10">
          {timeUnits.map((unit, index) => (
            <div
              key={unit.label}
              className={`glass-card p-6 md:p-8 transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: `${200 + index * 100}ms` }}
            >
              <span className="block font-serif text-4xl md:text-5xl lg:text-6xl text-primary font-light">
                {String(unit.value).padStart(2, "0")}
              </span>
              <span className="text-label text-muted-foreground mt-2 block">
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
