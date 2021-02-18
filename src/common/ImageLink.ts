"use strict";

export default class ImageLink {
    title: string;
    altText: string;
    uri: string;

    constructor(title: string, altText: string, uri: string) {
        this.title = title;
        this.altText = altText;
        this.uri = uri;
    }

    static create(title: string, uri: string): ImageLink {
        const r = new ImageLink(title, title, uri);
        return r;
    }

    clone(): ImageLink {
        const r = new ImageLink(this.title, this.altText, this.uri);
        return r;
    }
    
}