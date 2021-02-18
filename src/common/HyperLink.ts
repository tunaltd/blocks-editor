"use strict";

export default class HyperLink {
    text: string;
    title: string;
    rel: string;
    uri: string;

    constructor(text: string, title: string, rel: string, uri: string) {
        this.text = text;
        this.title = title;
        this.rel = rel;
        this.uri = uri;
    }

    static create(text: string, uri: string): HyperLink {
        const r = new HyperLink(text, text, undefined, uri);
        return r;
    }

    clone() {
        const r = new HyperLink(this.text, this.title, this.rel, this.uri);
        return r;
    }
    
}