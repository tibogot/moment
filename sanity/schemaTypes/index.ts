import { article } from "./documents/article";
import { author } from "./documents/author";
import { category } from "./documents/category";
import { homePage } from "./documents/homePage";
import { menu } from "./documents/menu";
import { siteSettings } from "./documents/siteSettings";
import { blockContent } from "./objects/blockContent";

/**
 * Every type the Studio knows about.
 *
 * `menu` was written before this Studio lived in the repo and spent that time
 * registered nowhere, which is why `/menus` served `PLACEHOLDER_MENUS` rather
 * than anything the client had written. A schema in a folder is not a content
 * model; this array is.
 */
export const schemaTypes = [
  article,
  author,
  category,
  homePage,
  menu,
  siteSettings,
  blockContent,
];
