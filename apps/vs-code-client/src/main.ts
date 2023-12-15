import {commands, ExtensionContext, ExtensionMode} from 'vscode';
import {LanguageClient, LanguageClientOptions, ServerOptions, TransportKind} from 'vscode-languageclient/node';

let client: LanguageClient;

export async function activate(context: ExtensionContext) {
  const devMode = context.extensionMode === ExtensionMode.Development;
  const module = context.asAbsolutePath(devMode
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
    devMode,
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
