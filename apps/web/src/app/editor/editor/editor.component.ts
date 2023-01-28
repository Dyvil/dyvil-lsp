import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'stc-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements OnInit {
  editorOptions = {
    theme: 'vs-dark',
    language: 'dyvil',
  };
  code = '';

  ngOnInit() {
    fetch('/assets/examples/Greeter.dyv').then(r => r.text()).then(t => this.code = t);
  }
}
