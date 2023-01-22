import {SimpleScope} from './ast';
import {compilationUnit} from './compiler';


const text = `
class Greeter {
  var name: string = "World"
  var count: int = 0

  init(name: string) {
    this.name = name
  }

  func greet(): void {
    var greeting = "Hello, " + this.name + "!"
    println(greeting)
    var newCount = this.count + 1
    this.count = newCount
  }
}
`;
let file = compilationUnit(text);
file = file.resolve(new SimpleScope([]));
console.dir(file, {depth: null});
console.log(file.toString());
console.log(file.toString('js'));
