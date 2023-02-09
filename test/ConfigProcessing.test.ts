import {
  MagicPrototyperContext,
  MagicPrototyperProperties
} from '../src/MagicPrototyper/MagicPrototyperTypes';
import { getTestModelSmall } from './TestModelGeneratorUtil';
import { traverseAndProcessJsonTree } from '../src/MagicPrototyper/MagicPrototyperConfigProcessor/MagicPrototyperConfigProcessor';
import { updateContextWithUserConfig } from '../src/MagicPrototyper/MagicPrototyperUtils';
import { LocaleExtractor } from '../src/MagicPrototyper/MagicPrototyperConfigProcessor/NodeProcessor/LocaleExtractor';
import { JexlEvaluator } from '../src/MagicPrototyper/MagicPrototyperConfigProcessor/NodeProcessor/JexlEvaluator';

test('Config Processor en', async () => {
  const locale = 'en';

  const contextProperties: MagicPrototyperProperties = (
    await updateContextWithUserConfig(getTestModelSmall(), {} as MagicPrototyperContext, locale)
  ).magicPrototyperProperties;

  const resultJexled = traverseAndProcessJsonTree(
    getTestModelSmall(),
    JexlEvaluator,
    contextProperties,
    locale
  );

  const resultLocalized = traverseAndProcessJsonTree(
    resultJexled,
    LocaleExtractor,
    contextProperties,
    locale
  );

  // console.log('***' + JSON.stringify(resultLocalized, null, '  '));

  expect(resultLocalized.components[0].intents.WelcomeIntent.phrases.de).toBeUndefined();
  expect(resultLocalized.components[0].intents.WelcomeIntent.phrases.en).toBeUndefined();
  expect(resultLocalized.components[0].intents.WelcomeIntent.phrases[0]).toEqual('Welcome');
  expect(resultLocalized.components[0].intents.WelcomeIntent?.speech?.[0]).toEqual('GAMMA');
  expect(resultLocalized.components[0].intents.WelcomeIntent?.speech?.[1]).toEqual('DELTA');
  expect(resultLocalized.components[0].intents.WelcomeIntent?.text?.[0]).toEqual(
    'international value'
  );
  expect(resultLocalized.components[0].intents.WelcomeIntent?.reprompt?.[0]).toEqual('IOTA');
  expect(resultLocalized.components[0].intents.WelcomeIntent?.reprompt?.[1]).toEqual('KAPPA');
});

test('Config Processor de', async () => {
  const locale = 'de';

  const contextProperties: MagicPrototyperProperties = (
    await updateContextWithUserConfig(getTestModelSmall(), {} as MagicPrototyperContext, locale)
  ).magicPrototyperProperties;

  const resultJexled = traverseAndProcessJsonTree(
    getTestModelSmall(),
    JexlEvaluator,
    contextProperties,
    locale
  );

  const resultLocalized = traverseAndProcessJsonTree(
    resultJexled,
    LocaleExtractor,
    contextProperties,
    locale
  );

  // console.log('***' + JSON.stringify(resultLocalized, null, '  '));

  expect(resultLocalized.components[0].intents.WelcomeIntent.phrases.de).toBeUndefined();
  expect(resultLocalized.components[0].intents.WelcomeIntent.phrases.en).toBeUndefined();
  expect(resultLocalized.components[0].intents.WelcomeIntent.phrases[0]).toEqual('Willkommen');
  expect(resultLocalized.components[0].intents.WelcomeIntent?.speech?.[0]).toEqual('ALPHA');
  expect(resultLocalized.components[0].intents.WelcomeIntent?.speech?.[1]).toEqual('BETA');
  expect(resultLocalized.components[0].intents.WelcomeIntent?.text?.[0]).toEqual(
    'international value'
  );
  expect(resultLocalized.components[0].intents.WelcomeIntent?.reprompt?.[0]).toEqual('IOTA');
  expect(resultLocalized.components[0].intents.WelcomeIntent?.reprompt?.[1]).toEqual('KAPPA');
});
