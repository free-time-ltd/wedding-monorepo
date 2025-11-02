import { Button } from "@repo/ui/components/ui/button";
import { Label } from "@repo/ui/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { FormEvent, useMemo } from "react";
import { normalizeFormDefaults } from "./utils";

const fieldConfig = {
  attending: {
    label: "Ще присъствате ли?",
    options: [
      { value: "true", label: "Да, ще бъда там!" },
      { value: "false", label: "За жалост няма да мога да дойда" },
      { value: null, label: "Не съм сигурен" },
    ],
  },
  plusOne: {
    label: "Ще доведеш ли някого със себе си?",
    options: [
      { value: "true", label: "Да, ще доведа някого!" },
      { value: "false", label: "Не, само аз ще бъда" },
    ],
  },
  menuChoice: {
    label: "Предпочитания за меню?",
    options: [
      { value: "vegan", label: "Веган" },
      { value: "regular", label: "Месно" },
      { value: "fish", label: "Риба" },
    ],
  },
  transportation: {
    label: "Ще ви трябва ли транспорт или паркинг?",
    options: [
      { value: "parking", label: "Ще ми трябва място за паркиране" },
      {
        value: "shuttle",
        label: "Бих желал/а да ползвам такси (транспорт от/до мястото)",
      },
      { value: "no", label: "Няма да ми е необходим транспорт" },
    ],
  },
  accommodation: {
    label: "Желаете ли помощ за намиране на хотел или къща за гости наблизо?",
    options: [
      { value: "true", label: "Да, моля, изпратете ми препоръки" },
      { value: "false", label: "Не, имам осигурено настаняване" },
    ],
  },
  notes: {
    label: "Допълнителни бележки",
    placeholder:
      "Моля, споделете ни информация за хранителни предпочитания, алергии или специални нужди",
    notes:
      "Ще се постараем да се съобразим с вашите предпочитания към храната. Ако нямате ограничения, просто оставете полето празно.",
  },
} as const;

type FieldConfig = typeof fieldConfig;

type FieldValue<T extends keyof FieldConfig> = FieldConfig[T] extends {
  options: readonly { value: infer V }[];
}
  ? V
  : string | null;

export type FormValues = {
  [K in keyof FieldConfig]: FieldValue<K>;
};

interface Props {
  name?: string;
  defaultValues?: FormValues | null;
  disabled?: boolean;
  onSubmit?: (data: FormData) => void;
  onReset?: (el: HTMLFormElement) => void;
}

export function RsvpForm({
  name,
  defaultValues,
  disabled,
  onSubmit,
  onReset,
}: Props) {
  const defaults = useMemo(() => {
    if (defaultValues && defaultValues !== null) {
      return normalizeFormDefaults(defaultValues);
    }
  }, [defaultValues]) as Record<string, string> | undefined;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    onSubmit?.(formData);
  };

  const handleReset = (e: FormEvent<HTMLFormElement>) => {
    onReset?.(e.currentTarget);
  };

  return (
    <form onSubmit={handleSubmit} onReset={handleReset} name={name} id={name}>
      <div className="space-y-6">
        {Object.entries(fieldConfig).map(([key, field]) => {
          if ("options" in field) {
            return (
              <div className="space-y-3" key={`question-${key}`}>
                <Label className="text-base font-medium text-sage-800">
                  {field.label}
                </Label>
                <RadioGroup name={key} defaultValue={defaults?.[key]} required>
                  {field.options.map((option, i) => (
                    <div
                      className="flex items-center space-x-2"
                      key={`option-${key}-${i}`}
                    >
                      <RadioGroupItem
                        value={String(option.value)}
                        id={`${key}-${option.value}`}
                      />
                      <Label
                        htmlFor={`${key}-${option.value}`}
                        className="font-normal cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            );
          }

          if ("placeholder" in field) {
            return (
              <div className="space-y-3" key={`question-${key}`}>
                <div className="space-y-3">
                  <Label
                    htmlFor={key}
                    className="text-base font-medium text-sage-800"
                  >
                    {field.label}
                  </Label>
                  <Textarea
                    id={key}
                    name={key}
                    placeholder={field.placeholder}
                    defaultValue={defaults?.[key]}
                    className="min-h-[100px] resize-none"
                  />
                  {field.notes && (
                    <p className="text-sm text-sage-600">{field.notes}</p>
                  )}
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
      <div className="pt-4">
        <Button
          type="submit"
          className="w-full bg-rose-gold-500 hover:bg-rose-gold-600 text-lg py-6"
          disabled={disabled}
        >
          Отговорете на поканата
        </Button>
      </div>
    </form>
  );
}
