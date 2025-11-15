export function pluralize(
  count: number,
  singular: string,
  plural: string
): string {
  return count === 1 ? singular : plural;
}

export function pluralizeWithCount(
  count: number,
  singular: string,
  plural: string
): string {
  return `${count} ${pluralize(count, singular, plural)}`;
}

export function pluralizeIntl(
  count: number,
  forms: {
    zero?: string;
    one?: string;
    two?: string;
    few?: string;
    many?: string;
    other: string;
  },
  locale: string = "en"
): string {
  const pr = new Intl.PluralRules(locale);
  const rule = pr.select(count);
  return forms[rule] || forms.other;
}
