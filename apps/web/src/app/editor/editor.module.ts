import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditorRoutingModule } from './editor-routing.module';
import { EditorComponent } from './editor/editor.component';
import { PlaygroundComponent } from './playground/playground.component';

@NgModule({
  declarations: [EditorComponent, PlaygroundComponent],
  imports: [CommonModule, FormsModule, EditorRoutingModule],
})
export class EditorModule {}
