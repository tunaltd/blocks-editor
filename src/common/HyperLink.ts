"use strict";

export default class HyperLink {
    text: string;
    title: string;
    rel: string;
    uri: string;
    // save ids of relavant blocks
    blocks: Array<string>;

    constructor(text: string, title: string, rel: string, uri: string) {
        this.text = text;
        this.title = title;
        this.rel = rel;
        this.uri = uri;
        this.blocks = [];
    }

    static create(text: string, uri: string): HyperLink {
        const r = new HyperLink(text, text, undefined, uri);
        return r;
    }

    clone() {
        const r = new HyperLink(this.text, this.title, this.rel, this.uri);
        r.blocks = this.blocks;
        return r;
    }
    
}