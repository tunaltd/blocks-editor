# blocks-editor
Blocks editor based on editor.js

## Hack on editor.js
1. [Affected files](editor.js/hack/readme.md)
2. The main difference is UUID generation in [utils](editor.js/src/utils.ts).

## Components/Tools
* [Hyperlink](./src/components/editorjs-hyperlink/readme.md) forked from [trinhtam/editorjs-hyperlink](https://github.com/trinhtam/editorjs-hyperlink) (MIT license)
* [MarkdownBlock](./src/components/markdown-block/readme.md)
* [OneImage](./src/components/one-image/readme.md) forked from [editorjs-inline-image](https://github.com/kommitters/editorjs-inline-image) (MIT license)
* [TextSpoiler](./src/components/editorjs-inline-spoiler-tool/readme.md) forked from [editorjs-inline-spoiler-tool](https://www.jsdelivr.com/package/npm/editorjs-inline-spoiler-tool)

## Helper Functions: BlocksUtility
* `static getHyperLinks(blocksData: OutputData): Array<HyperLink>`
* `static getImageLinks(blocksData: OutputData): Array<ImageLink>`

## test
`test/index.html`

## License
[Apache-2.0 License](https://github.com/taurenshaman/blocks-editor/blob/main/LICENSE) inherited from [editor.js](https://github.com/codex-team/editor.js/blob/master/LICENSE)
