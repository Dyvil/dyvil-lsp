import {createConnection, ProposedFeatures} from 'vscode-languageserver/node';
import {setup} from './index';

const connection = createConnection(ProposedFeatures.all);
setup(connection);
