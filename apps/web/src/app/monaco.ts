import {languages} from 'monaco-editor';
import IMonarchLanguage = languages.IMonarchLanguage;
import ILanguageExtensionPoint = languages.ILanguageExtensionPoint;

const monarchLang: IMonarchLanguage = {
  keywords: 'class|var|init|func|true|false|this|super'.split('|'),
  typeKeywords: [
    'boolean', 'int', 'void', 'string',
  ],
  operators: /[+\-*/%&|<>!:^=]+/,
  escapes: /\\./,
  tokenizer: {
    root: [
      [/[a-z][A-Za-z0-9_]*/, {
        cases: {
          '@typeKeywords': 'keyword',
          '@keywords': 'keyword',
          '@default': 'identifier',
        },
      }],
      [/[A-Z][A-Za-z0-9_]*/, 'type.identifier'],
      {include: '@whitespace'},
      [/[{}()\[\]]/, '@brackets'],
      [/@operators/, 'operator'],
      [/[+-]?\d+\.\d+/, 'number.float'],
      [/[+-]?\d+/, 'number'],
      [/[;,.]/, 'delimiter'],
      [/"([^"\\]|\\.)*$/, 'string.invalid'],
      [/"/, {token: 'string.quote', bracket: '@open', next: '@string'}],
    ],

    comment: [
      [/[^\/*]+/, 'comment'],
      [/\/\*/, 'comment', '@push'],
      ['\\*/', 'comment', '@pop'],
      [/[\/*]/, 'comment'],
    ],

    string: [
      [/[^\\"]+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/"/, {token: 'string.quote', bracket: '@close', next: '@pop'}],
    ],

    whitespace: [
      [/[ \t\r\n]+/, 'white'],
      [/\/\*/, 'comment', '@comment'],
      [/\/\/.*$/, 'comment'],
    ],
  },
};


export async function onMonacoLoad() {
  const monaco = (window as any).monaco;

  const language: ILanguageExtensionPoint = {
    id: 'dyvil',
    aliases: ['Dyvil'],
    extensions: ['.dyv'],
  };
  monaco.languages.register(language);
  monaco.languages.setMonarchTokensProvider('dyvil', monarchLang);
}

