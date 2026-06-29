import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, User, ArrowLeft, Tag } from "lucide-react";
import { getBlogPost } from "../services/api";
import BackToTop from "../components/BackToTop";

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getBlogPost(slug)
      .then((data) => setPost(data))
      .catch((err) => setError(err.message || "Post not found"))
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Post Not Found</h2>
          <p className="text-text-secondary mb-4">{error || "The blog post you're looking for doesn't exist."}</p>
          <Link to="/blog" className="text-primary font-semibold hover:underline inline-flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Back to Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      {post.coverImage && (
        <div className="relative h-[40vh] sm:h-[50vh] overflow-hidden">
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-secondary mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/blog" className="hover:text-primary">Blog</Link>
          <span>/</span>
          <span className="text-text truncate">{post.title}</span>
        </nav>

        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary mb-6">
            <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{post.author}</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>

          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium"><Tag className="w-3 h-3" />{tag}</span>
              ))}
            </div>
          )}

          <div
            className="prose prose-sm sm:prose-base dark:prose-invert max-w-none leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </motion.article>

        <div className="mt-12 pt-8 border-t border-border dark:border-dark-border">
          <Link to="/blog" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </div>
      </div>

      <BackToTop />
    </div>
  );
}
