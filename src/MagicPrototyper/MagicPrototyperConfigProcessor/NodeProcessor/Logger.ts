import { MagicPrototyperModelValue, MagicPrototyperProperties } from '../../MagicPrototyperTypes';
import { isArrayOfStrings } from '../../MagicPrototyperUtils';
import { NodeProcessorBase } from './NodeProcessorBase';

/**
 * This NodeProcessor simply logs information to the console about every
 * visited node during the recursive traversal. This may help when debugging
 * your configuration. You will likely not use this NodeProcessor when
 * everything is working as expected.
 */
export class Logger extends NodeProcessorBase {
  implementation(
    key: string,
    value: MagicPrototyperModelValue,
    contextProperties?: MagicPrototyperProperties,
    locale?: string
  ): MagicPrototyperModelValue {
    let printableValueType = typeof value as string;
    if (isArrayOfStrings(value)) {
      printableValueType = 'string[]';
    } else if (printableValueType === 'object') {
      //console.log({ objectValue: value });
    }
    const printableKeyType = typeof key as string;

    // now log the content of the model node
    console.log({ key, keyType: printableKeyType, value, valueType: printableValueType, locale });
    return value;
  }
}
