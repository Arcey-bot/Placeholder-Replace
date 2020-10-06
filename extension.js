// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
const LOREMIPSUM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?";

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "FirstVSCExtension" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('FirstVSCExtension.replacePlaceholderText', function () {
		// The code you place here will be executed every time your command is executed
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage("Editor does not exist");
			return;
		}

		const text = editor.document.getText();

		//Find the index of <body> element in HTML file
		//Then find the position (line) that tag is on and save it to a new Position variable
		// NOTE: bodyStart is INCLUSIVE and bodyEnd is EXCLUSIVE
		let bodyStart = editor.document.positionAt(text.indexOf("<body>"));
		let bodyStartText = editor.document.lineAt(bodyStart);
		//In case the pre-formatted files have some unsurprisingly stupid formatting
		bodyStart = editor.document.positionAt(text.indexOf("<body>") + bodyStartText.text.indexOf(">") + 1);
		let bodyEnd = editor.document.positionAt(text.indexOf("</body>"));
		let bodyRange = new vscode.Range(bodyStart, bodyEnd);
		console.log();

		const body = editor.document.getText(bodyRange);

		let bodyElements = body.split("\n");
		let rangesToEdit = [];
		let wordCounts = [];
		let inNav = false;
		//console.log(bodyElements);
		for (let i = 0; i < bodyElements.length; i++) {

			bodyElements[i] = bodyElements[i].trim();
			let tagOpenIndex = bodyElements[i].indexOf(">") + 1;
			let tagCloseIndex = bodyElements[i].lastIndexOf("<");

			//console.log(`Tag open index = ${tagOpenIndex} Tag close index = ${tagCloseIndex}`);

			if (bodyElements[i].includes("nav")) {
				inNav = true;
			}
			if (!inNav) {
				//Does the line contain <>  :  If yes
				if (tagOpenIndex != -1 && tagCloseIndex != -1) {

					//Is there text following the ">"  :  If yes
					if (tagOpenIndex < tagCloseIndex) {
						//Are there tags nested inside the text?
						if (bodyElements[i].indexOf(">", tagOpenIndex) + 1 != tagOpenIndex) {
							console.log(`${bodyElements[i]} has detected further tags in line`);
							tagOpenIndex = bodyElements[i].indexOf(">", tagOpenIndex) + 1;
							tagCloseIndex = bodyElements[i].indexOf("<", tagOpenIndex);
						}
						let workingRange = new vscode.Range(editor.document.positionAt(text.indexOf(bodyElements[i]) + tagOpenIndex), editor.document.positionAt(text.indexOf(bodyElements[i]) + tagCloseIndex));
						rangesToEdit.push(workingRange);
						wordCounts.push(getWordCount(bodyElements[i]));

					}
					//Is there an open tag but no close tag on the same line?   :  If yes
					else if (tagOpenIndex < bodyElements[i].length - 1) {

						let workingRange = new vscode.Range(editor.document.positionAt(text.indexOf(bodyElements[i]) + tagOpenIndex), editor.document.positionAt(text.indexOf(bodyElements[i]) + bodyElements[i].length));
						rangesToEdit.push(workingRange);
						wordCounts.push(getWordCount(bodyElements[i]));

					}
					//Is there a close tag but no open tag on the same line?  :  If yes
					else if (tagCloseIndex > 0) {

						let workingRange = new vscode.Range(editor.document.positionAt(text.indexOf(bodyElements[i])), editor.document.positionAt(text.indexOf(bodyElements[i]) + tagCloseIndex));
						rangesToEdit.push(workingRange);
						wordCounts.push(getWordCount(bodyElements[i]));

					}
				}
				//Is this a blank garbage value from the split?  : If no
				else if (bodyElements[i].length > 1) {

					let workingRange = new vscode.Range(editor.document.positionAt(text.indexOf(bodyElements[i])), editor.document.positionAt(text.indexOf(bodyElements[i]) + bodyElements[i].length));
					rangesToEdit.push(workingRange);
					wordCounts.push(getWordCount(bodyElements[i]));

				}
			}
			if (bodyElements[i].includes("/nav")) {
				inNav = false;
			}
		}

		//console.log(rangesToEdit);
		//console.log(bodyElements);

		editor.edit((edit) => {
			for (let i = 0; i < rangesToEdit.length; i++) {
				edit.replace(rangesToEdit[i], lorem(wordCounts[i]));
			}
		})
		vscode.window.showInformationMessage("All text replaced");

	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

function getWordCount(string) {
	return string.split(" ").length;
}

function lorem(n) {
	return LOREMIPSUM.split(" ").slice(0, n).join(" ");
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
