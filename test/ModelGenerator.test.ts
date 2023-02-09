import { MagicPrototyperContext } from '../src/MagicPrototyper/MagicPrototyperTypes';
import { getTestModelBig } from './TestModelGeneratorUtil';
import { createModelArtifact } from '../src/MagicPrototyper/ModelGenerator';

test('Model Generator en', async () => {
  const result: any = await createModelArtifact(
    getTestModelBig(),
    {} as MagicPrototyperContext,
    'en'
  );
  expect(result.intents.WelcomeIntent.phrases[0] === 'welcome');
  expect(result.intents.WelcomeIntent.speech === undefined);
  expect(result.intents.WelcomeIntent.text === undefined);
  expect(result.intents.WelcomeIntent.reprompt === undefined);
  expect(result.intents.WelcomeIntent.quickReplies === undefined);
});

test('Model Generator de', async () => {
  const result: any = await createModelArtifact(
    getTestModelBig(),
    {} as MagicPrototyperContext,
    'de'
  );
  expect(result.intents.WelcomeIntent.phrases[0] === 'willkommen');
  expect(result.intents.WelcomeIntent.speech === undefined);
  expect(result.intents.WelcomeIntent.text === undefined);
  expect(result.intents.WelcomeIntent.reprompt === undefined);
  expect(result.intents.WelcomeIntent.quickReplies === undefined);
});

test('Model Generator non existing locale es', async () => {
  const result: any = await createModelArtifact(
    getTestModelBig(),
    {} as MagicPrototyperContext,
    'es'
  );
  expect(result.intents.WelcomeIntent.phrases !== undefined);
  expect(result.intents.WelcomeIntent.speech).toBeUndefined();
  expect(result.intents.WelcomeIntent.text === undefined);
  expect(result.intents.WelcomeIntent.reprompt === undefined);
  expect(result.intents.WelcomeIntent.quickReplies === undefined);
});
