import { MagicPrototyperContext } from '../src/MagicPrototyper/MagicPrototyperTypes';
import { getTestModelBig } from './TestModelGeneratorUtil';
import { createCodeArtifacts } from '../src/MagicPrototyper/CodeGenerator';

test('Code Generator de, en', async () => {
  const result = await createCodeArtifacts(getTestModelBig(), {
    locales: ['de', 'en']
  } as MagicPrototyperContext);
  expect(result.componentCode !== undefined);
  expect(result.de !== undefined);
  expect(result.en !== undefined);
});

test('Code Generator non existing locales es', async () => {
  const result = await createCodeArtifacts(getTestModelBig(), {
    locales: ['es']
  } as MagicPrototyperContext);
  expect(result.componentCode !== undefined);
  expect(result.de === undefined);
  expect(result.en === undefined);
  expect(result.es === undefined);
});
