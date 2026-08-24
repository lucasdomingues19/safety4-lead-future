import AudienceNav from "@/components/AudienceNav";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { useEffect, useState } from "react";
import { trackPageView } from "@/utils/analytics";
import { setPageSEO } from "@/utils/seo";
import { SEOStructuredData } from "@/components/SEOStructuredData";
import { getAllPublished, type BlogPost } from "@/lib/blog";
import { Link } from "react-router-dom";
import founderPhoto from "@/assets/founder-cutout.png";

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackPageView(window.location.pathname);
    setPageSEO({
      title: "Safety 4.0 Blog — AI, EHS & SafetyTech Insights",
      description: "Expert articles on AI in workplace safety, SafetyTech trends and IOSH training. Stay ahead in safety leadership.",
      canonical: "https://safetytech.academy/blog",
    });
    getAllPublished().then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  const [featured, ...rest] = posts;

  return (
    <>
      <SEOStructuredData type="organization" />
      <div className="min-h-screen bg-white">
        <AudienceNav />

        <div className="container mx-auto px-4 pt-28 pb-20 md:pt-32">
          {/* Header */}
          <div className="mb-12">
            <h1 className="mb-4">
              Safety 4.0 <span className="text-primary">Insights</span>
            </h1>
            <p className="text-lg text-[#69697b] max-w-2xl">
              Expert insights on AI, digital transformation, and the future of workplace safety
            </p>
          </div>

          {loading && (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {/* Featured Post — full-bleed image with overlaid title */}
          {!loading && featured && (
            <Link to={`/blog/${featured.slug}`} className="block mb-16 group">
              <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-[24px] overflow-hidden">
                <img
                  src={featured.featuredImage}
                  alt={featured.title}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b2c]/90 via-[#0b0b2c]/20 to-transparent" />
                <div className="absolute top-5 right-5 bg-primary text-white px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide">
                  Featured
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-2xl">
                  <h2 className="text-white mb-3">{featured.title}</h2>
                  <p className="text-white/80 text-sm md:text-base leading-relaxed">
                    {featured.excerpt}
                  </p>
                </div>
              </div>
            </Link>
          )}

          {/* Blog Posts Grid */}
          {!loading && rest.length > 0 && (
          <>
          <h2 className="mb-8">Latest Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group block bg-white rounded-[20px] border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white text-primary px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide shadow-sm">
                    {post.category}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-[#69697b] text-sm leading-relaxed mb-5 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={founderPhoto}
                        alt={post.author}
                        loading="lazy"
                        decoding="async"
                        className="w-8 h-8 rounded-full object-cover bg-slate-100"
                      />
                      <span className="text-sm text-slate-700 font-medium">{post.author}</span>
                    </div>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          </>
          )}

          {/* Explore our programmes — internal links */}
          <div className="max-w-4xl mx-auto mt-20">
            <h2 className="mb-6 text-center">Explore Our Programmes</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { to: "/elearning", title: "IOSH-approved Safety 4.0", desc: "Self-paced certification in digital safety leadership." },
                { to: "/ai-fundamentals", title: "AI Fundamentals in EHS", desc: "Practical AI skills for safety professionals." },
                { to: "/pricing", title: "Pricing & Plans", desc: "Compare options for individuals and teams." },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block bg-white border border-slate-200 rounded-2xl p-6 hover:border-primary transition-colors"
                >
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-[#69697b]">{item.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter CTA */}
          <div className="max-w-4xl mx-auto mt-12">
            <div className="bg-slate-50 rounded-3xl p-12 border border-slate-200 text-center">
              <h2 className="mb-4">Stay Ahead in Safety 4.0</h2>
              <p className="text-lg text-[#69697b] mb-8">
                Get the latest insights on AI, digital transformation, and workplace safety delivered to your inbox
              </p>
              <Button asChild className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-base font-medium uppercase tracking-[0.08em] rounded">
                <Link to="/contact">Subscribe to Updates</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Blog;
