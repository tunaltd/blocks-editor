'use strict';

import EditorJS, { BlockAPI, OutputData } from '@editorjs/editorjs';
const Paragraph = require('@editorjs/paragraph');
const Header = require('@editorjs/header');
const Marker = require('@editorjs/marker');
const Underline = require('@editorjs/underline');//import Underline from '@editorjs/underline';
const Delimiter = require('@editorjs/delimiter');
const CodeTool = require('@editorjs/code');
const InlineCode = require('@editorjs/inline-code');
const Quote = require('@editorjs/quote');
const Warning = require('@editorjs/warning');
const Alert = require('editorjs-alert');
const Embed = require('@editorjs/embed');
const Table = require('@editorjs/table');
const Checklist = require('@editorjs/checklist');
const List = require('@editorjs/list');//import List from '@editorjs/list';
const Personality = require('@editorjs/personality');
import OneImage from './components/one-image';
import TextSpolier from './components/editorjs-inline-spoiler-tool';//const TextSpoiler = require('editorjs-inline-spoiler-tool');
import MarkdownBlock from './components/markdown-block';
import Hyperlink from './components/editorjs-hyperlink';
import _ from 'lodash';

//import * as _ from 'lodash';

class BlockIdCache{
    id: string;
    index: number;
    type: string;
}

export class ServerOptions{
    appName: string;
    clientKey: string;
    /**
     * Current username
     */
    user: string;
    // search
    enderpointSearch: string;
    countPerPage: number = 10;
    // upload
    enderpointUpload: string;
}

export class UnsplashOptions{
    appName: string;
    clientKey: string;
    // search
    enderpointSearch: string;
    countPerPage: number = 30;
}

export class ThirdAPIOptions{
    server: ServerOptions;
    unsplash: UnsplashOptions;
}

export class EditorOptions{
    readOnly: false;
    // properties
    api: ThirdAPIOptions;

    // callback events
    onContentChanged: Function;
    onCurrentBlockChanged: Function;
}

export class BlocksEditor {
    readonly BlockElementIdPrefix: string = "block_";
    blocksIdsCache: Array<BlockIdCache>;

    eleId: string;
    options: EditorOptions;

    // Events
    onContentChanged: Function;
    onCurrentBlockChanged: Function;

    editor: EditorJS;

    lastBlockId: string;

    constructor(eleId: string, content: OutputData, options: EditorOptions){
        this.eleId = eleId;
        this.options = options;
        this.onContentChanged = options.onContentChanged;
        this.onCurrentBlockChanged = options.onCurrentBlockChanged;

        this.initialize(content);
    }

    private initialize(defaultContent: OutputData){
        const ctx = this;
        this.editor = new EditorJS({
            holder: this.eleId,
            placeholder: 'Hello Blocks Editor, based on editor.js!',
            tools: {
                paragraph: {
                    class: Paragraph,
                    inlineToolbar: ['bold', 'italic', 'underline', 'hyperlink', 'marker', 'inlineCode', 'textSpolier']
                },
                header: {
                    class: Header,
                    inlineToolbar: ['bold', 'italic', 'hyperlink', 'marker'],
                    config: {
                        placeholder: 'Header'
                    },
                    shortcut: 'CMD+SHIFT+H'
                },
                oneimage: {
                    class: OneImage,
                    inlineToolbar: ['bold', 'italic', 'hyperlink', 'marker'],
                    config: {
                        server: this.options.api ? this.options.api.server : undefined,
                        unsplash: this.options.api ? this.options.api.unsplash : undefined,
                        supportEmbedUrl: true
                    }
                },
                list: {
                    class: List,
                    inlineToolbar: ['bold', 'italic', 'hyperlink', 'marker'],
                    shortcut: 'CMD+SHIFT+L'
                },
                checklist: {
                    class: Checklist,
                    inlineToolbar: ['bold', 'italic', 'hyperlink', 'marker'],
                },
                quote: {
                    class: Quote,
                    inlineToolbar: ['bold', 'italic', 'hyperlink', 'marker'],
                    config: {
                        quotePlaceholder: 'Enter a quote',
                        captionPlaceholder: 'Quote\'s author',
                    },
                    shortcut: 'CMD+SHIFT+O'
                },
                warning: Warning,
                alert: Alert,
                marker: {
                    class: Marker,
                    shortcut: 'CMD+SHIFT+M'
                },
                code: {
                    class: CodeTool,
                    shortcut: 'CMD+SHIFT+C'
                },
                delimiter: Delimiter,
                inlineCode: {
                    class: InlineCode,
                    shortcut: 'CMD+SHIFT+C'
                },
                hyperlink: { // Error
                    class: Hyperlink,
                    config: {
                        target: '_blank', // default null
                        rel: 'nofollow', // default null
                        // availableTargets: ['_blank', '_self'],
                        // availableRels: ['author', 'noreferrer'],
                        validate: false
                    },
                    shortcut: 'CMD+L',
                },
                // linkTool: { // https://github.com/editor-js/link
                //     class: LinkTool,
                //     config: {
                //         endpoint: 'http://localhost:8008/fetchUrl', // Your backend endpoint for url data fetching
                //     }
                // },
                // personality: { // https://github.com/editor-js/personality
                //     class: Personality,
                //     config: {
                //         endpoint: 'http://localhost:8008/uploadFile'  // Your backend file uploader endpoint
                //     }
                // },
                underline: Underline,
                embed: Embed,
                table: {
                    class: Table,
                    inlineToolbar: ['bold', 'italic', 'hyperlink', 'marker'],
                    shortcut: 'CMD+ALT+T'
                },
                textSpolier: TextSpolier,
                mdBlock: MarkdownBlock, // ATTENTION: markdown-it
                // loreMind: FEF.Modules.LoreCard_Mind,
                // loreSection: FEF.Modules.LoreCard_Section,
                // loreList: FEF.Modules.LoreCard_List
            },
            defaultBlock: "paragraph",
            data: defaultContent,
            readOnly: this.options.readOnly,
            onChange: function (api) {
                // test 1.
                // const blockIndex = api.blocks.getCurrentBlockIndex();
                // console.log("Current block index: "+ blockIndex);
                // const currentBlock = api.blocks.getBlockByIndex(blockIndex);
                // console.log(currentBlock);

                // test 2.
                // api.saver.save().then((savedData) => {
                //    console.log(savedData);
                // });

                ctx.processBlocks();
                api.saver.save().then((savedData) => {
                    if(ctx.onContentChanged) {
                        ctx.onContentChanged(savedData);
                    }
                });
            }
        });

        const ele = document.getElementById(this.eleId);
        ele.addEventListener('focusin', () => {
            const blockIndex = ctx.editor.blocks.getCurrentBlockIndex();
            //console.log("Current block index: "+ blockIndex);
            if(blockIndex >= 0) {
                const currentBlock = ctx.editor.blocks.getBlockByIndex(blockIndex) as BlockAPI;
                if(currentBlock) {
                    if(currentBlock.id !== ctx.lastBlockId){
                        ctx.lastBlockId = currentBlock.id;
                        if(ctx.onCurrentBlockChanged) ctx.onCurrentBlockChanged(currentBlock.id, blockIndex);
                    }
                } // if(currentBlock)
            } // if(blockIndex >= 0)
        });
        // ele.addEventListener('focusout', () => {
        //     // your logic
        // });
    }

    private processBlocks(){
        const count = this.editor.blocks.getBlocksCount();
        this.blocksIdsCache = [];
        for(let i = 0; i < count; i++){
            const block = this.editor.blocks.getBlockByIndex(i) as BlockAPI;
            if(block){ //  && !block.id
                const ele = block.holder; // .ce-block element, that wraps plugin contents
                ele.id = this.BlockElementIdPrefix + block.id;

                this.blocksIdsCache.push({
                    id: block.id,
                    index: i,
                    type: block.name
                });
            }
        } // for
    }

    public async setContentAsync(content: OutputData){
        this.editor.clear();
        await this.editor.render(content);
    }

    public async getContentAsync() {
        const data = await this.editor.save();
        return data;
    }

    public getImages(): Array<ImageData> {
        const count = this.editor.blocks.getBlocksCount();
        const result = new Array<ImageData>();
        for(let i = 0; i < count; i++){
            const block = this.editor.blocks.getBlockByIndex(i) as BlockAPI;
            if(block){ //  && !block.id
                const blockHolder = block.holder; // .ce-block element, that wraps plugin contents
                const allImgs = blockHolder.querySelectorAll("img");
                if(allImgs){
                    allImgs.forEach(ae => {
                        const d = {
                            title: ae.title,
                            uri: ae.src
                        };
                        if(!ae.title){
                            const caption = blockHolder.querySelector("div.inline-image__caption");
                            if(caption)
                                d.title = caption.innerHTML;
                        }
                        const index = _.findIndex(result, item => item.uri === d.uri);
                        if(index < 0)
                            result.push(d);
                    });
                }
            }
        } // for
        return result;
    }

    public getHyperlinks(): Array<HyperlinkData> {
        const count = this.editor.blocks.getBlocksCount();
        const result = new Array<HyperlinkData>();
        for(let i = 0; i < count; i++){
            const block = this.editor.blocks.getBlockByIndex(i) as BlockAPI;
            if(block){ //  && !block.id
                const blockHolder = block.holder; // .ce-block element, that wraps plugin contents
                const allAs = blockHolder.querySelectorAll("a");
                if(allAs){
                    allAs.forEach(ae => {
                        const d = {
                            name: ae.innerHTML,
                            title: ae.title,
                            uri: ae.href,
                            rel: ae.rel
                        };
                        const index = _.findIndex(result, item => item.uri === d.uri);
                        if(index < 0)
                            result.push(d);
                    });
                }
            }
        } // for
        return result;
    }

}

export class ImageData{
    title: string;
    uri: string;
}

export class HyperlinkData{
    name: string;
    title: string;
    uri: string;
    rel: string;
}