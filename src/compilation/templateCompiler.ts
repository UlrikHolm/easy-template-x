import { SimpleTagPlugin, TemplatePlugin } from '../plugins';
import { Tag } from './tag';
import { TagParser } from './tagParser';
import { Tokenizer } from './tokenizer';

/**
 * The TemplateCompiler works roughly the same way as a source code compiler.
 * It's main steps are:
 * 
 * 1. tokenize (lexical analysis) :: (Document) => Tokens[]
 * 2. create input AST (syntax analysis) :: (Tokens[]) => Tag
 * 3. perform document replace (code generation) :: (Document, Tag, data) => Document*
 * 
 * see: https://en.wikipedia.org/wiki/Compiler
 */
export class TemplateCompiler {

    public plugins: TemplatePlugin[] = [ new SimpleTagPlugin() ];

    private readonly tokenizer = new Tokenizer();
    private readonly parser = new TagParser();

    /**
     * Compiles the template and performs the required replacements using the
     * specified data.
     */
    public compile(doc: Document, data: any): void {
        const tokens = this.tokenizer.tokenize(doc);
        const tags = this.parser.parse(tokens);
        this.doDocumentReplacements(doc, tags, data);
    }

    //
    // private methods
    //

    private doDocumentReplacements(doc: Document, tagTree: Tag[], data: any): void {
        for (const rootTag of tagTree) {
            this.tagReplacementRecurse(doc, rootTag, (data || {})[rootTag.name]);
        }
    }

    private tagReplacementRecurse(doc: Document, tag: Tag, data: any): void {

        // process current node
        for (const plugin of this.plugins) {
            plugin.doDocumentReplacements(doc, tag, data);
        }

        // process child nodes
        // for (const child of tag.children) {
        //     this.tagReplacementRecurse(doc, child, (data || {})[child.name]);
        // }
    }
}