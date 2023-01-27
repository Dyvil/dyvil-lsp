import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MonacoEditorModule} from 'ngx-monaco-editor-v2';
import {EditorRoutingModule} from './editor-routing.module';
import {EditorComponent} from './editor/editor.component';

@NgModule({
  declarations: [EditorComponent],
  imports: [
    CommonModule,
    MonacoEditorModule,
    FormsModule,
    EditorRoutingModule,
  ],
})
export class EditorModule {
}
