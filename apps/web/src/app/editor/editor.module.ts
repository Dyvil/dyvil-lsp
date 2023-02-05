import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {EditorRoutingModule} from './editor-routing.module';
import {EditorComponent} from './editor/editor.component';
import {PlaygroundComponent} from './playground/playground.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    EditorRoutingModule,
    HttpClientModule,
  ],
  declarations: [
    EditorComponent,
    PlaygroundComponent,
  ],
})
export class EditorModule {
}
