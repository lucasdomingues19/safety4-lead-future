// One-off generator: reads the static blogPosts.ts array and emits a SQL
// seed migration inserting each post into the new blog_posts table.
// Run once via `npx tsx scripts/generate-blog-seed.ts`, then delete or leave
// as historical record — it's not part of the build.
import { blogPosts } from "../src/data/blogPosts";
import fs from "fs";
import path from "path";

const escSql = (s: string) => `'${s.replace(/'/g, "''")}'`;

const dollarQuote = (content: string): string => {
  let tag = "$md$";
  let n = 0;
  while (content.includes(tag)) {
    n += 1;
    tag = `$md${n}$`;
  }
  return `${tag}${content}${tag}`;
};

const rows = blogPosts.map((post) => {
  const tagsJson = JSON.stringify(post.tags).replace(/'/g, "''");
  return `(
    ${escSql(post.slug)},
    ${escSql(post.title)},
    ${escSql(post.metaDescription)},
    ${escSql(post.excerpt)},
    ${escSql(post.author)},
    ${escSql(post.authorTitle)},
    ${escSql(post.publishDate)}::date,
    ${escSql(post.readTime)},
    ${escSql(post.category)},
    '${tagsJson}'::jsonb,
    ${escSql(post.featuredImage)},
    ${dollarQuote(post.content)},
    true
  )`;
});

const sql = `INSERT INTO public.blog_posts
  (slug, title, meta_description, excerpt, author, author_title, publish_date, read_time, category, tags, featured_image, content, published)
VALUES
${rows.join(",\n")};
`;

const outPath = path.resolve(process.cwd(), "supabase/migrations/GENERATED_seed_blog_posts.sql");
fs.writeFileSync(outPath, sql);
console.log(`Wrote ${blogPosts.length} rows to ${outPath}`);
