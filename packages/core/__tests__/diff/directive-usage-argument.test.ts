import { buildSchema } from 'graphql';
import { CriticalityLevel, diff } from '@graphql-inspector/core';
import { findFirstChangeByPath } from '../../utils/testing';
import { expect } from 'vitest';

describe('directive-usage-argument', () => {
  describe('enum-value-level directives', () => {
    test('directive argument unchanged', async () => {
      const a = buildSchema(/* GraphQL */ `
        directive @external(argumentOne: String, argumentTwo: String) on ENUM_VALUE
        enum enumA {
          A @external(argumentOne: "")
          B
        }
      `);

      const b = buildSchema(/* GraphQL */ `
        directive @external(argumentOne: String, argumentTwo: String) on ENUM_VALUE
        enum enumA {
          A @external(argumentOne: "")
          B
        }
      `);

      const changes = await diff(a, b);

      expect(changes.length).toEqual(0);
    });

    test('added directive argument', async () => {
      const a = buildSchema(/* GraphQL */ `
        directive @external(argumentOne: String, argumentTwo: String) on ENUM_VALUE
        enum enumA {
          A @external(argumentOne: "")
          B
        }
      `);

      const b = buildSchema(/* GraphQL */ `
        directive @external(argumentOne: String, argumentTwo: String) on ENUM_VALUE
        enum enumA {
          A @external(argumentOne: "", argumentTwo: "")
          B
        }
      `);

      const changes = await diff(a, b);
      const change = findFirstChangeByPath(changes, 'enumA.A.external');

      expect(changes.length).toEqual(1);
      expect(change.criticality.level).toEqual(CriticalityLevel.Breaking);
      expect(change.criticality.reason).toBeDefined();
      expect(change.message).toEqual(`Argument 'argumentTwo' was added to directive 'external' used on enum value 'enumA.A'`)
    });

    test('removed directive argument', async () => {
      const a = buildSchema(/* GraphQL */ `
        directive @external(argumentOne: String, argumentTwo: String) on ENUM_VALUE
        enum enumA {
          A @external(argumentOne: "", argumentTwo: "")
          B
        }
      `);

      const b = buildSchema(/* GraphQL */ `
        directive @external(argumentOne: String, argumentTwo: String) on ENUM_VALUE
        enum enumA {
          A @external(argumentOne: "")
          B
        }
      `);

      const changes = await diff(a, b);
      const change = findFirstChangeByPath(changes, 'enumA.A.external');

      expect(changes.length).toEqual(1);
      expect(change.criticality.level).toEqual(CriticalityLevel.Breaking);
      expect(change.criticality.reason).toBeDefined();
      expect(change.message).toEqual(`Argument 'argumentTwo' was removed from directive 'external' used on enum value 'enumA.A'`)
    });

    test('changed directive argument', async () => {
      const a = buildSchema(/* GraphQL */ `
        directive @external(argumentOne: String, argumentTwo: String) on ENUM_VALUE
        enum enumA {
          A @external(argumentOne: "originalValue")
          B
        }
      `);

      const b = buildSchema(/* GraphQL */ `
        directive @external(argumentOne: String, argumentTwo: String) on ENUM_VALUE
        enum enumA {
          A @external(argumentOne: "changedValue")
          B
        }
      `);

      const changes = await diff(a, b);
      const change = findFirstChangeByPath(changes, 'enumA.A.external.argumentOne');

      expect(changes.length).toEqual(1);
      expect(change.criticality.level).toEqual(CriticalityLevel.Breaking);
      expect(change.criticality.reason).toBeDefined();
      expect(change.message).toEqual(`Argument 'argumentOne' was changed from 'originalValue' (StringValue) to 'changedValue' (StringValue) in directive 'external' used on enum value 'enumA.A'`)
    });
  })
})
