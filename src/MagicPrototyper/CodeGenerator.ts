import {
  MagicPrototyperModel,
  MagicPrototyperContext,
  CodeArtifacts,
  MagicPrototyperProperty,
  MagicPrototyperAssertion,
  MagicPrototyperErrorHandler
} from './MagicPrototyperTypes';
import { MagicPrototyperProperties } from './MagicPrototyperTypes';
import fs from 'fs';
import voca from 'voca';
import { camelCaseToScreamingSnakeCase, lowerCaseFirstLetter } from './MagicPrototyperUtils';

import prettier from 'prettier';

import { updateContextWithUserConfig } from './MagicPrototyperUtils';
import { traverseAndProcessJsonTree } from './MagicPrototyperConfigProcessor/MagicPrototyperConfigProcessor';
import { JexlEvaluator } from './MagicPrototyperConfigProcessor/NodeProcessor/JexlEvaluator';

/**
 * Create all the necessary code artifacts for a given MagicPrototyperModel
 * and return them as object of strings.
 *
 * @param magicPrototyperModel
 * @param magicPrototyperContext
 * @returns
 */
export async function createCodeArtifacts(
  magicPrototyperModel: Readonly<MagicPrototyperModel>,
  magicPrototyperContext: MagicPrototyperContext
): Promise<CodeArtifacts> {
  const modelCloneForCodeGeneration = JSON.parse(JSON.stringify(magicPrototyperModel));
  const codeBundle = {} as CodeArtifacts;

  const componentNames: string[] = modelCloneForCodeGeneration.components.map(
    (componentDescription: any) => componentDescription.componentName
  );

  modelCloneForCodeGeneration.components.forEach((componentDescription: any) => {
    const componentName = componentDescription.componentName;
    //console.log('Creating component implementation for ' + componentName);
    // create code for all defined components

    //    componentDescription.intents

    modelCloneForCodeGeneration.intents = componentDescription.intents;

    delete modelCloneForCodeGeneration.components;

    codeBundle['componentCode' + componentName] = createMagicPrototyperComponentCode(
      componentName,
      componentNames,
      modelCloneForCodeGeneration,
      magicPrototyperContext
    );
  });

  const magicPrototyperLocales = magicPrototyperContext.locales; // 'de', 'en', ...
  for (const locale of magicPrototyperLocales) {
    const contextProperties: MagicPrototyperProperties = (
      await updateContextWithUserConfig(magicPrototyperModel, magicPrototyperContext, locale)
    ).magicPrototyperProperties;

    let modelCloneForI18n = JSON.parse(JSON.stringify(magicPrototyperModel));

    // one pass replacement of Jexl expressions
    modelCloneForI18n = traverseAndProcessJsonTree(
      modelCloneForI18n,
      JexlEvaluator,
      contextProperties
    );

    const localeJson = createI18nLocaleDefinitionCode(modelCloneForI18n, locale);
    codeBundle[locale as keyof typeof codeBundle] = localeJson;
  }

  return codeBundle;
}

/**
 * For a given MagicPrototyper model and locale string extract the locale specific information
 * as JSON string following the Jovo i18n format conventions.
 *
 * @param magicPrototyperModel
 * @param locale something like 'en' or 'de'
 * @returns
 */
function createI18nLocaleDefinitionCode(
  magicPrototyperModel: MagicPrototyperModel,
  locale: string
) {
  let latestComponentName = '';
  let latestIntent = '';
  let assertSpeechArrayIndex = 0;
  let errorSpeechArrayIndex = 0;

  //  const translationMap: { [key: string]: string | string[] } = {};
  const translationMap: { [key: string]: MagicPrototyperProperty } = {};

  // we (ab)use stringify() as deep iterator
  JSON.stringify(magicPrototyperModel, (key, value) => {
    if (key === 'componentName') {
      latestComponentName = value;
      latestIntent = '';
    } else if (key.endsWith('Intent')) {
      latestIntent = key;
      assertSpeechArrayIndex = 0; // reset array index
      errorSpeechArrayIndex = 0; // reset array index
    }

    if (
      key === 'speech' ||
      key === 'reprompt' ||
      key === 'text' ||
      key === 'quickReplies' ||
      key === 'values' ||
      key === 'errorSpeech' ||
      key === 'startSpeech' ||
      key === 'startText' ||
      key === 'startReprompt' ||
      key === 'startQuickReplies' ||
      key === 'assertionFailedSpeech' ||
      key === 'assertionFailedQuickReplies'
    ) {
      if (key === 'assertionFailedSpeech') {
        assertSpeechArrayIndex++; // multiple messages use index in i18n key
      }
      if (key === 'errorSpeech') {
        errorSpeechArrayIndex++; // multiple messages use index in i18n key
      }

      // may be either string (one element array) or string array
      if (value[locale] !== undefined) {
        const localizedValue: string[] = value[locale];
        let valueArray: string[] = [];
        if (Array.isArray(localizedValue)) {
          valueArray = Object.values(localizedValue);
        } else {
          // no array, we assume 'string'
          valueArray = Object.values([localizedValue]);
        }

        let i18nKey =
          camelCaseToScreamingSnakeCase(latestComponentName + latestIntent) +
          '_' +
          key.toUpperCase();
        if (assertSpeechArrayIndex > 0 && key === 'assertionFailedSpeech') {
          i18nKey = i18nKey + '_' + assertSpeechArrayIndex;
        }
        if (assertSpeechArrayIndex > 0 && key === 'assertionFailedQuickReplies') {
          i18nKey = i18nKey + '_' + assertSpeechArrayIndex;
        }
        if (errorSpeechArrayIndex > 0 && key === 'errorSpeech') {
          i18nKey = i18nKey + '_' + errorSpeechArrayIndex;
        }
        if (valueArray.length === 1 && !i18nKey.endsWith('QUICKREPLIES')) {
          translationMap[i18nKey] = valueArray[0]; // one value
        } else {
          translationMap[i18nKey] = valueArray; // array with multiple elements
        }
      }
    }
    return value;
  });

  const theModelConfig = magicPrototyperModel.config; // may be undefined
  if (theModelConfig !== undefined) {
    Object.keys(theModelConfig).forEach((key: string) => {
      const pureValue = theModelConfig[key];
      if (typeof pureValue === 'string' || Array.isArray(pureValue)) {
        translationMap[key] = pureValue; // as MagicPrototyperProperty;
      } else {
        translationMap[key] = pureValue[locale as keyof typeof pureValue];
      }
    });
  }

  const localizedJson = { translation: translationMap };
  return JSON.stringify(localizedJson, null, '  ');
}

/**
 * For a given MagicPrototyper model create a specific Component Code
 * called "MagicPrototyperComponent". The result will be pretty printed
 * automatically.
 *
 * @param modelClone
 * @returns
 */
function createMagicPrototyperComponentCode(
  currentComponentName: string,
  componentNames: string[],
  modelClone: MagicPrototyperModel,
  magicPrototyperContext: MagicPrototyperContext
): string {
  const headerCode = getComponentHeader(
    currentComponentName,
    componentNames,
    magicPrototyperContext
  );
  let documentCode = '';

  // we (ab)use stringify() as deep iterator
  JSON.stringify(
    modelClone,
    (key, value) => {
      if (key.endsWith('Intent')) {
        documentCode += getComponentIntentHandler(currentComponentName, key, modelClone);
      }
      return value;
    },
    2
  );
  const footerCode = getComponentFooter();

  // here everything goes together
  const headerBodyFooterCode = headerCode + documentCode + footerCode;

  let optionsString = '';
  try {
    optionsString = fs.readFileSync('.prettierrc.json', 'utf8');
  } catch (error) {
    console.error('💥 Missing pretty printer configuration file ".prettierrc.json" 💥');
    process.exit(42);
  }

  const optionsJson = JSON.parse(optionsString);
  optionsJson.parser = 'typescript';
  return prettier.format(headerBodyFooterCode, optionsJson);
}

//////////////////////////////
// the code generators follow
//////////////////////////////

/**
 * Create code for header of a Jovo Component (TypeScript)
 *
 * @returns
 */
function getComponentHeader(
  currentComponentName: string,
  componentNames: string[],
  magicPrototyperContext: MagicPrototyperContext
) {
  let dynamicImports = '';

  if (
    magicPrototyperContext.magicPrototyperProperties !== undefined &&
    magicPrototyperContext.magicPrototyperProperties['ComponentHeaderLines'] !== undefined
  ) {
    (magicPrototyperContext.magicPrototyperProperties['ComponentHeaderLines'] as string[]).forEach(
      (line: string) => {
        dynamicImports += line + ';\n';
      }
    );
  }

  componentNames.forEach((componentName) => {
    if (componentName !== currentComponentName) {
      dynamicImports += `import { ${componentName} } from './${componentName}';\n`;
    }
  });

  let sqliteSettings = '';
  let tableNameList = '';
  if (magicPrototyperContext.magicPrototyperProperties !== undefined) {
    if (magicPrototyperContext.magicPrototyperProperties.SqliteDbFileName != undefined) {
      sqliteSettings =
        "this.$session.data['SqliteDbFileName'] = '" +
        magicPrototyperContext.magicPrototyperProperties.SqliteDbFileName +
        "';";

      const formattedTableNames: string = (
        magicPrototyperContext.magicPrototyperProperties.TableNameList as string[]
      )
        .map((tableName) => '"' + tableName + '"')
        .join();

      tableNameList = "this.$session.data['TableNameList'] = [" + formattedTableNames + '];';
    }
  }

  const headerCode = `
/**
 * The contents of this file is generated code. You should therefore
 * not make any changes. They will be lost after the next build process.
 * Use the underlying MagicPrototyper model file if you intend to make any changes. 
 **/

import { Component, Intents, QuickReplyValue } from '@jovotech/framework';
import { MagicPrototyperBaseComponent } from 'jovo-v4-community-hook-magic-prototyper';

${dynamicImports}

@Component()
export class ${currentComponentName} extends MagicPrototyperBaseComponent {

  START() {
    // initialize component
    ${sqliteSettings}
    ${tableNameList}

   return this.$send({
      message: {
        speech: this.$t('${camelCaseToScreamingSnakeCase(currentComponentName)}_STARTSPEECH'),
        text: this.$t('${camelCaseToScreamingSnakeCase(currentComponentName)}_STARTTEXT')
      },
      reprompt: this.$t('${camelCaseToScreamingSnakeCase(currentComponentName)}_STARTREPROMPT'),
      listen: true,
      quickReplies: this.$t('${camelCaseToScreamingSnakeCase(
        currentComponentName
      )}_STARTQUICKREPLIES') as unknown as QuickReplyValue[]
    });



  }


`;
  return headerCode;
}

/**
 * Create code for a specific intent based on the configuration
 * given in ther MagicPrototyper model description (TypeScript)
 */
function getComponentIntentHandler(
  componentName: string,
  intentName: string,
  magicPrototyperModel: any
): string {
  const intentNameLowerCaseFirstLetter = lowerCaseFirstLetter(intentName);
  const intentNameScreamingSnakeCase = camelCaseToScreamingSnakeCase(componentName + intentName);

  let parameterCode = '';

  const magicPrototyperModelIntent = magicPrototyperModel.intents[intentName];

  let nativeCode = ''; //try {\n';

  let assertionFailedSpeechCounter = 0;
  let errorSpeechCounter = 0;

  // handle asserts
  const assertArray: MagicPrototyperAssertion[] | undefined = magicPrototyperModelIntent.assert;
  if (assertArray !== undefined) {
    assertArray.forEach((assert) => {
      assertionFailedSpeechCounter++;

      const condition = assert.condition;
      nativeCode += 'if(!(' + condition + ')) {\n';

      const i18nKeyMessage =
        camelCaseToScreamingSnakeCase(componentName + intentName) +
        '_ASSERTIONFAILEDSPEECH_' +
        assertionFailedSpeechCounter;

      const i18nKeyQuickReplies =
        camelCaseToScreamingSnakeCase(componentName + intentName) +
        '_ASSERTIONFAILEDQUICKREPLIES_' +
        assertionFailedSpeechCounter;

      nativeCode += `
        if(this.$t("${i18nKeyMessage}")!=="${i18nKeyMessage}") {
        this.$send({
          message: this.$t("${i18nKeyMessage}"),
          text: this.$t("${i18nKeyMessage}"),
          reprompt: this.$t("${i18nKeyMessage}"),
          quickReplies: this.processQuickReplies(this.$t("${i18nKeyQuickReplies}"))
        });
       }`;
      const targetComponent = assert.onAssertionFailed?.delegate?.component;
      const continueHandler = voca.decapitalize(assert.onAssertionFailed?.delegate?.continue);
      if (targetComponent !== undefined && continueHandler !== undefined) {
        nativeCode += `
        return this.$delegate(${targetComponent}, {
          resolve: {
            ['error']: this.helpIntent,
            ['continue']: this.${continueHandler}
          },
          config: {
            duty: 'comeBack'
          }
        });
        `;
      } else {
        nativeCode += `return this.$send({
          speech: this.$t("' + i18nKey + '")
        });\n`;
      }
      nativeCode += '}\n'; // end if
    });
  }

  // handle entities
  const entities = magicPrototyperModelIntent.entities;
  if (entities !== undefined) {
    const entityNames = Object.keys(entities);
    entityNames.forEach((entityName) => {
      parameterCode += `   const ${entityName} = this.$entities.${entityName}?.resolved;`;

      const assertArray: MagicPrototyperAssertion[] | undefined = entities[entityName].assert;

      if (assertArray !== undefined) {
        assertArray.forEach((assert) => {
          assertionFailedSpeechCounter++;

          const condition = assert.condition;
          nativeCode += 'if(!(' + condition + ')) {\n';

          const i18nKeyMessage =
            camelCaseToScreamingSnakeCase(componentName + intentName) +
            '_ASSERTIONFAILEDSPEECH_' +
            assertionFailedSpeechCounter;

          const i18nKeyQuickReplies =
            camelCaseToScreamingSnakeCase(componentName + intentName) +
            '_ASSERTIONFAILEDQUICKREPLIES_' +
            assertionFailedSpeechCounter;

          nativeCode += `
            if(this.$t("${i18nKeyMessage}")!=="${i18nKeyMessage}") {
            this.$send({
              message: this.$t("${i18nKeyMessage}"),
              text: this.$t("${i18nKeyMessage}"),
              reprompt: this.$t("${i18nKeyMessage}"),
              quickReplies: this.processQuickReplies(this.$t("${i18nKeyQuickReplies}"))
            });
           }`;
          const targetComponent = assert.onAssertionFailed?.delegate?.component;
          const continueHandler = voca.decapitalize(assert.onAssertionFailed?.delegate?.continue);
          if (targetComponent !== undefined && continueHandler !== undefined) {
            nativeCode += `
            return this.$delegate(${targetComponent}, {
              resolve: {
                ['error']: this.helpIntent,
                ['continue']: this.${continueHandler}
              },
              config: {
                duty: 'comeBack'
              }
            });
            `;
          } else {
            nativeCode += `return this.$send({
              speech: this.$t("' + i18nKey + '")
            });\n`;
          }
          nativeCode += '}\n';
        });
      }
    });
  }

  // handle native
  const nativeArray = magicPrototyperModelIntent.native;
  if (nativeArray !== undefined) {
    nativeCode = nativeCode + nativeArray.join('\n');
  }

  // handle onError
  let catchCodeFragment = '';
  catchCodeFragment += '\n} catch (e) {\n';
  catchCodeFragment += 'const error = (e as Error);\n';
  catchCodeFragment += 'console.error("Unexpected error: " + error.message);\n';
  catchCodeFragment += 'console.error({error});\n';

  const errorArray: MagicPrototyperErrorHandler[] | undefined = magicPrototyperModelIntent.onError;

  if (errorArray !== undefined) {
    errorArray.forEach((errorHandler) => {
      errorSpeechCounter++;

      const condition = errorHandler.condition;
      catchCodeFragment += 'if(' + condition + ') {\n';

      const i18nKey =
        camelCaseToScreamingSnakeCase(componentName + intentName) +
        '_ERRORSPEECH_' +
        errorSpeechCounter;

      catchCodeFragment += 'return this.sayMessage({message:this.$t("' + i18nKey + '")});';
      catchCodeFragment += '}';
    });
  }

  catchCodeFragment += '\n// Default error handler\n';
  catchCodeFragment +=
    '\nreturn this.sayMessage({message: this.$t("ERROR_HANDLER_MESSAGE")+": "+error.message});\n';
  catchCodeFragment += '}';

  if (intentName === 'RepeatIntent') {
    // intentionally handle this in the GlobalComponent as shown
    // in https://www.jovo.tech/docs/data
    return '';
  }

  let repromptCodeFragment = '';
  const reprompt = magicPrototyperModelIntent.reprompt;
  const listen = reprompt !== undefined;
  if (listen) {
    repromptCodeFragment = "reprompt: this.$t('" + intentNameScreamingSnakeCase + "_REPROMPT'),";
  }

  let sendCodeFragment = '';
  if (
    magicPrototyperModelIntent.speech !== undefined ||
    magicPrototyperModelIntent.text !== undefined
    // maybe you want more cases here to trigger a "$send(...)" but
    // this should do for most cases
  ) {
    sendCodeFragment = `

    return this.$send({ 
      message: {
        speech: this.$t('${intentNameScreamingSnakeCase}_SPEECH'),
        text: this.$t('${intentNameScreamingSnakeCase}_TEXT'),
      },
      ${repromptCodeFragment}
      listen: ${listen},
      quickReplies
    });
  `;
  }

  const handlerCode = `
/**
 * Implementation of ${intentName} handler
 */
@Intents(['${intentName}'])
  async ${intentNameLowerCaseFirstLetter}(): Promise<any> {
    
    try {

    ${parameterCode}

    const quickReplies = this.processQuickReplies(this.$t('${intentNameScreamingSnakeCase}_QUICKREPLIES'));

    ${nativeCode}

    
    if (this.$component.config?.duty === 'comeBack') {
      return this.$resolve('continue');
    }

    ${sendCodeFragment}

    ${catchCodeFragment}
  
  }
  `;
  return handlerCode;
}

/**
 * Crerate code of footer of a Jovo Component (TypeScript)
 *
 * @returns
 */
function getComponentFooter(): string {
  const footerCode = `
  // footer content
  UNHANDLED() {
    return this.$send({ 
      message: {
        speech: this.$t('UNHANDLED_ERROR_HANDLER_MESSAGE') +'' ,
        text: this.$t('UNHANDLED_ERROR_HANDLER_MESSAGE') +'' 
      },
      reprompt: this.$t('UNHANDLED_ERROR_HANDLER_MESSAGE') +'',
      listen: true,
      quickReplies: this.processQuickReplies(this.$t('UNHANDLED_ERROR_HANDLER_QUICK_REPLIES'))
    });
  }

 }`;
  return footerCode;
}
