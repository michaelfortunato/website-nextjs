import fs from "fs";
import path from "path";
import matter from "gray-matter";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified, Plugin } from "unified";
import { Root } from "remark-parse/lib";

export const postsDirectory = path.join(process.cwd(), "db");

type Tag = "Compiler";

function isTag(obj: any): obj is Tag {
  return obj == "Compiler";
}

export type Metadata = {
  /// for use by other articles for linking and informs the url of the article
  id: string;
  /// the front matter title
  title: string;
  /// The date when the post was created
  createdTimestamp: string;
  /// The date when the post was last modified
  modifiedTimestamp: string;
  /// Tag to search the article on
  tags: Tag[];
};

export type Post = {
  metadata: Metadata;
  content: string; // Rendered file contents, most likely as rendered html
  [key: string]: any; // TODO: Type correctly
};

// Custom Remark plugin to insert metadata
const assertAndExtractTopHeader: Plugin<[], Root> = () => {
  return (tree, file) => {
    if (tree.children.length == 0) {
      throw "Invalid markdown: no children";
    }
    let firstChild = tree.children[0];
    if (firstChild.type != "heading") {
      throw "Invalid markdown: first child must be a header";
    }
    if (firstChild.depth != 1) {
      throw "Invalid markdown: first child must be a top level (1) header";
    }
    if (firstChild.children.length == 0) {
      throw "Invalid markdown: heading must have content";
    }
    let textNode = firstChild.children[0];
    if (textNode.type != "text") {
      throw "Invalid markdown: heading content must be text";
    }
    const title = textNode.value;
    file.data.title = title;
    tree.children.shift();
  };
};

async function renderMarkdownToHTML(content: string) {
  const contentObj = await unified()
    .use(remarkParse)
    .use(assertAndExtractTopHeader)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(content);
  return contentObj;
}

export async function getPostData(id: string): Promise<Post> {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf-8");

  // Use gray-matter to parse the post metadata section
  const documentWithFrontMatter = matter(fileContents);
  const parsedDocument = await renderMarkdownToHTML(
    documentWithFrontMatter.content,
  );
  parsedDocument.data = {
    id,
    ...parsedDocument.data,
    ...documentWithFrontMatter.data,
  };

  return {
    metadata: parsedDocument.data as Metadata,
    content: parsedDocument.toString(),
  };
}

export async function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ""),
      },
    };
  });
}

export async function getAllPosts(): Promise<Metadata[]> {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData: Metadata[] = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, "");

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    const postFrontMatter: Metadata = {
      id,
      ...matterResult.data,
    } as Metadata; // Need to cast this
    return postFrontMatter;
  });
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.createdTimestamp < b.createdTimestamp) {
      return 1;
    } else {
      return -1;
    }
  });
}
async function main(): Promise<void> {
  const foo = await getPostData("mcc-lexer");
}

main();
