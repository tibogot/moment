const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatArticleDate(value: string) {
  return dateFormatter.format(new Date(value));
}
