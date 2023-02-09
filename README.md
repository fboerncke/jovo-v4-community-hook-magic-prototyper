<a href= "https://prototypefund.de/project/voice-ql-datentabellen-mit-gesprochener-sprache-barrierefrei-erkunden/"><img src="./images/assets/voice-ql-ring.png" width="40%" height="40%" align="right"></a>

# Magic Prototyper for Jovo V4

**NOTE: this version is beta and development is ongoing. You may use the code but be prepared for unannounced breaking changes!**

## Introduction

The Magic Prototyper project is a code generator for voice applications.

When coding a voice app are you familiar with the following situation? You have a Jovo app running already for a set of locales and want to **add one more intent**. The *big pain* now is that to make this happen you have to touch so many files:

- Voice models for all locales
- i18n files for all locales
- The intent implementation code

This happens especially often when prototyping a new app where you create, update, remove and refine intents as an ongoing process.

### How can **Magic Prototyper** help here? 

Think of **Magic Prototyper** as a powerful variant of [`Magic Model`](https://www.npmjs.com/package/jovo-v4-community-hook-magic-model) that not only creates voice models but also ready to use code artifacts.

The idea is to **use one and only one main json file** called `MagicPrototyperModel.json` to have a central point of configuration for voice models and code artifacts. This way there is less need to switch between so many open tabs in your code editor.

### Code Generator

Based on this one file **Magic Prototyper** generator will automatically create:

- Jovo compatible voice model files for all configured locales
- i18n files for all selected locales (including auto created label names)
- Multiple component files (Typescript)
- Intent implementations within the components. The code refers to labels in the i18n files (Typescript)

The resulting code artifacts support:

- JEXL
- Spintax

The code generated is intended to be used as a starting point for further development and customizations.

### Build process / Preprocessing

**Magic Prototyper** hooks into the Jove build process.

So once configured when running a command like `jovo build:platform alexa` then Magic Prototyper does the following:

1. Load the `MagicPrototyperModel.json` file from the `magicPrototyper` folder in your workspace
2. Build jovo compatible voice model files expanding all Spintax expressions
3. Build i18n files for all configured locales and auto created label names which can be used to access those labels
4. Create implementation code for Jovo components using Typescript
5. Proceed with the standard Jovo build process

The **MagicPrototyper** model may contain both JEXL and Spintax expressions.

## Generated Code

The contents of the generated code files are not intended to be changed manually. Any changes made to the code will be lost after the next build process. If you wish to make any changes, it is recommended to use the underlying **MagicPrototyper** model file.

## Installation

The hook can be installed as a package via **[npmjs](https://www.npmjs.com/)**. For more information see here:

[![NPM](https://nodei.co/npm/jovo-v4-community-hook-magic-prototyper.png)](https://nodei.co/npm/jovo-v4-community-hook-magic-prototyper/)

From the console you may install the hook right into your Jovo project and save the dependency in your **package.json**:

`npm install jovo-v4-community-hook-magic-prototyper --save`

Register the hook in:

`jovo.project.js`:

```javascript
const { MagicPrototyper } = require("jovo-v4-community-hook-magic-prototyper");

const project = new ProjectConfig({
  hooks: {
    'before.build:platform': [MagicPrototyper],
  }, // [...]

```

`jovo.project.ts`:

```typescript
import { MagicPrototyper } from "jovo-v4-community-hook-magic-prototyper";

const project = new ProjectConfig({
  hooks: {
    'before.build:platform': [MagicPrototyper],
  }, // [...]
```

## Magic Prototyper configuration file format

The **MagicPrototyper** supports a lot of features. The file format definition given in `MagicPrototyperTypes` can give you a first idea about what is possible:

```typescript
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

```
To see what you can build we recommend to have a closer look at the following example applications:

## Example Application

The project includes a simple configuration file prepared to use locales '``de``' and '``en``' for a simple `Hello Pizza` example application.

The generated code includes implementation of various intents and handlers, such as `ThanksIntent`, `BadWordIntent`, `YesIntent`, `NoIntent`, `StopIntent`, `CancelIntent`, `HelpIntent`, `StartOverIntent`, and `MessageIntent`.

For those interested in a **bigger example**: the code for the **Voice QL** project has been built using **Magic Prototyper**.

## Implementation details

This section is for those interested in the implementation details. When you only want to use the functionality then you can skip this part.

### Deep Recursive Visitor

The **MagicPrototyper** project includes a deep recursive visitor for the **MagicPrototyper** model tree. This visitor is used to perform various operations on the nodes, such as evaluating Jexl expressions, checking for syntax, expanding Spintax expressions, filtering locale specific information, logging information, and more.

A deep recursive visitor is a design pattern in computer programming that is used to traverse complex data structures, such as trees or graphs, in a recursive manner. The idea behind a deep recursive visitor is to have a single method, called the "visit" method, that can handle the processing of elements at each node of the data structure. This method is called recursively on the child nodes of each node, until the entire data structure has been processed.

This design pattern is useful for processing data structures in a way that is both structured and readable, and it provides a way to encapsulate complex processing logic within a single method. The deep recursive visitor pattern is commonly used in compilers and other applications that deal with complex data structures. There are several reasons why a deep recursive visitor can be useful:

- Modularity: The deep recursive visitor pattern provides a way to encapsulate the processing logic for a complex data structure within a single method. This makes it easier to write, maintain, and understand the code.

- Reusability: By separating the processing logic from the data structure itself, a deep recursive visitor can be used to process multiple instances of the same data structure in a modular way.

- Readability: The deep recursive visitor pattern provides a clear and structured way to traverse complex data structures, making the code more readable and understandable.

- Flexibility: The deep recursive visitor pattern is flexible and can be easily adapted to handle changes in the data structure, such as adding or removing elements, without requiring major changes to the processing logic.

- Performance: In some cases, the deep recursive visitor pattern can be more efficient than alternative approaches, such as a depth-first search, for processing complex data structures.

- Overall, the deep recursive visitor pattern is a powerful tool for processing complex data structures in a modular, reusable, readable, flexible, and efficient way.

### Custom Node Processors

The visitor uses various NodeProcessors to perform these operations. The project includes several NodeProcessors, such as `JexlEvaluator`, `SyntaxChecker`, `SpintaxExploder`, `LocaleExtractor`, `Logger`, etc.

You can also create your own NodeProcessors for additional functionality. Your code must then extend the code defined in the file `NodeProcessorBase.ts`. For your own experiments the code in `Logger.ts` may be a good place to start.

## F.A.Q.

- "_Do you use Magic Prototyper in your own work?_"

  Yes. So far it saved me a lot of time and I strongly believe this could be useful for others too.

- "_Can I build big projects using Magic Prototyper?_"

  Well: you maybe could. But decades of software engineering taught us that using concepts like *modules* and *separation of concerns* make sense and come with advantages regarding code maintenance.

  As used here the term *Modules* refers to the practice of breaking down a complex system into smaller, self-contained units that can be developed, tested, and maintained independently. This allows developers to focus on specific areas of the code, reducing complexity and making it easier to understand and maintain. Modules also promote reusability, as individual units can be reused in different parts of the system.

  The term *Separation of concerns* refers to the practice of dividing a system into separate parts, each with a specific responsibility. This allows developers to create a clear and well-defined structure for the system, making it easier to understand and maintain. For example, separating the user interface from the business logic in an application makes it easier to maintain and improve each part independently.

  Together, these concepts have been widely adopted in software engineering and have been proven to have a positive impact on code maintainability. By promoting clear, modular, and well-structured code, they help to reduce complexity and make it easier to maintain and improve software over time. This has been demonstrated through decades of experience and best practices in software engineering, and has led to the conclusion that using concepts like modules and separation of concerns makes sense and provides advantages in terms of code maintenance.

  **Summarizing**: As the name suggests `Magic Prototyper` is intended to be used for _prototypes_. At some point I believe you have to let go and continue maybe using the `Magic Model` plugin which opposed to `Magic Prototyper` definitely makes sense for big projects too.

- "_I like this. How can I help?_"

  Spread the word.

- "_Sorry, this doesn't work for me but I have an idea to make this a better tool._"

  I am happy about feedback and suggestions. Send me a note via `frank.boerncke@gmail.com`.

## License

Apache V2

## Acknowledgements

The code published here is part of the project "[Voice QL](https://prototypefund.de/project/voice-ql-datentabellen-mit-gesprochener-sprache-barrierefrei-erkunden/)" which receives funding from the [German Federal Ministry of Education and Research](https://www.bmbf.de/) (FKZ 01IS22S30)

[![Logo Bundesministerium für Bildung und Forschung](./images/assets/logo-bmbf.svg)](https://www.bmbf.de/)
&nbsp; &nbsp;
[![Logo Open Knowledge Foundation](./images/assets/logo-okfn.svg)](https://okfn.de)
&nbsp; &nbsp;
[![Logo Prototype Fund](./images/assets/PrototypeFund_Logo_smallest.svg)](https://prototypefund.de/)

The Prototype Fund is a project of the Open Knowledge Foundation Germany, funded by the German Federal Ministry of Education and Research (BMBF).
