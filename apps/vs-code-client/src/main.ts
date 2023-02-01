import {commands, ExtensionContext, ExtensionMode} from 'vscode';
import {LanguageClient, LanguageClientOptions, ServerOptions, TransportKind} from 'vscode-languageclient/node';

let client: LanguageClient;

export async function activate(context: ExtensionContext) {
  const module = context.asAbsolutePath(context.extensionMode === ExtensionMode.Development
    ? '../language-server/main.js'
    : './server/main.js',
  );
  const transport = TransportKind.ipc;
  const serverOptions: ServerOptions = {
    run: {
      module,
      transport,
    },
    debug: {
      module,
      transport,
      options: {execArgv: ['--nolazy', '--inspect=6009']},
    },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      {language: 'dyvil'},
    ],
    synchronize: {
      configurationSection: 'dyvil',
    },
  };

  client = new LanguageClient(
    'dyvil',
    'Dyvil',
    serverOptions,
    clientOptions,
  );

  await client.start();

  commands.registerCommand('dyvil.restart', async () => {
    await client.restart();
  });
}

export async function deactivate() {
  if (client && client.isRunning()) {
    await client.stop();
  }
}
