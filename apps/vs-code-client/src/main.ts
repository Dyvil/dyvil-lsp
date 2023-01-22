import {commands, ExtensionContext, window} from 'vscode';

// On activation
export function activate(context: ExtensionContext) {
  // Register command "start"
  commands.registerCommand('start', () => {
    window.showInformationMessage('Hello World');
  });
}
