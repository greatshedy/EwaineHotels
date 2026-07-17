import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, User, ArrowRight, FileText } from "lucide-react";
import { getBlogPosts } from "../services/api";
import BackToTop from "../components/BackToTop";

const fadeUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { animate: { transition: { staggerChildren: 0.08 } } };

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogPosts()
      .then((data) => {
        const unique = [...new Map((data || []).map((p) => [p.id, p])).values()];
        setPosts(unique);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative py-24 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 dark:from-primary/20 dark:via-accent/10 dark:to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-5xl font-bold mb-4">Our Blog</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="text-lg text-text-secondary max-w-2xl mx-auto">Travel tips, hotel reviews, and stories from across Africa.</motion.p>
        </div>
      </section>

      {/* Posts */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <FileText className="w-16 h-16 text-text-secondary/40 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No posts yet</h2>
            <p className="text-text-secondary mb-6">Check back soon for new stories and updates.</p>
            <Link to="/" className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors inline-block">Go Home</Link>
          </motion.div>
        ) : (
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <motion.div key={post.id} variants={fadeUp}>
                <Link to={`/blog/${post.slug}`} className="group block bg-white dark:bg-dark-surface rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                  <div className="aspect-[16/10] overflow-hidden">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt={post.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <FileText className="w-12 h-12 text-primary/40" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 text-xs text-text-secondary mb-3">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(post.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{post.author}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                    {post.excerpt && <p className="text-sm text-text-secondary line-clamp-2 mb-3">{post.excerpt}</p>}
                    {post.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{tag}</span>
                        ))}
                      </div>
                    )}
                    <span className="inline-flex items-center gap-1 text-sm text-primary font-medium group-hover:underline">Read More <ArrowRight className="w-3.5 h-3.5" /></span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      <BackToTop />
    </div>
  );
}
