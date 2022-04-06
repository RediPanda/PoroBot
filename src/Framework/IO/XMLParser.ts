import { parseStringPromise} from "xml2js";
import { XMLParser } from "fast-xml-parser";

export class XML {
    xml: string;

    constructor(xml: string) {
        this.xml = xml;
    }

    async get(): Promise<Object> {
        // const parser = new XMLParser();
        return await parseStringPromise(this.xml);
    }
}