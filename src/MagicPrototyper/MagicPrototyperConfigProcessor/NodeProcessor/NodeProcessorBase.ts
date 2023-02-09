import { MagicPrototyperModelValue, MagicPrototyperProperties } from '../../MagicPrototyperTypes';

/**
 * This interface defines the structure of a NodeProcessor.
 *
 * NodeProcessors are used when traversing the MagicPrototyperModelTree
 * recursively.
 *
 * You will find various implementations in this folder and you
 * can add your own implementation for additional functionality.
 */
export class NodeProcessorBase {
  execute(key: string, value: MagicPrototyperModelValue): MagicPrototyperModelValue;

  execute(
    key: string,
    value: MagicPrototyperModelValue,
    contextProperties: MagicPrototyperProperties
  ): MagicPrototyperModelValue;

  execute(
    key: string,
    value: MagicPrototyperModelValue,
    contextProperties?: MagicPrototyperProperties,
    locale?: string
  ): MagicPrototyperModelValue;

  execute(
    key: string,
    value: MagicPrototyperModelValue,
    contextProperties?: MagicPrototyperProperties,
    locale?: string
  ): MagicPrototyperModelValue {
    if (locale === undefined) {
      locale = '';
    }
    if (contextProperties === undefined) {
      contextProperties = {};
    }

    return this.implementation(key, value, contextProperties, locale);
  }

  implementation(
    key: string,
    value: MagicPrototyperModelValue,
    contextProperties?: MagicPrototyperProperties,
    locale?: string
  ): MagicPrototyperModelValue {
    //console.log({ key, value, contextProperties, locale });
    return '';
  }
}
