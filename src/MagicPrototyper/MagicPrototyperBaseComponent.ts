/**
 * The contents of this file is generated code. You should therefore
 * not make any changes. They will be lost after the next build process.
 * Use the underlying MagicPrototyper model file if you intend to make any changes.
 **/
import { Jovo, Component, BaseComponent, Intents, QuickReplyValue } from '@jovotech/framework';
import jexl = require('jexl');
import { Context } from 'jexl/Expression';

@Component()
export class MagicPrototyperBaseComponent extends BaseComponent {
  START() {
    // initialize component
  }

  /**
   * Implementation of MessageIntent handler. This is intended to be used from
   * exceptional scenarios like "assertionFailedSpeech".
   */
  @Intents(['MessageIntent'])
  async messageIntent() {
    const utterance = this.processJexlExpressions(this.$request.message as string, this);
    const quickReplies = this.processQuickReplies(this.$t(this.$request.quickRepliesKey as string));
    return this.$send({
      message: utterance,
      text: utterance,
      reprompt: utterance,
      listen: true,
      quickReplies
    });
  }

  /**
   * This method can be used to read a message by a localized key in
   * exceptional cases like an error situation.
   *
   * @param param0
   * @returns
   */
  sayMessage({
    message = '',
    quickRepliesKey = ''
  }: {
    message?: string;
    quickRepliesKey?: string;
  }) {
    this.$request.message = message;
    this.$request.quickRepliesKey = quickRepliesKey;
    // read message and stay in same component
    return this.messageIntent();
    //    return this.$redirect(this.$component, 'messageIntent');
  }

  processJexlExpressions(text: string, jovo: Jovo) {
    const jexlContext = {
      $component: jovo.$component,
      $data: jovo.$data,
      $device: jovo.$device,
      $entities: jovo.$entities,
      $input: jovo.$input,
      $request: jovo.$request,
      $route: jovo.$route,
      $session: jovo.$session,
      $state: jovo.$state,
      $user: jovo.$user,
      $platform: jovo.$platform
    };
    const result = this.processJexlExpression(text, jexlContext);
    return result;
  }

  processJexlExpression(text: string, jexlContext: Context): string {
    // example of how to add functionality
    /*
    Object.getOwnPropertyNames(Math).forEach((functionName) => {
      jexl.addFunction(functionName, Math[functionName as keyof typeof Math]);
    });
    Object.getOwnPropertyNames(Voca).forEach((functionName) => {
      JEXL.addFunction(functionName, Voca[functionName as keyof typeof Voca]);
    });
    */
    let newText = text;
    const regEx = new RegExp(/\${(.+?)}/g);
    let matches = regEx.exec(text);
    while (matches !== null) {
      // matches[0] = 8
      // matches[1] = 4+4
      const result = jexl.evalSync(matches[1], jexlContext);
      newText = newText.replace(matches[0], result);
      matches = regEx.exec(text);
    }
    return newText;
  }

  processQuickReplies(stringBasedQuickReplies: string | string[]): QuickReplyValue[] {
    let quickReplies;
    if (typeof stringBasedQuickReplies === 'string') {
      // intentionally do nothing
    } else {
      // use config for setting
      quickReplies = stringBasedQuickReplies;
    }
    return quickReplies as unknown as QuickReplyValue[];
  }
}
