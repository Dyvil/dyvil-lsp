import {Module} from '@nestjs/common';
import {ActionService} from './action/action.service';
import {CompletionService} from './completion/completion.service';
import {ConfigService} from './config/config.service';
import {ConnectionService} from './connection/connection.service';
import {DocumentService} from './document/document.service';
import {ValidationService} from './validation/validation.service';

@Module({
  imports: [
  ],
  providers: [
    ConnectionService,
    ConfigService,
    DocumentService,
    ValidationService,
    ActionService,
    CompletionService,
  ],
})
export class AppModule {
}
