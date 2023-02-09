import { MagicPrototyperModel, MagicPrototyperContext } from './MagicPrototyperTypes';
import voca from 'voca';
import initSqlJs from 'sql.js';
import fs from 'fs';

/**
 * Make input string in 'camelCase' appear as 'SCREAMING_SNAKE_CASE'
 *
 * @param someText
 * @returns
 */
export function camelCaseToScreamingSnakeCase(someText: string): string {
  return someText
    .split(/\.?(?=[A-Z])/)
    .join('_')
    .toUpperCase();
}

/**
 * Force first letter of input string to be lower case
 *
 * @param someText
 * @returns
 */
export function lowerCaseFirstLetter(someText: string): string {
  return someText.charAt(0).toLowerCase() + someText.slice(1);
}

/**
 * For an unknown object check if it is a string[] (Array of strings)
 *
 * https://stackoverflow.com/questions/23130292/test-for-array-of-string-type-in-typescript
 *
 * @param value
 * @returns
 */
export function isArrayOfStrings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

/**
 * Load universal and locale specific config settings
 * from file and add those to the MagicPrototyper context.
 *
 * In case an sqlite database file is configured then
 * evaluate the contents to make it available in the MagicPrototyper
 * conversion/generation process.
 *
 * The parameter 'maxGeneratedSlotSize' can be used to cut off
 * long list which will help to avoid the voice model to explode.
 *
 * @param magicPrototyperContext
 * @param locale
 * @returns
 */
export async function updateContextWithUserConfig(
  magicPrototyperModel: MagicPrototyperModel,
  magicPrototyperContext: MagicPrototyperContext,
  locale: string
): Promise<MagicPrototyperContext> {
  if (magicPrototyperContext.magicPrototyperProperties === undefined) {
    // initialize context if not exists
    magicPrototyperContext.magicPrototyperProperties = {};
  }

  /////////////////////

  const theModelConfig = magicPrototyperModel.config; // may be undefined
  if (theModelConfig !== undefined) {
    Object.keys(theModelConfig).forEach((key: string) => {
      const pureValue = theModelConfig[key];
      if (typeof pureValue === 'string' || Array.isArray(pureValue)) {
        magicPrototyperContext.magicPrototyperProperties[key] = pureValue; // as MagicPrototyperProperty;
      } else {
        magicPrototyperContext.magicPrototyperProperties[key] =
          pureValue[locale as keyof typeof pureValue];
      }
    });
  }

  const optionalComponentHeaderLines = magicPrototyperModel.componentHeaderLines; // optional
  if (optionalComponentHeaderLines !== undefined) {
    magicPrototyperContext.magicPrototyperProperties['ComponentHeaderLines'] =
      optionalComponentHeaderLines;
  }

  const optionalSqliteConfiguration = magicPrototyperModel.sqliteDatabase; // optional
  if (optionalSqliteConfiguration !== undefined) {
    magicPrototyperContext.magicPrototyperProperties['SqliteDbFileName'] =
      optionalSqliteConfiguration.sqliteDbFileName;

    const filebuffer = fs.readFileSync(optionalSqliteConfiguration.sqliteDbFileName);
    const SQL = await initSqlJs();
    const db = new SQL.Database(filebuffer);

    const tableNameQueryResult = db.exec(
      "SELECT name FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE 'sqlite_%' "
    );

    const tableNames: string[] = tableNameQueryResult[0].values.map((tableName) =>
      tableName.toString().toLowerCase()
    );
    magicPrototyperContext.magicPrototyperProperties['TableNameList'] = tableNames;

    // get all column names from all tables and preapre a list to be used for the language model
    let allColumnNames: string[] = [];
    for (const tableName of tableNames) {
      const columnNameQueryResult = db.exec('PRAGMA table_info("' + tableName + '")');
      const columnNamesOfOneTable = columnNameQueryResult[0].values.map(
        (columnNameCandidate): string => {
          const columnName = columnNameCandidate[1];
          if (columnName === null) {
            return '';
          } else {
            return columnName.toString().trim().toLowerCase();
          }
        }
      );
      allColumnNames = allColumnNames.concat(columnNamesOfOneTable);
    }

    magicPrototyperContext.magicPrototyperProperties['AllColumnNamesList'] = allColumnNames;

    // get all column values from all tables and reuse the list for the language model
    const allColumnValues: { [key: string]: string[] } = {};

    tableNames.forEach((tableName) => {
      const columnNameQueryResult = db.exec('PRAGMA table_info("' + tableName + '")');
      const columnNamesOfOneTable: string[] = columnNameQueryResult[0].values.map(
        (columnNameCandidate): string => {
          const columnName = columnNameCandidate[1];
          if (columnName === null) {
            return '';
          } else {
            return columnName.toString().trim();
          }
        }
      );

      columnNamesOfOneTable.forEach((columnName) => {
        const distinctColumnEntriesQueryResult = db.exec(
          'SELECT DISTINCT [' + columnName + '] FROM ' + tableName + ' '
        );

        if (distinctColumnEntriesQueryResult.length > 0) {
          distinctColumnEntriesQueryResult[0].values.forEach((resultEntry) => {
            const valueElement: string = Object.values(resultEntry)[0] as string;
            if (isNaN(Number(valueElement))) {
              const normalizedValueElement: string = valueElement
                //  .toString()
                .toLowerCase()
                .replace(/-/g, ' ')
                .replace(/_/g, ' ');
              //    .replace(/ä/g, 'ae')
              //    .replace(/ö/g, 'oe')
              //    .replace(/ü/g, 'oe')
              //    .replace(/ß/g, 'ss');
              if (allColumnValues[tableName + '_' + columnName] === undefined) {
                allColumnValues[tableName + '_' + columnName] = [];
              }
              allColumnValues[tableName + '_' + columnName].push(
                voca.latinise(normalizedValueElement)
              );
            }
          });
        }
      });
    });

    // remove duplicates and shuffle

    const maxGeneratedSlotSize = magicPrototyperModel.sqliteDatabase?.maxGeneratedSlotSize;
    tableNames.forEach((tableName) => {
      const columnNameQueryResult = db.exec('PRAGMA table_info("' + tableName + '")');
      const columnNamesOfOneTable = columnNameQueryResult[0].values.map(
        (columnNameCandidate): string => {
          const columnName = columnNameCandidate[1];
          if (columnName === null) {
            return '';
          } else {
            return columnName.toString().trim();
          }
        }
      );
      columnNamesOfOneTable.forEach((columnName: string) => {
        const uniqueAllColumnValues = [
          ...new Set(allColumnValues[tableName + '_' + columnName])
        ].sort(function () {
          return Math.random() - 0.5; // shuffle
        });
        magicPrototyperContext.magicPrototyperProperties[
          voca.capitalize(tableName) + voca.capitalize(columnName, true) + 'Type'
        ] = uniqueAllColumnValues.slice(0, maxGeneratedSlotSize); // max entries per type
      });
    });
  }

  return magicPrototyperContext;
}
