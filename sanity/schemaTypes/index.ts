import { article } from "./documents/article";
import { author } from "./documents/author";
import { category } from "./documents/category";
import { homePage } from "./documents/homePage";
import { menu } from "./documents/menu";
import { partner } from "./documents/partner";
import { pastEvent } from "./documents/pastEvent";
import { blockContent } from "./objects/blockContent";
import { localeString, localeStringList, localeText } from "./objects/locale";

/**
 * Every type the Studio knows about.
 *
 * A schema type that is not listed here is registered nowhere, and the pages
 * that read it get nothing the client has written. A schema in a folder is not
 * a content model; this array is.
 */
export const schemaTypes = [
  article,
  author,
  category,
  homePage,
  menu,
  partner,
  pastEvent,
  blockContent,
  localeString,
  localeText,
  localeStringList,
];
