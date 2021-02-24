'use strict';
import { OutputBlockData, OutputData } from '@editorjs/editorjs';
import HyperLink from './common/HyperLink';
import ImageLink from './common/ImageLink';

export default class BlocksUtility{
    static readonly Regex_Markdown_Hyperlink = /\[(?<text>([^\]]*))\]\((?<url>(\S*))(?<title>\s".*")?\)/gm;
    static readonly Regex_Markdown_Image = /!\[(?<alt>([^\]]*))\]\((?<url>(\S*))(?<title>\s".*")?\)/gm;

    static getHyperlinksOfMarkdown(str: string): Array<HyperLink> {
        // Ref: https://davidwells.io/snippets/regex-match-markdown-links
        const result: Array<HyperLink> = [];
        const regex = BlocksUtility.Regex_Markdown_Hyperlink;
        let m;

        while ((m = regex.exec(str)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            // The result can be accessed through the `m`-variable.
            //m.forEach((match, groupIndex) => {
            //    console.log(`Found match, group ${groupIndex}: ${match}`);
            //});
            // m[0]: full match
            // m[1,2]: group 1/2: text
            // m[3,4]: group 3/4: uri
            // m[5]: group 5: title
            const link = new HyperLink(m[1], m[5], undefined, m[3]);
            const index = result.findIndex( (v) => {
                return v.uri === link.uri;
            });
            if(index < 0){
                result.push(link);
            }
            else{
                result[index] = link;
            }
        }
        return result;
    }

    static getImagesOfMarkdown(str: string): Array<ImageLink> {
        const result: Array<ImageLink> = [];
        const regex = BlocksUtility.Regex_Markdown_Image;
        let m;

        while ((m = regex.exec(str)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            // The result can be accessed through the `m`-variable.
            //m.forEach((match, groupIndex) => {
            //    console.log(`Found match, group ${groupIndex}: ${match}`);
            //});
            // m[0]: full match
            // m[1,2]: group 1/2: text
            // m[3,4]: group 3/4: uri
            // m[5]: group 5: title
            const link = new ImageLink(m[5], m[1], m[3]);//m.length === 6 ? m[5] : undefined
            const index = result.findIndex( (v) => {
                return v.uri === link.uri;
            });
            if(index < 0){
                result.push(link);
            }
            else{
                result[index] = link;
            }
        }
        return result;
    }

    static processHyperLinks(blockId: string, htmlObject: HTMLElement): Array<HyperLink>{
        const result = new Array<HyperLink>();
        if(!htmlObject)
            return result;
        const allAs = htmlObject.querySelectorAll("a");
        if(allAs){
            allAs.forEach(ae => {
                const d = new HyperLink(ae.innerHTML, ae.title, ae.rel, ae.href);
                const index = result.findIndex( (v) => {
                    return v.uri === d.uri;
                });
                if(index < 0){
                    d.blocks.push(blockId);
                    result.push(d);
                }
                else{
                    const blocks = result[index].blocks;
                    if(blocks.indexOf(blockId) < 0)
                        blocks.push(blockId);
                    d.blocks = blocks;
                    result[index] = d;
                }
            });
        }
        return result;
    }

    static processHyperLinksOfBlock(htmlObject: HTMLElement, obd: OutputBlockData): Array<HyperLink>{
        let result = new Array<HyperLink>();
        if(!htmlObject || !obd)
            return result;
        // blocks not supporting Links: alert, warning, code, 
        switch(obd.type){
            case "checklist":
                // data/items/text
                let clTxt = "";
                const items: [] = obd.data.items;
                items.forEach((item: any) => {
                    clTxt += item.text + " ... ";
                });
                htmlObject.innerHTML = clTxt;
                break;
            case "header":
                htmlObject.innerHTML = obd.data.text;
                break;
            case "list":
                htmlObject.innerHTML = obd.data.items.join("... ");
                break;
            case "mdBlock":
            case "markdownBlock":
                result = BlocksUtility.getHyperlinksOfMarkdown(obd.data.markdown);
                return result;
            case "oneimage":
                // caption: "gggggggggg, <a href="http://g.com" target="_blank" rel="alternate">google</a>, asdjfklasdjflkaj;dfs"
                htmlObject.innerHTML = obd.data.caption;
                break;
            case "paragraph":
                htmlObject.innerHTML = obd.data.text;
                break;
            case "quote":
                htmlObject.innerHTML = obd.data.caption + " ... " + obd.data.text;
                break;
            case "table":
                // data/content[]/[]
                let tableTxt = "";
                const tableRows: [] = obd.data.content;
                tableRows.forEach((row: []) => {
                    const rTxt = obd.data.items.join("... ");
                    tableTxt += rTxt + " ... ";
                });
                htmlObject.innerHTML = tableTxt;
                break;
        }
        result = BlocksUtility.processHyperLinks(obd.id, htmlObject);
        return result;
    }

    static getImageLinkOfBlock(obd: OutputBlockData): Array<ImageLink>{
        let result: Array<ImageLink> = [];
        if(!obd)
            return result;
        switch(obd.type){
            case "mdBlock":
            case "markdownBlock":
                result = BlocksUtility.getImagesOfMarkdown(obd.data.markdown);
                return result;
            case "oneimage":
                const link = new ImageLink(obd.data.caption, "", obd.data.url);
                result.push(link);
                break;
        }
        return result;
    }

    static getHyperLinks(blocksData: OutputData): Array<HyperLink>{
        let links = new Array<HyperLink>();
        if(!blocksData || !blocksData.blocks || blocksData.blocks.length === 0)
            return links;
        var htmlObject = document.createElement('div');
        blocksData.blocks.forEach(obd => {
            const newLinks = BlocksUtility.processHyperLinksOfBlock(htmlObject, obd);
            links = BlocksUtility.upsertHyperLinks(links, newLinks);
        });
        return links;
    }

    static getImageLinks(blocksData: OutputData): Array<ImageLink>{
        let links = new Array<ImageLink>();
        if(!blocksData || !blocksData.blocks || blocksData.blocks.length === 0)
            return links;
        blocksData.blocks.forEach(obd => {
            const newLinks = BlocksUtility.getImageLinkOfBlock(obd);
            links = BlocksUtility.upsertImageLinks(links, newLinks);
        });
        return links;
    }

    static upsertHyperLinks(existedData: Array<HyperLink>, newData: Array<HyperLink>){
        if(!existedData)
            existedData = [];
        if(!newData || newData.length === 0)
            return existedData;
        newData.forEach((newLink) =>{
            const index = existedData.findIndex( (v) => {
                return v.uri === newLink.uri;
            });
            if(index < 0){
                existedData.push(newLink);
            }
            else{
                existedData[index] = newLink;
            }
        });
        return existedData;
    }

    static upsertImageLinks(existedData: Array<ImageLink>, newData: Array<ImageLink>){
        if(!existedData)
            existedData = [];
        if(!newData || newData.length === 0)
            return existedData;
        newData.forEach((newLink) =>{
            const index = existedData.findIndex( (v) => {
                return v.uri === newLink.uri;
            });
            if(index < 0){
                existedData.push(newLink);
            }
            else{
                existedData[index] = newLink;
            }
        });
        return existedData;
    }

    // static upsertImageLink(existedData: Array<ImageLink>, newLink: ImageLink){
    //     if(!existedData)
    //         existedData = [];
    //     if(!newLink)
    //         return existedData;

    //     const index = existedData.findIndex( (v) => {
    //         return v.uri === newLink.uri;
    //     });
    //     if(index < 0){
    //         existedData.push(newLink);
    //     }
    //     else{
    //         existedData[index] = newLink;
    //     }
    //     return existedData;
    // }

}