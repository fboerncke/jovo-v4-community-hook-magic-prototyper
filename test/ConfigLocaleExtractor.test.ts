import { LocaleExtractor } from "../src/MagicPrototyper/MagicPrototyperConfigProcessor/NodeProcessor/LocaleExtractor";

test("Locale Extractor en", async () => {
  const localeExtractor = new LocaleExtractor();
  const result = localeExtractor.implementation(
    "speech",
    { de: "alpha", en: "beta" },
    {},
    "en"
  );
  expect(result).toEqual("beta");
});

test("Locale Extractor de", async () => {
  const localeExtractor = new LocaleExtractor();
  const result = localeExtractor.implementation(
    "speech",
    { de: "alpha", en: "beta" },
    {},
    "de"
  );
  expect(result).toEqual("alpha");
});

test("Non existing locale es", async () => {
  const localeExtractor = new LocaleExtractor();
  const result = localeExtractor.implementation(
    "speech",
    { de: "alpha", en: "beta" },
    {},
    "es"
  );
  expect(result).toBeUndefined();
});
