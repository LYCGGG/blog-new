import type { Site, Metadata, Socials } from "@types";

export const SITE: Site = {
  NAME: "lyc.log",
  EMAIL: "lycmmm@outlook.com",
  NUM_POSTS_ON_HOMEPAGE: 3,
  NUM_WORKS_ON_HOMEPAGE: 2,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "lyc.log - 记录技术与思考的个人博客",
};

export const BLOG: Metadata = {
  TITLE: "Blog",
  DESCRIPTION: "技术笔记与生活思考",
};

export const WORK: Metadata = {
  TITLE: "Work",
  DESCRIPTION: "工作经历",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION: "个人项目展示",
};

export const SOCIALS: Socials = [
  { 
    NAME: "github",
    HREF: "https://github.com/LYCGGG"
  },
];
