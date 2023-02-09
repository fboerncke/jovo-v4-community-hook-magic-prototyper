import { MagicPrototyperModelValue } from '../../MagicPrototyperTypes';
import { isArrayOfStrings } from '../../MagicPrototyperUtils';
import { NodeProcessorBase } from './NodeProcessorBase';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Spinner = require('node-spintax');

/**
 * This NodeProcessor looks for Spintax expressions in nodes and
 * replaces/explodes the nodes with all possible permutations.
 *
 * Watch out: there may be a lot permutations so make sure that
 * the result will not affect the performance on the target platform.
 */
export class SpintaxExploder extends NodeProcessorBase {
  implementation(
    key: string,
    value: MagicPrototyperModelValue
    //    contextProperties: MagicPrototyperProperties,
    //    locale?: string,
  ): MagicPrototyperModelValue {
    if (key === 'de' || key === 'en' || key === 'synonyms') {
      if (isArrayOfStrings(value)) {
        return createAllPermutationsFromSpinnerArray(value);
      }
    }
    return value;
  }
}

function createAllPermutationsFromSpinnerArray(spinnerDefinitionArray: string[]): string[] {
  let resultArray: string[] = [];
  for (const spinnerDefinition in spinnerDefinitionArray) {
    resultArray = resultArray.concat(
      createAllPermutations(spinnerDefinitionArray[spinnerDefinition])
    );
  }
  return resultArray;
}

function createAllPermutations(spinnerDefinition: string): string[] {
  if (spinnerDefinition === undefined || spinnerDefinition === null) {
    return [];
  }

  //console.log({spinnerDefinition});
  if (typeof spinnerDefinition === 'object') {
    return spinnerDefinition;
  }
  const spinner = new Spinner(spinnerDefinition, {
    syntax: {
      startSymbol: '[',
      endSymbol: ']',
      delimiter: '|'
    }
  });
  const resultArray = spinner.unspin();
  return resultArray.map((element: string) => element.trim().replace(/ {1,}/g, ' '));
}
