import { ArrowLeft, Clock, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { useEffect } from "react";
import { trackPageView } from "@/utils/analytics";
import { SEOStructuredData } from "@/components/SEOStructuredData";
import { blogPosts } from "@/data/blogPosts";
import { Link } from "react-router-dom";

const Blog = () => {
  useEffect(() => {
    trackPageView(window.location.pathname);
  }, []);

  return (
    <>
      <SEOStructuredData type="organization" />
      <div className="min-h-screen relative overflow-hidden">
        {/* Black to dark blue gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#11113a] via-slate-900 to-black"></div>
        
        {/* Floating elements - Purple and Lime */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/25 via-purple-600/20 to-violet-500/15 blur-3xl animate-[float_20s_ease-in-out_infinite]"></div>
          <div className="absolute top-1/4 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-lime-400/20 via-lime-500/25 to-lime-600/15 blur-3xl animate-[float_25s_ease-in-out_infinite_reverse]"></div>
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-purple-600/15 via-purple-500/20 to-purple-400/10 blur-3xl animate-[float_30s_ease-in-out_infinite]"></div>
          <div className="absolute bottom-1/4 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-lime-500/15 via-lime-400/20 to-lime-600/10 blur-3xl animate-[float_28s_ease-in-out_infinite_reverse]"></div>
        </div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          {/* Back Navigation */}
          <div className="mb-12">
            <Button variant="outline" size="sm" asChild className="border-white/30 text-white hover:bg-white/10">
              <Link to="/" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Safety 4.0 <span className="text-pink-500">Insights</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Expert insights on AI, digital transformation, and the future of workplace safety
            </p>
          </div>

          {/* Featured Post */}
          {blogPosts.length > 0 && (
            <Link to={`/blog/${blogPosts[0].slug}`} className="block mb-16">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 overflow-hidden hover:border-pink-400/50 transition-all duration-300 hover:scale-[1.02]">
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="aspect-video lg:aspect-auto bg-gradient-to-br from-pink-500/20 to-purple-500/20"></div>
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center space-x-4 mb-4">
                      <span className="px-4 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm font-medium">
                        {blogPosts[0].category}
                      </span>
                      <span className="text-gray-400 text-sm flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(blogPosts[0].publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4 hover:text-pink-400 transition-colors">
                      {blogPosts[0].title}
                    </h2>
                    <p className="text-gray-300 mb-6 leading-relaxed">
                      {blogPosts[0].excerpt}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
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
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden hover:border-pink-400/50 transition-all duration-300 h-full flex flex-col group-hover:scale-105">
                  <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-lime-500/20"></div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                        {post.category}
                      </span>
                      <span className="text-gray-400 text-xs flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {post.readTime}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-pink-400 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <span className="text-gray-400 text-xs">
                        {new Date(post.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-pink-400 text-sm font-medium group-hover:underline">
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
            <div className="bg-gradient-to-r from-pink-500/20 to-lime-500/20 rounded-3xl p-12 border border-white/20 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Stay Ahead in Safety 4.0</h2>
              <p className="text-lg text-gray-300 mb-8">
                Get the latest insights on AI, digital transformation, and workplace safety delivered to your inbox
              </p>
              <Button asChild className="bg-pink-500 hover:bg-pink-600 text-white text-lg px-8 py-6">
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
