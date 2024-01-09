import {HttpClient} from '@angular/common/http';
import {Component, OnInit, ViewChild} from '@angular/core';
import {debounceTime, Subject} from 'rxjs';
import {EditorComponent} from '../editor/editor.component';

@Component({
  selector: 'stc-playground',
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss'],
})
export class PlaygroundComponent implements OnInit {
  @ViewChild('editor', {static: true}) editor: EditorComponent;

  code = '';
  compiled = 'class Foo {}';
  compile$ = new Subject<string>();

  worker?: Worker;

  constructor(
    private http: HttpClient,
  ) {
  }

  ngOnInit() {
    this.worker = new Worker(new URL('./playground.worker.ts', import.meta.url));

    const loadCode = localStorage.getItem('playground/dyvil');
    if (loadCode) {
      this.code = loadCode;
      this.compile(loadCode).then(c => this.compiled = c);
    } else {
      const examplePath = 'assets/examples/Greeter.dyv';
      this.http.get(examplePath, {responseType: 'text'}).subscribe(code => this.code = code);
    }

    this.compile$.pipe(
      debounceTime(400),
    ).subscribe(code => {
      localStorage.setItem('playground/dyvil', code);
      this.compile(code).then(c => this.compiled = c);
    });
  }

  async compile(compile: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        return;
      }

      this.worker.postMessage({compile});
      this.worker.addEventListener('message', msg => {
        const compiled = msg.data.compiled;
        if (compiled) {
          resolve(compiled);
        }
      });
    });
  }

}
