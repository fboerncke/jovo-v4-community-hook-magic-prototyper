import type { MagicPrototyperContext } from './MagicPrototyperTypes';
import { MagicPrototyperModel, MagicPrototyperProperties } from './MagicPrototyperTypes';
import { updateContextWithUserConfig } from './MagicPrototyperUtils';
import { traverseAndProcessJsonTree } from './MagicPrototyperConfigProcessor/MagicPrototyperConfigProcessor';

import { JexlEvaluator } from './MagicPrototyperConfigProcessor/NodeProcessor/JexlEvaluator';
import { LocaleExtractor } from './MagicPrototyperConfigProcessor/NodeProcessor/LocaleExtractor';
import { SpintaxExploder } from './MagicPrototyperConfigProcessor/NodeProcessor/SpintaxExploder';

/**
 * Preprocess MagicPrototyper model: run JEXL replacements and do the Spintax
 *
 * @param magicPrototyperModel
 * @param contextProperties
 * @param locale
 * @returns
 */
export async function createModelArtifact(
  magicPrototyperModel: MagicPrototyperModel,
  magicPrototyperContext: MagicPrototyperContext,
  locale: string
): Promise<MagicPrototyperModel> {
  let modelCloneForModelGeneration = JSON.parse(JSON.stringify(magicPrototyperModel));

  const contextProperties: MagicPrototyperProperties = (
    await updateContextWithUserConfig(modelCloneForModelGeneration, magicPrototyperContext, locale)
  ).magicPrototyperProperties;

  // when you want to log the model file the uncomment the following
  // import { Logger } from './MagicPrototyperConfigProcessor/NodeProcessor/Logger';
  // traverseAndProcessJsonTree(magicPrototyperModel, Logger, contextProperties);

  // two pass replacement of Jexl expressions
  modelCloneForModelGeneration = traverseAndProcessJsonTree(
    modelCloneForModelGeneration,
    JexlEvaluator,
    contextProperties
  );
  modelCloneForModelGeneration = traverseAndProcessJsonTree(
    modelCloneForModelGeneration,
    JexlEvaluator,
    contextProperties
  );

  // explode spintax. Watch out: this may create loads(!) of entries
  modelCloneForModelGeneration = traverseAndProcessJsonTree(
    modelCloneForModelGeneration,
    SpintaxExploder,
    contextProperties
  );

  modelCloneForModelGeneration.intents = {};
  modelCloneForModelGeneration.components.forEach((componentDescription: any) => {
    // merge phrase definitions from different components into one model
    Object.keys(componentDescription.intents).forEach((intentName) => {
      if (modelCloneForModelGeneration.intents[intentName]?.phrases !== undefined) {
        // merge/update phrases for intents used in multiple components
        Object.keys(modelCloneForModelGeneration.intents[intentName].phrases).forEach(
          (locale: string) => {
            modelCloneForModelGeneration.intents[intentName].phrases[locale].push(
              componentDescription.intents[intentName].phrases[locale]
            );
          }
        );
      } else {
        //create
        modelCloneForModelGeneration.intents[intentName] = componentDescription.intents[intentName];
      }
    });

    // Merge alexa interaction model definitions from different components with same intent name
    // into one model. On Alexa voice model level we cannot define different sample sets
    // for different components. This is why we create a unified superset of example utterances.
    if (modelCloneForModelGeneration.alexa !== undefined) {
      // merge/update intents for alexa used in multiple components
      if (componentDescription.alexa !== undefined) {
        Object.keys(componentDescription.alexa.interactionModel.languageModel.intents).forEach(
          (intent: string) => {
            console.log(intent + componentDescription);

            modelCloneForModelGeneration.alexa.interactionModel.languageModel.intents[intent].push(
              componentDescription.alexa[intent]
            );
          }
        );
      }
    } else {
      //create
      if (componentDescription.alexa !== undefined) {
        modelCloneForModelGeneration.alexa = componentDescription.alexa;
      } else {
      }
    }

    // merge entity type definitions from different components into one model
    if (modelCloneForModelGeneration.entityTypes !== undefined) {
      // merge/update phrases for entityTypes used in multiple components
      if (componentDescription.entityTypes !== undefined) {
        Object.keys(componentDescription.entityTypes).forEach((entityType: string) => {
          modelCloneForModelGeneration.entityTypes[entityType].push(
            componentDescription.entityTypes[entityType]
          );
        });
      }
    } else {
      //create
      if (componentDescription.entityTypes !== undefined) {
        modelCloneForModelGeneration.entityTypes = componentDescription.entityTypes;
      } else {
      }
    }
  });

  delete modelCloneForModelGeneration.components;

  return sanitizeModel(modelCloneForModelGeneration, locale);
}

/**
 * As preparation for creating a Jovo model file remove all the superfluous stuff
 * from the data structure and make sure the remaining content is valid
 * by running some assertions.
 *
 * @param magicPrototyperModel
 * @param locale
 * @returns
 */
function sanitizeModel(
  magicPrototyperModel: MagicPrototyperModel,
  locale: string
): MagicPrototyperModel {
  // remove contents not required for the given locale
  delete magicPrototyperModel.generateForLocales;
  delete magicPrototyperModel.componentHeaderLines;
  delete magicPrototyperModel.sqliteDatabase;
  delete magicPrototyperModel.config;

  magicPrototyperModel = traverseAndProcessJsonTree(
    magicPrototyperModel,
    LocaleExtractor,
    {},
    locale
  );

  // we (ab)use stringify() as deep iterator
  const sanitizedModelString = JSON.stringify(magicPrototyperModel, (key, value) => {
    // process and filter entries

    //  console.log({ key, value });

    if (value !== undefined && (key === 'phrases' || key === 'values' || key === 'synonyms')) {
      if (!Array.isArray(value)) {
        value = [value]; // force array
      }
      // check arrays for consistency
      return value
        .filter(assertValueIsNotEmpty) // keep only non empty values
        .filter(assertValueIsUnique) // remove duplicates
        .sort(); // order ASC
    } else if (key.endsWith('Intent')) {
      // remove entries not used in model
      if (value.entities !== undefined) {
        const entityNames = Object.keys(value.entities);
        entityNames.forEach((entityName) => {
          if (value.entities[entityName].assert !== undefined) {
            delete value.entities[entityName].assert;
          }
          if (value.entities[entityName].onAssertionFailed !== undefined) {
            delete value.entities[entityName].onAssertionFailed;
          }
        });
      }

      delete value.assert;
      delete value.native;
      delete value.onError;
      delete value.speech;
      delete value.text;
      delete value.reprompt;
      delete value.quickReplies;
      return value;
    } else return value;
  });

  return JSON.parse(sanitizedModelString);
}

/////////////////////////////

function assertValueIsUnique<T>(value: T, index: number, self: T[]): boolean {
  return self.indexOf(value) === index;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function assertValueIsNotEmpty<T>(value: T, index: number, self: T[]): boolean {
  return value !== undefined && value !== null && value.toString().trim().length > 0;
}
