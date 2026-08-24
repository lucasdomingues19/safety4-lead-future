import { supabase } from "@/integrations/supabase/client";
import type { BlogPost } from "@/data/blogPosts";

export type { BlogPost };

interface BlogPostRow {
  id: string;
  slug: string;
  title: string;
  meta_description: string;
  excerpt: string;
  author: string;
  author_title: string;
  publish_date: string;
  read_time: string;
  category: string;
  tags: string[];
  featured_image: string;
  content: string;
  published: boolean;
}

const mapRowToBlogPost = (row: BlogPostRow): BlogPost => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  metaDescription: row.meta_description,
  excerpt: row.excerpt,
  author: row.author,
  authorTitle: row.author_title,
  publishDate: row.publish_date,
  readTime: row.read_time,
  category: row.category,
  tags: row.tags,
  featuredImage: row.featured_image,
  content: row.content,
});

// Card/list views never render the markdown body — exclude it to cut payload size.
const CARD_COLUMNS = "id,slug,title,meta_description,excerpt,author,author_title,publish_date,read_time,category,tags,featured_image,published";
const FULL_COLUMNS = `${CARD_COLUMNS},content`;

export const getPostBySlug = async (slug: string): Promise<BlogPost | undefined> => {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(FULL_COLUMNS)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error || !data) return undefined;
  return mapRowToBlogPost(data as unknown as BlogPostRow);
};

export const getAllPublished = async (): Promise<BlogPost[]> => {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(CARD_COLUMNS)
    .eq("published", true)
    .order("publish_date", { ascending: false });
  if (error || !data) return [];
  return (data as unknown as BlogPostRow[]).map((row) => mapRowToBlogPost({ ...row, content: "" }));
};

export const getRecentPosts = async (limit = 3): Promise<BlogPost[]> => {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(CARD_COLUMNS)
    .eq("published", true)
    .order("publish_date", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return (data as unknown as BlogPostRow[]).map((row) => mapRowToBlogPost({ ...row, content: "" }));
};
