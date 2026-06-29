import { useState, useEffect, useCallback } from "react";
import { useAdmin } from "../../context/AdminContext";
import { Plus, Edit3, Trash2, Search, X, Image, Link2 } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";

const emptyPost = {
  title: "",
  content: "",
  excerpt: "",
  coverImage: "",
  author: "Admin",
  tags: "",
  published: false,
};

function Toolbar({ editor }) {
  if (!editor) return null;
  const addLink = () => {
    const url = prompt("Enter URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };
  const addImage = () => {
    const url = prompt("Enter image URL:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };
  const btn = (on, onClick, label) => (
    <button type="button" onClick={onClick} className={`p-1.5 rounded text-sm font-medium transition-colors ${on ? "bg-primary text-white" : "hover:bg-surface-alt"}`}>{label}</button>
  );
  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-border dark:border-dark-border bg-surface-alt dark:bg-dark-surface rounded-t-xl">
      {btn(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), <b>B</b>)}
      {btn(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), <i>I</i>)}
      {btn(editor.isActive("underline"), () => editor.chain().focus().toggleUnderline().run(), <u>U</u>)}
      <span className="w-px bg-border mx-1" />
      {btn(editor.isActive("heading", { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), "H1")}
      {btn(editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), "H2")}
      {btn(editor.isActive("heading", { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), "H3")}
      <span className="w-px bg-border mx-1" />
      {btn(editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run(), "•")}
      {btn(editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), "1.")}
      {btn(editor.isActive("blockquote"), () => editor.chain().focus().toggleBlockquote().run(), '"')}
      <span className="w-px bg-border mx-1" />
      {btn(editor.isActive("link"), addLink, <Link2 className="w-4 h-4" />)}
      {btn(false, addImage, <Image className="w-4 h-4" />)}
    </div>
  );
}

function TipTapInput({ value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit, Underline, LinkExtension, ImageExtension],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  return (
    <div className="border border-border dark:border-dark-border rounded-xl overflow-hidden">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className="prose prose-sm max-w-none p-3 min-h-[200px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[200px]" />
    </div>
  );
}

export default function AdminBlog() {
  const { blogPosts, refreshBlogPosts, addBlogPost, updateBlogPost, deleteBlogPost } = useAdmin();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyPost });

  const resetForm = useCallback(() => {
    setForm({ ...emptyPost });
    setEditing(null);
  }, []);

  useEffect(() => {
    refreshBlogPosts();
  }, [refreshBlogPosts]);

  const filtered = blogPosts.filter(
    (p) =>
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.author?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (post) => {
    setEditing(post);
    setForm({
      title: post.title || "",
      content: post.content || "",
      excerpt: post.excerpt || "",
      coverImage: post.coverImage || "",
      author: post.author || "Admin",
      tags: (post.tags || []).join(", "),
      published: post.published || false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    if (editing) {
      await updateBlogPost(editing.id, payload);
    } else {
      await addBlogPost(payload);
    }
    setShowModal(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        <input type="text" placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-border dark:border-dark-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-secondary border-b border-border dark:border-dark-border bg-gray-50 dark:bg-dark-bg/50">
                <th className="p-3 font-medium">Cover</th>
                <th className="p-3 font-medium">Title</th>
                <th className="p-3 font-medium">Author</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border/50 dark:border-dark-border/50 hover:bg-gray-50 dark:hover:bg-dark-bg/30">
                  <td className="p-3">
                    {p.coverImage ? (
                      <img src={p.coverImage} alt="" className="w-14 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-14 h-10 rounded-lg bg-surface-alt flex items-center justify-center text-text-secondary text-xs">No img</div>
                    )}
                  </td>
                  <td className="p-3 font-medium max-w-xs truncate">{p.title}</td>
                  <td className="p-3 text-text-secondary">{p.author}</td>
                  <td className="p-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${p.published ? "bg-success/10 text-success" : "bg-text-secondary/10 text-text-secondary"}`}>
                      {p.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="p-3 text-text-secondary text-xs">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="p-2 hover:bg-surface-alt dark:hover:bg-dark-surface rounded-lg text-text-secondary hover:text-primary transition-colors" title="Edit"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => { if (window.confirm("Delete this post?")) deleteBlogPost(p.id); }} className="p-2 hover:bg-surface-alt dark:hover:bg-dark-surface rounded-lg text-text-secondary hover:text-error transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-text-secondary">No posts found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 bg-black/50 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-3xl bg-white dark:bg-dark-surface rounded-2xl shadow-xl border border-border dark:border-dark-border overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border dark:border-dark-border">
              <h2 className="text-lg font-bold">{editing ? "Edit Post" : "New Post"}</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="p-1 hover:text-primary"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
                    className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Author</label>
                  <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                  <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Travel, Lagos, Review"
                    className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Cover Image URL</label>
                  <input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Content</label>
                  <TipTapInput value={form.content} onChange={(content) => setForm({ ...form, content })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Excerpt (summary for listing)</label>
                  <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={3} maxLength={300}
                    className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="published" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })}
                    className="rounded border-border text-primary focus:ring-primary" />
                  <label htmlFor="published" className="text-sm font-medium">Published</label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-border dark:border-dark-border">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 text-sm font-medium rounded-xl border border-border dark:border-dark-border hover:bg-surface-alt dark:hover:bg-dark-surface transition-colors">Cancel</button>
                <button type="submit"
                  className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors">{editing ? "Save Changes" : "Publish"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
