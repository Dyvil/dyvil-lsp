import {setup} from '@stc/language-service';
import {createConnection, ProposedFeatures} from 'vscode-languageserver/node';

const connection = createConnection(ProposedFeatures.all);
setup(connection);
connection.listen();
