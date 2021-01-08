MarkdownBlock Tool
===

## Change to another Markdown parser
Default parser is [markdown-it](https://github.com/markdown-it/markdown-it) ([MIT](https://github.com/markdown-it/markdown-it/blob/master/LICENSE)).  
If you wanna change to another one, follow these 2 steps:  
1. modify the code in constructor: `MarkdownBlock.mdParser = window.markdownit ? window.markdownit() : undefined;`
2. modify _mdToHtml() function.

## Switch from view mode to edit mode
There are 2 solutions:
1. onmouseenter event: _drawViewer()
2. Using settings (default): renderSettings()