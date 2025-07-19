import {HttpClient} from '@angular/common/http';
import {Component, inject, OnInit, ViewChild} from '@angular/core';
import {debounceTime, Subject} from 'rxjs';
import {EditorComponent} from '../editor/editor.component';

@Component({
  selector: 'stc-playground',
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss'],
  standalone: false,
})
export class PlaygroundComponent implements OnInit {
  @ViewChild('editor', {static: true}) editor: EditorComponent;

  private readonly http = inject(HttpClient);

  code = '';
  compiled = '';
  compile$ = new Subject<string>();

  ngOnInit() {
    const loadCode = localStorage.getItem('playground/dyvil');
    if (loadCode) {
      this.code = loadCode;
    } else {
      const examplePath = 'assets/examples/Greeter.dyv';
      this.http.get(examplePath, {responseType: 'text'}).subscribe(code => {
        this.code = code;
      });
    }

    this.compile$.pipe(
      debounceTime(400),
    ).subscribe(code => {
      localStorage.setItem('playground/dyvil', code);
      this.compile();
    });
  }

  async compile() {
    const compiled = await this.editor.compile();
    if (compiled) {
      this.compiled = compiled;
    }
  }
}
