import AudienceNav from "@/components/AudienceNav";
import { ArrowLeft, Clock, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { useEffect } from "react";
import { trackPageView } from "@/utils/analytics";
import { setPageSEO } from "@/utils/seo";
import { SEOStructuredData } from "@/components/SEOStructuredData";
import { blogPosts } from "@/data/blogPosts";
import { Link } from "react-router-dom";

const Blog = () => {
  useEffect(() => {
    trackPageView(window.location.pathname);
    setPageSEO({
      title: "Safety 4.0 Blog — AI, EHS & SafetyTech Insights",
      description: "Expert articles on AI in workplace safety, SafetyTech trends and IOSH training. Stay ahead in safety leadership.",
      canonical: "https://safetyacademy.tech/blog",
    });
  }, []);

  return (
    <>
      <SEOStructuredData type="organization" />
      <div className="min-h-screen bg-white">
        <AudienceNav />

        <div className="container mx-auto px-4 py-20 relative z-10">
          {/* Back Navigation */}
          <div className="mb-12">
            <Button variant="outline" size="sm" asChild className="border-slate-300 text-slate-700 hover:bg-slate-100">
              <Link to="/" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
              Safety 4.0 <span className="text-primary">Insights</span>
            </h1>
            <p className="text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              Expert insights on AI, digital transformation, and the future of workplace safety
            </p>
          </div>

          {/* Featured Post */}
          {blogPosts.length > 0 && (
            <Link to={`/blog/${blogPosts[0].slug}`} className="block mb-16">
              <div className="bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:scale-[1.02]">
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="aspect-video overflow-hidden bg-slate-100">
                    <img
                      src={blogPosts[0].featuredImage}
                      alt={blogPosts[0].title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center space-x-4 mb-4">
                      <span className="px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {blogPosts[0].category}
                      </span>
                      <span className="text-slate-500 text-sm flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(blogPosts[0].publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4 hover:text-primary transition-colors">
                      {blogPosts[0].title}
                    </h2>
                    <p className="text-slate-600 mb-6 leading-relaxed">
                      {blogPosts[0].excerpt}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <span>{blogPosts[0].author}</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {blogPosts[0].readTime}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Blog Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="block group"
              >
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 h-full flex flex-col group-hover:scale-105">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                        {post.category}
                      </span>
                      <span className="text-slate-500 text-xs flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {post.readTime}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 text-sm mb-4 leading-relaxed line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <span className="text-slate-500 text-xs">
                        {new Date(post.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-primary text-sm font-medium group-hover:underline">
                        Read More →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Newsletter CTA */}
          <div className="max-w-4xl mx-auto mt-20">
            <div className="bg-slate-50 rounded-3xl p-12 border border-slate-200 text-center">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Stay Ahead in Safety 4.0</h2>
              <p className="text-lg text-slate-600 mb-8">
                Get the latest insights on AI, digital transformation, and workplace safety delivered to your inbox
              </p>
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6">
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
