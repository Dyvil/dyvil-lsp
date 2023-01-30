import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {EditorRoutingModule} from './editor-routing.module';
import {EditorComponent} from './editor/editor.component';

@NgModule({
  declarations: [EditorComponent],
  imports: [
    CommonModule,
    FormsModule,
    EditorRoutingModule,
  ],
})
export class EditorModule {
}
