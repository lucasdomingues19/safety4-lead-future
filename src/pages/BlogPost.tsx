import AudienceNav from "@/components/AudienceNav";
import { ArrowLeft, Clock, Calendar, Tag, Share2 } from "lucide-react";
import { Footer } from "@/components/Footer";
import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { trackPageView } from "@/utils/analytics";
import { getPostBySlug, getRecentPosts, type BlogPost as BlogPostType } from "@/lib/blog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { setPageSEO } from "@/utils/seo";
import founderPhoto from "@/assets/founder-cutout.png";

const BASE = "https://safetytech.academy";
// featuredImage is either a site-relative path or a full external URL (e.g.
// Unsplash) — only prepend the origin for the relative case.
const absoluteImageUrl = (src: string) => (src.startsWith("http") ? src : `${BASE}${src}`);

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | undefined>(undefined);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getPostBySlug(slug).then((found) => {
      setPost(found);
      setLoading(false);
      if (found) {
        getRecentPosts(4).then((recent) => {
          setRelatedPosts(recent.filter((p) => p.slug !== found.slug).slice(0, 3));
        });
      }
    });
  }, [slug]);

  useEffect(() => {
    if (post) {
      trackPageView(window.location.pathname);
      setPageSEO({
        title: `${post.title} | SafetyTech Academy Blog`,
        description: post.metaDescription,
        canonical: `https://safetytech.academy/blog/${post.slug}`,
        ogImage: absoluteImageUrl(post.featuredImage),
        ogType: "article",
      });

      // Add BlogPosting structured data
      const existingBlogSchema = document.querySelector('script[data-schema="blogpost"]');
      if (existingBlogSchema) existingBlogSchema.remove();

      const blogPostSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.metaDescription,
        "image": absoluteImageUrl(post.featuredImage),
        "author": {
          "@type": "Person",
          "name": post.author,
          "jobTitle": post.authorTitle,
          "url": "https://www.linkedin.com/in/lucas-domingues-msc-cmiosh-49b2b820/"
        },
        "publisher": {
          "@type": "Organization",
          "name": "SafetyTech Academy",
          "logo": {
            "@type": "ImageObject",
            "url": "https://safetytech.academy/safety-academy-logo.png"
          }
        },
        "datePublished": post.publishDate,
        "dateModified": post.publishDate,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://safetytech.academy/blog/${post.slug}`
        },
        "keywords": post.tags.join(", "),
        "articleSection": post.category,
        "wordCount": post.content.split(/\s+/).length,
        "inLanguage": "en-US"
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-schema', 'blogpost');
      script.text = JSON.stringify(blogPostSchema);
      document.head.appendChild(script);

      // Derive FAQPage schema from a "Frequently asked questions" section (### Q + answer)
      const faqSection = post.content.split(/^##\s+Frequently asked questions\s*$/mi)[1];
      if (faqSection) {
        const block = faqSection.split(/^##\s+/m)[0];
        const faqs = block
          .split(/^###\s+/m)
          .slice(1)
          .map((chunk) => {
            const [question, ...rest] = chunk.split("\n");
            const answer = rest.join(" ").replace(/[*_`>#]/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\s+/g, " ").trim();
            return { question: question.trim(), answer };
          })
          .filter((f) => f.question && f.answer);

        if (faqs.length) {
          document.querySelector('script[data-schema="blogfaq"]')?.remove();
          const faqScript = document.createElement('script');
          faqScript.type = 'application/ld+json';
          faqScript.setAttribute('data-schema', 'blogfaq');
          faqScript.text = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          });
          document.head.appendChild(faqScript);
        }
      }
    }

    return () => {
      document.querySelector('script[data-schema="blogpost"]')?.remove();
      document.querySelector('script[data-schema="blogfaq"]')?.remove();
    };
  }, [post]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <AudienceNav />
        <div className="flex-grow flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const handleShare = async () => {
    const shareUrl = `https://www.safetytech.academy/blog/${post.slug}`;
    const shareData = {
      title: post.title,
      text: post.excerpt,
      url: shareUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error - fall back to clipboard
        if ((err as Error).name !== 'AbortError') {
          await copyToClipboard();
        }
      }
    } else {
      await copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    const shareUrl = `https://www.safetytech.academy/blog/${post.slug}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white">
        <AudienceNav />

        <div className="container mx-auto px-4 pt-28 pb-20 md:pt-32 relative z-10">
          {/* Featured Image — full-bleed within the container, like the Blog listing hero */}
          {post.featuredImage && (
            <div className="max-w-5xl mx-auto mb-10 md:mb-14">
              <div className="aspect-[16/9] md:aspect-[21/9] rounded-[24px] overflow-hidden">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Article Header */}
          <article className="max-w-3xl mx-auto">
            <div className="mb-10">
              <Link
                to="/blog"
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors mb-6"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Blog
              </Link>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold uppercase tracking-wide">
                  {post.category}
                </span>
                <span className="text-slate-500 text-sm flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(post.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="text-slate-500 text-sm flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {post.readTime}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-8 leading-tight">
                {post.title}
              </h1>

              <div className="flex items-center justify-between pb-8 border-b border-slate-100">
                <div className="flex items-center space-x-4">
                  <img
                    src={founderPhoto}
                    alt={post.author}
                    loading="lazy"
                    decoding="async"
                    className="w-12 h-12 rounded-full object-cover bg-slate-100"
                  />
                  <div>
                    <div className="text-slate-900 font-medium">{post.author}</div>
                    <div className="text-slate-500 text-sm">{post.authorTitle}</div>
                  </div>
                </div>

                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-primary text-primary font-medium text-sm uppercase tracking-[0.08em] rounded hover:bg-primary/5 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none mb-12">
              <div className="text-slate-600 leading-relaxed space-y-6">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-6">
                          <table className="w-full text-left border-collapse text-sm">{children}</table>
                        </div>
                      ),
                      thead: ({ children }) => <thead className="bg-slate-100">{children}</thead>,
                      th: ({ children }) => <th className="border border-slate-200 px-4 py-3 font-bold text-slate-900">{children}</th>,
                      td: ({ children }) => <td className="border border-slate-200 px-4 py-3 text-slate-600">{children}</td>,
                      h1: ({ children }) => <h1 className="text-3xl font-bold text-slate-900 mt-8 mb-4">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-xl font-bold text-primary mt-6 mb-3">{children}</h3>,
                      h4: ({ children }) => <h4 className="text-lg font-bold text-slate-900 mt-4 mb-2">{children}</h4>,
                      p: ({ children }) => <p className="text-slate-600 leading-relaxed mb-4">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4 text-slate-600">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 mb-4 text-slate-600">{children}</ol>,
                      li: ({ children }) => <li className="text-slate-600">{children}</li>,
                      strong: ({ children }) => <strong className="text-slate-900 font-bold">{children}</strong>,
                      em: ({ children }) => <em className="text-primary">{children}</em>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary pl-4 italic text-slate-500 my-6">
                          {children}
                        </blockquote>
                      ),
                      a: ({ href, children }) => {
                        const text = String(children);
                        const isApplyButton = text.includes("Apply");
                        if (isApplyButton) {
                          return (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-3 rounded-lg transition-colors no-underline"
                            >
                              {children}
                            </a>
                          );
                        }
                        return (
                          <a href={href} className="text-primary hover:text-primary/80 underline">
                            {children}
                          </a>
                        );
                      },
                    }}
                  >
                    {post.content}
                  </ReactMarkdown>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-3 mb-12">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-slate-100 rounded-full text-sm text-slate-600 border border-slate-200 flex items-center"
                >
                  <Tag className="w-3 h-3 mr-2" />
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div className="bg-slate-50 rounded-3xl p-12 border border-slate-200 text-center">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to Lead Safety 4.0?</h2>
              <p className="text-lg text-slate-600 mb-8">
                Get IOSH-approved certification in digital safety leadership
              </p>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-8 py-[22px] bg-primary text-white font-medium text-base uppercase tracking-[0.08em] rounded hover:bg-primary/90 transition-colors"
              >
                Explore the Programme
              </Link>
              <p className="text-sm text-slate-600 mt-6">
                Or explore the{" "}
                <Link to="/elearning" className="text-primary underline hover:text-primary/80">IOSH-approved Safety 4.0 course</Link>,{" "}
                <Link to="/ai-fundamentals" className="text-primary underline hover:text-primary/80">AI Fundamentals in EHS</Link>{" "}
                and the{" "}
                <Link to="/accelerator" className="text-primary underline hover:text-primary/80">Safety 4.0 Accelerator</Link>.
              </p>
            </div>
          </article>

          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <div className="max-w-5xl mx-auto mt-20">
              <h2 className="mb-8">Latest Articles</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.id}
                    to={`/blog/${related.slug}`}
                    className="group block bg-white rounded-[20px] border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={related.featuredImage}
                        alt={related.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 bg-white text-primary px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide shadow-sm">
                        {related.category}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {related.title}
                      </h3>
                      <p className="text-[#69697b] text-sm leading-relaxed line-clamp-2">
                        {related.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BlogPost;
