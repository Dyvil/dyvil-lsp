import {Component} from '@angular/core';

@Component({
  selector: 'stc-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent {
  editorOptions = {
    theme: 'vs-dark',
    language: 'dyvil',
  };
  code = `
class Greeter {
  var name: string = "World"
  var count: int = 0

  init(name: string) {
    this.name = name
  }

  static func main(): void {
    var greeter = Greeter("World")
    greeter.greet()
  }

  func greet(): void {
    var greeting = "Hello, " + this.name + "!"
    this.greet(greeting)
  }

  /**
   * Sends a greeting
   */
  func greet(greeting: string): string {
    println(greeting)
    var newCount = this.count + 1
    this.count = newCount
  }
}
  `;
}
