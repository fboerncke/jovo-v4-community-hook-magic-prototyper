import { MagicPrototyperModelValue, MagicPrototyperProperties } from '../../MagicPrototyperTypes';
import { NodeProcessorBase } from './NodeProcessorBase';
import jexl = require('jexl');

/**
 * This NodeProcessor evalutes Jexl expressions found within node values.
 *
 * This is executed at build time but not at runtime
 *
 * Learn more about Jexl here:
 * https://github.com/TomFrost/Jexl
 */
export class JexlEvaluator extends NodeProcessorBase {
  implementation(
    key: string,
    value: MagicPrototyperModelValue,
    contextProperties?: MagicPrototyperProperties
    //locale?: string,
  ): MagicPrototyperModelValue {
    jexl.addFunction('join', (array: string[], joinString: string, lastJoinString: string) => {
      if (array === undefined) {
        throw Error('skip here and keep expression for later');
      }
      if (joinString === undefined) {
        joinString = ',';
      }
      if (lastJoinString === undefined) {
        lastJoinString = joinString;
      }

      const length = array.length;
      if (length === 0) {
        return '';
      } else if (length === 1) {
        return array[0];
      } else if (length === 2) {
        return array.join(lastJoinString);
      } else {
        // length >= 3
        const allButLast = array.slice(0, length - 1);
        const lastElement = array[length - 1];
        return allButLast.join(joinString) + lastJoinString + lastElement;
      }
    });

    if (typeof value === 'string') {
      for (const contextKey in contextProperties) {
        if (value === '${' + contextKey + '}') {
          // some expression like '${varName}' can return pure
          // javascript data structures like e.g. Arrays
          return contextProperties[contextKey];
        }
      }

      const regEx = new RegExp(/\${(.+?)}/g);
      let newText = value;
      let matches = regEx.exec(value);
      while (matches !== null) {
        // matches[0] = ${4+4}
        // matches[1] = 4+4
        try {
          const result = jexl.evalSync(matches[1], contextProperties);

          // console.log('JEXL result for expression ${' + matches[1] + '}: ' + result);
          if (result !== undefined && !result.contains('undefined')) {
            // ignore undefined results during build time because
            // this expression may work later at runtime
            newText = newText.replace(matches[0], result);
          }
        } catch (intentionallyIgnore) {
          // ignore error during build time because this expression
          // may work later at runtime
        }

        matches = regEx.exec(value);
      }
      return newText;
    }

    // may be an array
    if (Array.isArray(value)) {
      // is array
      return value;
    } else {
      // is object
      return value;
    }
  }
}
