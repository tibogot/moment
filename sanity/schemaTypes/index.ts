import { announcement } from "./documents/announcement";
import { article } from "./documents/article";
import { author } from "./documents/author";
import { category } from "./documents/category";
import { faqPage } from "./documents/faqPage";
import { homePage } from "./documents/homePage";
import { menu } from "./documents/menu";
import { partner } from "./documents/partner";
import { pastEvent } from "./documents/pastEvent";
import { practicalInfo } from "./documents/practicalInfo";
import { testimonial } from "./documents/testimonial";
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
  announcement,
  article,
  author,
  category,
  faqPage,
  homePage,
  menu,
  partner,
  pastEvent,
  practicalInfo,
  testimonial,
  blockContent,
  localeString,
  localeText,
  localeStringList,
];
