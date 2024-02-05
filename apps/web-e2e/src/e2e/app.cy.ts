describe('web', () => {
  beforeEach(() => cy.visit('/', {
    onBeforeLoad(win) {
      cy.spy(win.console, 'error');
    }
  }));

  it('should not error when typing example', () => {
    // click on .monaco-mouse-cursor-text
    cy.get('.view-lines.monaco-mouse-cursor-text').first().click();

    // press ctrl/cmd + a
    cy.get('.view-lines.monaco-mouse-cursor-text').first().type('{ctrl}a{cmd}a{backspace}');

    cy.get('.view-lines.monaco-mouse-cursor-text').first().type(`
class Greeter {
var name: string = "World"
var count: int = 0

init(name: string) {
this.name = name
}

func greet(): void {
// line comment
var /* block comment */ greeting = "Hello, " + this.name + "!" // comment after
this.greet(greeting)
}

/** Sends a greeting */
func greet(greeting: string): string {
println(greeting)
while this.count < 10 {
var newCount = this.count + 1
this.count = newCount
}
if this.count == 10 {
println("Count is 10")
} else if (this.count == 20) {
println("Count is 20")
} else {
println("Count is " + this.count)
}
}
}
`, {parseSpecialCharSequences: false, delay: 20});
    cy.window().then(win => {
      expect(win.console.error).not.to.be.called;
    });
  });
});
