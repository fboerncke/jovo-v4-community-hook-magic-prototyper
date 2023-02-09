// use this recursive function with a parse function

import { MagicPrototyperModel, MagicPrototyperProperties } from '../MagicPrototyperTypes';
import { NodeProcessorBase } from './NodeProcessor/NodeProcessorBase';

export function traverseAndProcessJsonTree(
  magicPrototyperModel: MagicPrototyperModel,
  nodeProcessorClass: typeof NodeProcessorBase,
  contextProperties: MagicPrototyperProperties,
  locale?: string
): MagicPrototyperModel {
  if (locale === undefined) {
    locale = '';
  }

  const factory = new NodeProcessorFactory();
  const nodeProcessor = factory.create(nodeProcessorClass) as NodeProcessorBase;
  const result = recursiveDescent(magicPrototyperModel, nodeProcessor, contextProperties, locale);
  return result;
}

/**
 * Deep recursive visitor of MagicPrototyper model tree
 *
 * @param modelNode
 * @param nodeProcessor
 * @param contextProperties
 * @param locale
 * @returns
 */
function recursiveDescent(
  modelNode: any,
  nodeProcessor: NodeProcessorBase,
  contextProperties: MagicPrototyperProperties,
  locale: string
): any {
  for (const key in modelNode) {
    if (typeof modelNode[key] === 'object' && modelNode[key] !== null) {
      modelNode[key] = nodeProcessor.execute(key, modelNode[key], contextProperties, locale);

      recursiveDescent(modelNode[key], nodeProcessor, contextProperties, locale);

      if (Array.isArray(modelNode[key])) {
        // collapse nested arrays
        modelNode[key] = modelNode[key].flat();
      }
    } else if (modelNode.hasOwnProperty(key)) {
      // process value and update object
      //console.log({ modelNode, key, result: modelNode[key] });
      try {
        modelNode[key] = nodeProcessor.execute(key, modelNode[key], contextProperties, locale);
      } catch (error) {
        // intentionally ignore ==> do not update value if we cannot process it
      }
    }
  }
  return modelNode;
}

class NodeProcessorFactory {
  create<T>(type: new () => T): T {
    return new type();
  }
}
