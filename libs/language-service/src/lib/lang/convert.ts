import {Position, Range} from "@stc/compiler";
import {Position as LspPosition, Range as LspRange} from "vscode-languageserver-protocol";

export function convertRangeToLsp(location: Range): LspRange {
  return {
    start: convertPositionToLsp(location.start),
    end: convertPositionToLsp(location.end),
  };
}

export function convertPositionToLsp(position: Position): LspPosition {
  return {line: position.line - 1, character: position.column - 1};
}

export function convertRangeFromLsp(range: LspRange): Range {
  return new Range(
    convertPositionFromLsp(range.start),
    convertPositionFromLsp(range.end),
  );
}

export function convertPositionFromLsp(position: LspPosition): Position {
  return {line: position.line + 1, column: position.character + 1};
}
