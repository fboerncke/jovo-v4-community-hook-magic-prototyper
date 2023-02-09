import type { MagicPrototyperContext } from './MagicPrototyper/MagicPrototyperTypes';
import { MagicPrototyperModel } from './MagicPrototyper/MagicPrototyperTypes';
import { createModelArtifact } from './MagicPrototyper/ModelGenerator';
import { createCodeArtifacts } from './MagicPrototyper/CodeGenerator';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

/**
 * For a given MagicPrototyper context create corresponding TypeScript
 * code artifacts for Jovo
 *
 * @param magicPrototyperContext
 */
export async function MagicPrototyper(
  magicPrototyperContext: MagicPrototyperContext
): Promise<void> {
  try {
    console.log('Launching Magic Prototyper ...');

    // load main configuration file
    let magicPrototyperTemplateAsString = '';
    try {
      magicPrototyperTemplateAsString = readFileSync(
        'magicPrototyper/MagicPrototyperModel.json',
        'utf8'
      );
    } catch (error) {
      console.error('💥 Missing configuration file "magicPrototyper/MagicPrototyperModel.json" 💥');
      process.exit(42);
    }

    // overwrite automatic Jovo locale detection with optional setting from MagicPrototyper config file
    let localesFromMagicPrototyperConfig = JSON.parse(
      magicPrototyperTemplateAsString
    ).generateForLocales; // ['de', 'en', 'es']
    if (localesFromMagicPrototyperConfig === undefined) {
      // fallback to standard Jovo procedure
      localesFromMagicPrototyperConfig = magicPrototyperContext.locales;
    }
    magicPrototyperContext.locales = localesFromMagicPrototyperConfig;

    // do the magic step 1: create JOVO model files
    for (const locale of magicPrototyperContext.locales) {
      const magicPrototyperModel: MagicPrototyperModel = JSON.parse(
        magicPrototyperTemplateAsString
      );
      const jovoModel = await createModelArtifact(
        magicPrototyperModel,
        magicPrototyperContext, // = Jovo BuildPlatformContext + X
        locale // e.g. 'de', 'en', ...
      );

      // write resulting model in Jovo format as JSON to file
      if (!existsSync('models')) {
        mkdirSync('models');
      }
      writeFileSync('models/' + locale + '.json', JSON.stringify(jovoModel, null, '  '));
    }

    // do the magic step 2: create JOVO code artifacts
    const codeBundle = await createCodeArtifacts(
      JSON.parse(magicPrototyperTemplateAsString),
      magicPrototyperContext
    );

    // do the magic step 3: write JOVO MagicPrototyper Component file

    JSON.parse(magicPrototyperTemplateAsString).components.forEach((componentDescription: any) => {
      const componentName = componentDescription.componentName;
      writeFileSync(
        'src/components/' + componentName + '.ts',
        codeBundle['componentCode' + componentName]
      );
    });

    // do the magic step 4: write JOVO I18N files
    if (!existsSync('src/i18n')) {
      mkdirSync('src/i18n');
    }
    for (const locale of magicPrototyperContext.locales) {
      writeFileSync('src/i18n/' + locale + '.json', codeBundle[locale]);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log('Magic Prototyper failed: ' + error.stack);
    process.exit(42);
  }
}
