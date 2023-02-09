import { MagicPrototyperModelValue, MagicPrototyperProperties } from '../../MagicPrototyperTypes';
import { NodeProcessorBase } from './NodeProcessorBase';

/**
 * This NodeProcessor filters out information for a given locale.
 * This is used when creating the Jovo specific model files.
 */
export class LocaleExtractor extends NodeProcessorBase {
  implementation(
    key: string,
    value: MagicPrototyperModelValue,
    contextProperties?: MagicPrototyperProperties,
    locale?: string
  ): MagicPrototyperModelValue {
    if (
      key === 'phrases' ||
      key === 'speech' ||
      key === 'text' ||
      key === 'quickReplies' ||
      key === 'reprompt' ||
      key === 'values'
    ) {
      return value[locale as keyof typeof value];
    }
    return value;
  }
}
