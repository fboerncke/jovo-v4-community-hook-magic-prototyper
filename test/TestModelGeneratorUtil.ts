import { MagicPrototyperModel } from '../src/MagicPrototyper/MagicPrototyperTypes';

/**
 * Create a huge model for test purposes
 *
 * @returns
 */
export function getTestModelBig(): any {
  return JSON.parse(JSON.stringify(magicPrototyperTestModelBig));
}

const magicPrototyperTestModelBig: MagicPrototyperModel = {
  invocation: {
    alexa: 'define this value in file jovo.project.ts',
    googleAssistant: 'define this value in file jovo.project.ts'
  },
  version: '4.0',
  config: {
    someKey1: {
      de: 'willkommen1',
      en: 'welcome1'
    },
    someKey2: {
      de: 'willkommen2',
      en: 'welcome2'
    },
    myTest: {
      de: 'hallo',
      en: 'hello'
    },
    myPayArray: {
      de: [
        'Die Rechnung bitte',
        'Herr Ober [Ich [will|möchte] [|jetzt] [|bitte|gerne]] zahlen mit {paymentType}'
      ],
      en: ['[|The] bill please', 'I [|want to] pay with {paymentType}']
    },
    PaymentTypeArray: {
      de: [
        'bar',
        'master',
        'bar',
        'amex',
        '',
        //null,
        'scheck',
        'paypal',
        'bitcoin',
        {
          value: 'Visa',
          id: 'visa',
          synonyms: ['Visa', 'Visa', '${myTest}', 'Visa Karte', 'Meine Visa Karte']
        }
      ],
      en: [
        'cash',
        'master',
        'amex',
        'cheque',
        'paypal',
        'bitcoin',
        {
          value: 'Visa',
          id: 'visa',
          synonyms: ['Visa', 'Visa Card', 'My Visa Card']
        }
      ]
    },
    someKeyInternational: 'for all locales'
  },
  sqliteDatabase: {
    sqliteDbFileName: './some-demo-db.sqlite',
    maxGeneratedSlotSize: 100
  },
  components: [
    {
      componentName: 'TestModelSmall',
      intents: {
        WelcomeIntent: {
          phrases: {
            de: ['willkommen'],
            en: ['welcome']
          },
          speech: {
            de: ['[ALPHA|BETA] Willkommen bei Happy Party'],
            en: ['Welcome to Happy Party']
          },
          text: {
            de: ['1221 Willkommen bei Happy Party'],
            en: ['Welcome to Happy Party']
          },
          reprompt: {
            de: ['Was magst Du machen? Frage zum Beispiel nach Hilfe.'],
            en: ['What do you want to do? You may ask for help.']
          }
        },

        YesIntent: {
          alexa: {
            name: 'AMAZON.YesIntent'
          },
          phrases: {
            de: ['${myTest}', '[ja|jaaa|jax] [|bitte] ', 'ja', 'klar', 'xxx'],
            en: ['${myTest}', '[fine|yes|correct|agreed] [|please] ', 'yes', 'clear', 'yyy']
          },
          speech: {
            de: ['Ja erkannt '],
            en: ['Yes heard. ']
          },
          text: {
            de: ['Ja erkannt '],
            en: ['Yes heard. ']
          }
        },
        NoIntent: {
          alexa: {
            name: 'AMAZON.NoIntent'
          },
          phrases: {
            de: ['nein', 'nein danke'],
            en: ['no', 'no thanks']
          },
          speech: {
            de: ['Nein erkannt '],
            en: ['No heard. ']
          },
          text: {
            de: ['Nein erkannt '],
            en: ['No heard. ']
          }
        },
        PayIntent: {
          phrases: {
            de: '${myPayArray}',
            en: '${myPayArray}'
          },
          entities: {
            paymentType: {
              type: 'PaymentType'
            }
          },
          speech: {
            de: ['Pay erkannt '],
            en: ['Pay heard. ']
          },
          text: {
            de: ['Pay erkannt '],
            en: ['Pay heard. ']
          }
        },

        RepeatIntent: {
          alexa: {
            name: 'AMAZON.RepeatIntent'
          },
          phrases: {
            de: ['nochmal', 'wie bitte'],
            en: ['again', 'pardon']
          },
          native: ['// console.log(city);', '// console.log(quickReplies);'],

          speech: {
            de: ['Nochmal: ${$session.data.REPEAT}'],
            en: ['Again: ${$session.data.REPEAT}']
          },
          text: {
            de: ['Nochmal:'],
            en: ['Again: ']
          },
          reprompt: {
            de: ['Nochmal: ${$session.data.REPEAT}'],
            en: ['Again: ${$session.data.REPEAT}']
          }
        },

        StopIntent: {
          alexa: {
            name: 'AMAZON.StopIntent'
          },
          dialogFlow: {
            events: [
              {
                name: 'actions_intent_CANCEL'
              }
            ]
          },
          phrases: {
            de: ['Stop', 'Stopp'],
            en: ['Stop', 'Stopp']
          },
          speech: {
            de: ['Auf Wiedersehen'],
            en: ['Good Bye']
          },
          text: {
            de: ['Auf Wiedersehen'],
            en: ['Good Bye']
          }
        },

        CancelIntent: {
          alexa: {
            name: 'AMAZON.CancelIntent'
          },
          phrases: {
            de: ['Abbrechen'],
            en: ['Cancel']
          },
          speech: {
            de: ['Auf Wiedersehen'],
            en: ['Good Bye']
          },
          text: {
            de: ['Auf Wiedersehen'],
            en: ['Good Bye']
          }
        },

        HelpIntent: {
          alexa: {
            name: 'AMAZON.HelpIntent'
          },
          phrases: {
            de: [
              '[|ich brauche] [Hilfe|Unterstützung]',
              'Was nun',
              'Was kann ich [|hier] machen',
              'Keine Ahnung',
              'ich weiss nicht'
            ],
            en: ['Help', 'what now', 'what can i do [|now]', 'No clue']
          },
          speech: {
            de: ['Frage zum Beispiel nach Hilfe. '],
            en: ['You may ask for help. ']
          },
          text: {
            de: ['Frage zum Beispiel nach Hilfe. '],
            en: ['You may ask for help. ']
          },
          reprompt: {
            de: ['Wie weiter'],
            en: ['What now']
          },
          quickReplies: {
            de: ['Hilfe', 'Neustart', 'Test'],
            en: ['Help', 'Restart', 'Test']
          }
        },
        StartOverIntent: {
          alexa: {
            name: 'AMAZON.StartOverIntent'
          },
          phrases: {
            de: ['von vorne', 'neustart', 'beginne erneut'],
            en: ['from beginning', 'restart', 'reset [|application]']
          }
        }
      },
      alexa: {
        interactionModel: {
          languageModel: {
            intents: []
          }
        }
      },

      entityTypes: {
        PaymentType: {
          values: {
            de: '${PaymentTypeArray}',
            en: '${PaymentTypeArray}'
          }
        },
        myCityEntityType: {
          values: {
            de: [
              'Berlin',
              {
                value: 'New York',
                id: 'nyc',
                synonyms: ['Big Apple']
              },
              'München'
            ],
            en: ['Berlin', 'New York', 'Munich']
          }
        },
        integerNumberType: {
          values: {
            de: [
              {
                value: '1',
                id: '1',
                synonyms: ['1', 'eins']
              },
              {
                value: '2',
                id: '2',
                synonyms: ['2', 'zwei']
              },
              {
                value: '3',
                id: '3',
                synonyms: ['3', 'drei']
              },
              {
                value: '4',
                id: '4',
                synonyms: ['4', 'vier']
              }
            ],
            en: [
              {
                value: '1',
                id: '1',
                synonyms: ['1', 'one']
              },
              {
                value: '2',
                id: '2',
                synonyms: ['2', 'two']
              },
              {
                value: '3',
                id: '3',
                synonyms: ['3', 'three']
              },
              {
                value: '4',
                id: '4',
                synonyms: ['4', 'four']
              }
            ]
          }
        },
        ordinalNumberType: {
          values: {
            de: [
              {
                value: '1',
                id: '1',
                synonyms: ['erste', 'erster']
              },
              {
                value: '2',
                id: '2',
                synonyms: ['zweite', 'zweiter']
              },
              {
                value: '3',
                id: '3',
                synonyms: ['dritte', 'dritter']
              },
              {
                value: '4',
                id: '4',
                synonyms: ['vierte', 'vierter']
              }
            ],
            en: [
              {
                value: '1',
                id: '1',
                synonyms: ['first']
              },
              {
                value: '2',
                id: '2',
                synonyms: ['second']
              },
              {
                value: '3',
                id: '3',
                synonyms: ['third']
              },
              {
                value: '4',
                id: '4',
                synonyms: ['fourth']
              }
            ]
          }
        },
        ColumnNameType: {
          values: {
            de: '${AllColumnNamesList}',
            en: '${AllColumnNamesList}'
          }
        },
        TableNameType: {
          values: {
            de: '${TableNameList}',
            en: '${TableNameList}'
          }
        },
        sortOrderType: {
          values: {
            de: [
              {
                value: 'asc',
                id: 'asc',
                synonyms: ['ascending', 'aufsteigend', 'kleine werte zuerst']
              },
              {
                value: 'desc',
                id: 'desc',
                synonyms: ['descending', 'absteigend', 'große werte zuerst']
              }
            ],
            en: [
              {
                value: 'asc',
                id: 'asc',
                synonyms: ['ascending', 'small values first']
              },
              {
                value: 'desc',
                id: 'desc',
                synonyms: ['descending', 'big values first']
              }
            ]
          }
        },
        comparatorType: {
          values: {
            de: [
              {
                value: 'equal',
                id: 'equal',
                synonyms: ['gleich', 'identisch mit', 'entspricht']
              },
              {
                value: 'greater',
                id: 'greater',
                synonyms: ['grösser als', 'mehr als', 'grösser']
              },
              {
                value: 'smaller',
                id: 'smaller',
                synonyms: ['kleiner als', 'weniger als ', 'kleiner']
              }
            ],
            en: [
              {
                value: 'equal',
                id: 'equal',
                synonyms: ['equal', 'equals', 'same as']
              },
              {
                value: 'greater',
                id: 'greater',
                synonyms: ['greater than', 'greater', 'more than', 'more as']
              },
              {
                value: 'smaller',
                id: 'smaller',
                synonyms: ['smaller than', 'smaller', 'less than', 'less as']
              }
            ]
          }
        }
      }
    }
  ]
};

/**
 * Create a small model for test purposes
 *
 * @returns
 */
export function getTestModelSmall(): any {
  return JSON.parse(JSON.stringify(magicPrototyperTestModelSmall));
}

const magicPrototyperTestModelSmall: MagicPrototyperModel = {
  invocation: {
    alexa: 'define this value in file jovo.project.ts',
    googleAssistant: 'define this value in file jovo.project.ts'
  },
  version: '4.0',
  config: {
    someLocalizedString: {
      de: 'Willkommen',
      en: 'Welcome'
    },
    someLocalizedArray: {
      de: ['ALPHA', 'BETA'],
      en: ['GAMMA', 'DELTA']
    },
    someInternationalString: 'international value',
    someInternationalArray: ['IOTA', 'KAPPA']
  },
  components: [
    {
      componentName: 'TestComponentSmall',
      intents: {
        WelcomeIntent: {
          phrases: {
            de: ['${someLocalizedString}'],
            en: ['${someLocalizedString}']
          },
          speech: {
            de: '${someLocalizedArray}',
            en: '${someLocalizedArray}'
          },
          text: {
            de: ['${someInternationalString}'],
            en: ['${someInternationalString}']
          },
          reprompt: {
            de: '${someInternationalArray}',
            en: '${someInternationalArray}'
          }
        }
      },
      entityTypes: {
        MyTestType: {
          values: {
            de: '${someLocalizedArray}',
            en: '${someLocalizedArray}'
          }
        }
      }
    }
  ]
};
