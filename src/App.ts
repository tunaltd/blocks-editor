"use strict";

import { OutputData, OutputBlockData } from '@editorjs/editorjs';
import {BlocksEditor} from "./BlocksEditor";

export class App{
    eleId = "app";

    constructor(eleId = "app"){
        this.eleId = eleId;
    }

    // test(){
    //     const element = document.createElement('div');
    //     element.innerHTML = _.join(['Hello', 'webpack'], ' ');

    //     const container = document.getElementById(this.eleId);
    //     container.appendChild(element);
    // }
    render(){
        const blocksEditor = new BlocksEditor(this.eleId, (blockId: string) =>{
            console.log("Current block id: "+ blockId);
        });
        const data: OutputData = {
            blocks: new Array<OutputBlockData>()
        };
        blocksEditor.initialize( data );
    }

}