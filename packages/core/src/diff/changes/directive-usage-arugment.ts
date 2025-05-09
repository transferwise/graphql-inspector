import { ConstDirectiveNode, Kind } from 'graphql';
import { ConstArgumentNode } from 'graphql/language';
import {
  Change,
  ChangeType,
  CriticalityLevel,
  DirectiveArgumentUsageEnumValueAddedChange,
  DirectiveArgumentUsageEnumValueChangedChange,
  DirectiveArgumentUsageEnumValueRemovedChange,
} from './change.js';
import { isOfKind, KindToPayload } from './directive-usage.js';

function buildDirectiveArgumentUsageEnumValueAddedMessage(
  args: DirectiveArgumentUsageEnumValueAddedChange['meta'],
): string {
  return `Argument '${args.addedArgumentName}' was added to directive '${args.directiveName}' used on enum value '${args.enumName}.${args.enumValueName}'`;
}

export function directiveArgumentUsageEnumValueAddedFromMeta(
  args: DirectiveArgumentUsageEnumValueAddedChange,
) {
  return {
    criticality: {
      level: CriticalityLevel.Breaking,
      reason: `Argument '${args.meta.addedArgumentName}' was added to directive '${args.meta.directiveName}' used on enum value '${args.meta.enumName}.${args.meta.enumValueName}'`,
    },
    type: ChangeType.DirectiveArgumentUsageEnumValueAdded,
    message: buildDirectiveArgumentUsageEnumValueAddedMessage(args.meta),
    path: [
      args.meta.enumName,
      args.meta.enumValueName,
      args.meta.directiveName,
      args.meta.addedArgumentName,
    ].join('.'),
    meta: args.meta,
  } as const;
}

function buildDirectiveArgumentUsageEnumValueRemovedMessage(
  args: DirectiveArgumentUsageEnumValueRemovedChange['meta'],
): string {
  return `Argument '${args.removedArgumentName}' was removed from directive '${args.directiveName}' used on enum value '${args.enumName}.${args.enumValueName}'`;
}

export function directiveArgumentUsageEnumValueRemovedFromMeta(
  args: DirectiveArgumentUsageEnumValueRemovedChange,
) {
  return {
    criticality: {
      level: CriticalityLevel.Breaking,
      reason: `Argument '${args.meta.removedArgumentName}' was removed from directive '${args.meta.directiveName}' used on enum value '${args.meta.enumName}.${args.meta.enumValueName}'`,
    },
    type: ChangeType.DirectiveArgumentUsageEnumValueRemoved,
    message: buildDirectiveArgumentUsageEnumValueRemovedMessage(args.meta),
    path: [args.meta.enumName, args.meta.enumValueName, args.meta.directiveName].join('.'),
    meta: args.meta,
  } as const;
}

function buildDirectiveArgumentUsageEnumValueChangedMessage(
  args: DirectiveArgumentUsageEnumValueChangedChange['meta'],
): string {
  return `Argument '${args.argumentName}' was changed from '${args.oldArgumentValue}' (${args.oldArgumentType}) to '${args.newArgumentValue}' (${args.newArgumentType}) in directive '${args.directiveName}' used on enum value '${args.enumName}.${args.enumValueName}'`;
}

export function directiveArgumentUsageEnumValueChangedFromMeta(
  args: DirectiveArgumentUsageEnumValueChangedChange,
) {
  return {
    criticality: {
      level: CriticalityLevel.Breaking,
      reason: `Argument '${args.meta.argumentName}' was changed in directive '${args.meta.directiveName}' used on enum value '${args.meta.enumName}.${args.meta.enumValueName}'`,
    },
    type: ChangeType.DirectiveArgumentUsageEnumValueChanged,
    message: buildDirectiveArgumentUsageEnumValueChangedMessage(args.meta),
    path: [
      args.meta.enumName,
      args.meta.enumValueName,
      args.meta.directiveName,
      args.meta.argumentName,
    ].join('.'),
    meta: args.meta,
  } as const;
}

export function directiveUsageArgumentAdded<K extends keyof KindToPayload>(
  kind: K,
  payload: KindToPayload[K]['input'],
  directive: ConstDirectiveNode,
  argument: ConstArgumentNode,
): Change {
  if (isOfKind(kind, Kind.ENUM_VALUE_DEFINITION, payload)) {
    return directiveArgumentUsageEnumValueAddedFromMeta({
      type: ChangeType.DirectiveArgumentUsageEnumValueAdded,
      meta: {
        enumName: payload.type.name,
        enumValueName: payload.value.name,
        directiveName: directive.name.value,
        addedArgumentName: argument.name.value,
        addedArgumentType: 'value' in argument.value ? String(argument.value.value) : '',
        addedArgumentValue: argument.kind,
      },
    });
  }
  return {} as any;
}

export function directiveUsageArgumentRemoved<K extends keyof KindToPayload>(
  kind: K,
  payload: KindToPayload[K]['input'],
  directive: ConstDirectiveNode,
  argument: ConstArgumentNode,
): Change {
  if (isOfKind(kind, Kind.ENUM_VALUE_DEFINITION, payload)) {
    return directiveArgumentUsageEnumValueRemovedFromMeta({
      type: ChangeType.DirectiveArgumentUsageEnumValueRemoved,
      meta: {
        enumName: payload.type.name,
        enumValueName: payload.value.name,
        directiveName: directive.name.value,
        removedArgumentName: argument.name.value,
        removedArgumentValue: 'value' in argument.value ? String(argument.value.value) : '',
        removedArgumentType: argument.kind,
      },
    });
  }
  return {} as any;
}

export function directiveUsageArgumentChanged<K extends keyof KindToPayload>(
  kind: K,
  payload: KindToPayload[K]['input'],
  directive: ConstDirectiveNode,
  oldVersion: ConstArgumentNode,
  newVersion: ConstArgumentNode,
): Change {
  if (isOfKind(kind, Kind.ENUM_VALUE_DEFINITION, payload)) {
    return directiveArgumentUsageEnumValueChangedFromMeta({
      type: ChangeType.DirectiveArgumentUsageEnumValueChanged,
      meta: {
        enumName: payload.type.name,
        enumValueName: payload.value.name,
        directiveName: directive.name.value,
        argumentName: oldVersion.name.value,
        oldArgumentValue: 'value' in oldVersion.value ? String(oldVersion.value.value) : '',
        oldArgumentType: oldVersion.kind,
        newArgumentValue: 'value' in newVersion.value ? String(newVersion.value.value) : '',
        newArgumentType: newVersion.kind,
      },
    });
  }
  return {} as any;
}
