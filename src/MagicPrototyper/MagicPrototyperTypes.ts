import type { BuildPlatformContext } from '@jovotech/cli-command-build';
export type MagicPrototyperModel = {
  invocation: {
    alexa?: string;
    googleAssistant?: string;
  };
  version: string;
  generateForLocales?: string[];
  sqliteDatabase?: {
    sqliteDbFileName: string;
    maxGeneratedSlotSize: number;
  };
  config?: {
    [key: string]:
      | string
      | string[]
      | {
          [localeKey: string]: MagicPrototyperProperty;
        };
  };
  componentHeaderLines?: string[];
  components: [
    {
      componentName: string;
      intents: {
        [intentName: string]: {
          alexa?: { name: string };
          dialogFlow?: { events: [{ name: string }] };
          phrases: {
            [localeKey: string]: MagicPrototyperProperty;
          };
          assert?: MagicPrototyperAssertion[];
          entities?: {
            [localeKey: string]: {
              type:
                | string
                | {
                    alexa?: string;
                    googleAssistant?: string;
                    nlpjs?: string;
                  };
              assert?: MagicPrototyperAssertion[];
            };
          };
          native?: string[];
          onError?: MagicPrototyperErrorHandler[];
          speech?: {
            [localeKey: string]: MagicPrototyperProperty;
          };
          text?: {
            [localeKey: string]: MagicPrototyperProperty;
          };
          reprompt?: {
            [localeKey: string]: MagicPrototyperProperty;
          };
          quickReplies?: {
            [localeKey: string]: MagicPrototyperProperty;
          };
        };
      };
      alexa?: { interactionModel: { languageModel: { intents: [] } } };
      entityTypes: {
        [typeName: string]: {
          values: {
            [localeKey: string]: MagicPrototyperProperty;
          };
        };
      };
    }
  ];
};

export type MagicPrototyperAssertion = {
  description?: string;
  condition: string;
  onAssertionFailed: {
    assertionFailedSpeech?: {
      [localeKey: string]: MagicPrototyperProperty;
    };
    /*    text?: {
      [localeKey: string]: MagicPrototyperProperty;
    };
    reprompt?: {
      [localeKey: string]: MagicPrototyperProperty;
    };*/
    assertionFailedQuickReplies?: {
      [localeKey: string]: MagicPrototyperProperty;
    };
    delegate: {
      component: string;
      continue: string;
    };
  };
};

export type MagicPrototyperErrorHandler = {
  condition: string;
  errorSpeech: {
    [localeKey: string]: MagicPrototyperProperty;
  };
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type MagicPrototyperModelValue = string | string[] | object;

/**
 * MagicPrototyperContext = JovoContext + property information from model file
 */

export type MagicPrototyperContext = BuildPlatformContext & {
  magicPrototyperProperties: MagicPrototyperProperties;
};

export type MagicPrototyperProperties = {
  [key: string]: MagicPrototyperProperty;
};

export type MagicPrototyperProperty =
  | string
  | string[]
  | {
      [locale: string]: string | string[];
    }
  | (
      | string
      //      | null
      | {
          value: string;
          id: string;
          synonyms: string[];
        }
    )[];

export type CodeArtifacts = {
  componentCode: string;
  [localeKey: string]: string;
};
