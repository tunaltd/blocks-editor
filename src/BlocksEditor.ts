'use strict';

import EditorJS, { BlockAPI, OutputData } from '@editorjs/editorjs';
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
const LinkTool = require('@editorjs/link');
const Checklist = require('@editorjs/checklist');
const List = require('@editorjs/list');//import List from '@editorjs/list';
const Personality = require('@editorjs/personality');
const InlineImage = require('editorjs-inline-image');//import InlineImage from 'editorjs-inline-image';

import * as _ from 'lodash';

class BlockIdCache{
    id: string;
    index: number;
    type: string;
}

export class BlocksEditor {
    readonly BlockElementIdPrefix: string = "block_";
    blocksIdsCache: Array<BlockIdCache>;

    eleId: string;
    onCurrentBlockChanged: Function;

    editor: EditorJS;

    lastBlockId: string;

    constructor(eleId: string, onCurrentBlockChanged: Function){
        this.eleId = eleId;
        this.onCurrentBlockChanged = onCurrentBlockChanged;
    }

    initialize(defaultContent: OutputData){
        const ctx = this;
        this.editor = new EditorJS({
            holder: this.eleId,
            placeholder: 'Hello Blocks Editor, based on editor.js!',
            tools: {
                header: {
                    class: Header,
                    inlineToolbar: true,//['link'],
                    config: {
                        placeholder: 'Header'
                    },
                    shortcut: 'CMD+SHIFT+H'
                },
                image: {
                    class: InlineImage, //ImageTool
                },
                list: {
                    class: List,
                    inlineToolbar: true,
                    shortcut: 'CMD+SHIFT+L'
                },
                checklist: {
                    class: Checklist,
                    inlineToolbar: true,
                },
                quote: {
                    class: Quote,
                    inlineToolbar: true,
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
                    inlineToolbar: true,
                    shortcut: 'CMD+ALT+T'
                },
                // loreMind: FEF.Modules.LoreCard_Mind,
                // loreSection: FEF.Modules.LoreCard_Section,
                // loreList: FEF.Modules.LoreCard_List
            },
            data: defaultContent,
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
            }
        });

        const ele = document.getElementById(this.eleId);
        ele.addEventListener('focusin', () => {
            const blockIndex = ctx.editor.blocks.getCurrentBlockIndex();
            //console.log("Current block index: "+ blockIndex);
            if(blockIndex >= 0){
                const currentBlock = ctx.editor.blocks.getBlockByIndex(blockIndex) as BlockAPI;
                if(currentBlock){
                    if(currentBlock.id !== ctx.lastBlockId){
                        ctx.lastBlockId = currentBlock.id;
                        if(ctx.onCurrentBlockChanged) ctx.onCurrentBlockChanged(currentBlock.id);
                    }
                } // if(currentBlock)
            } // if(blockIndex >= 0)
        })
        // ele.addEventListener('focusout', () => {
        //     // your logic
        // })
    }

    processBlocks(){
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

    async refresh(content: OutputData){
        await this.editor.render(content);
    }

}