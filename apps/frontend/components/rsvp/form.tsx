import { Button } from "@repo/ui/components/ui/button";
import { Label } from "@repo/ui/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useMemo } from "react";
import { useForm } from "@tanstack/react-form";
import { normalizeFormDefaults, serializeFormValues } from "./utils";

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
  extraGuests: {
    label: "Моля въведете имената на хората, които ще доведете с Вас!",
    placeholder: "Въведете имената тук",
    notes: `Ако каните повече от един човек - моля разделете имената със запетайки (,)`,
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
    return {};
  }, [defaultValues]) as Record<string, string>;

  const form = useForm({
    defaultValues: defaults,
    onSubmit: async ({ value }) => {
      const payload = serializeFormValues(value);
      const formData = new FormData();
      Object.entries(payload).forEach(([k, v]) => {
        if (v !== undefined && v !== null) formData.append(k, String(v));
      });
      onSubmit?.(formData);
    },
  });

  return (
    <form
      name={name}
      id={name}
      onSubmit={form.handleSubmit}
      onReset={(e) => onReset?.(e.currentTarget)}
    >
      <div className="space-y-6">
        {Object.entries(fieldConfig).map(([key, field]) => {
          if ("options" in field) {
            return (
              <form.Field key={key} name={key}>
                {(fieldState) => (
                  <div className="space-y-3">
                    <Label className="text-base font-medium text-sage-800">
                      {field.label}
                    </Label>
                    <RadioGroup
                      name={key}
                      value={fieldState.state.value ?? ""}
                      onValueChange={fieldState.handleChange}
                      required
                    >
                      {field.options.map((option, i) => (
                        <div
                          className="flex items-center space-x-2"
                          key={`option-${key}-${i}`}
                        >
                          <RadioGroupItem
                            value={String(option.value)}
                            id={`${key}-${option.value}`}
                            checked={
                              fieldState.state.value === String(option.value)
                            }
                            onClick={() =>
                              fieldState.handleChange(String(option.value))
                            }
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
                )}
              </form.Field>
            );
          }
          if ("placeholder" in field) {
            return (
              <form.Field key={key} name={key}>
                {(fieldState) => (
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
                      value={fieldState.state.value ?? ""}
                      onChange={(e) => fieldState.handleChange(e.target.value)}
                      className="min-h-[100px] resize-none"
                    />
                    {field.notes && (
                      <p className="text-sm text-sage-600">{field.notes}</p>
                    )}
                  </div>
                )}
              </form.Field>
            );
          }
          return null;
        })}
      </div>
      <div className="pt-4">
        <Button
          type="submit"
          className="w-full bg-rose-gold-500 hover:bg-rose-gold-600 text-lg py-6"
          disabled={disabled || form.state.isSubmitting}
        >
          Отговорете на поканата
        </Button>
      </div>
    </form>
  );
}
