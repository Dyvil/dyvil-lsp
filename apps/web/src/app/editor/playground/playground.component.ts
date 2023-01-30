import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'stc-playground',
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss'],
})
export class PlaygroundComponent implements OnInit {
  code = '';

  async ngOnInit() {
    const examplePath = '/assets/examples/Greeter.dyv';
    this.code = await fetch(examplePath).then(r => r.text());
  }
}
