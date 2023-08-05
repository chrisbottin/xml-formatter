export type FormatOptions = {
    indentation?: string;
    filter?: (node: any) => boolean;
    stripComments?: boolean;
    collapseContent?: boolean;
    lineSeparator?: string;
    whiteSpaceAtEndOfSelfclosingTag?: boolean;
    forceSelfClosingEmptyTag?: boolean;
}

declare function format(xml: string, options?: FormatOptions): string;

export = format;
