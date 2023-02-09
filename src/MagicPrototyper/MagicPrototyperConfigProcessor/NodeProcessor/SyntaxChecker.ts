import { MagicPrototyperModelValue } from '../../MagicPrototyperTypes';
import { NodeProcessorBase } from './NodeProcessorBase';

/**
 * This NodeProcessor shows how to perfom some syntax check on a node.
 * We currently do not use this but it may help to implement your own validator.
 */
export class SyntaxChecker extends NodeProcessorBase {
  implementation(
    key: string,
    value: MagicPrototyperModelValue
    // contextProperties: MagicPrototyperProperties,
    //locale?: string,
  ): MagicPrototyperModelValue {
    if (typeof value === 'string') {
      //console.log('Checking syntax for ' + value);

      if (!value.match(/^[{}äöüÄÖÜßa-zA-Z0-4_\. ]*$/)) {
        throw new Error('Invalid syntax error in node ' + key + ': ' + value);
      }
    }
    return value;
  }
}
