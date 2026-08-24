import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { FileText, Loader2, Plus, Trash2, Pencil, Eye, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  created_at: string;
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const emptyForm = () => ({
  slug: "",
  title: "",
  meta_description: "",
  excerpt: "",
  author: "Lucas Domingues",
  author_title: "Safety 4.0 Expert, MSc, CMIOSH",
  publish_date: new Date().toISOString().slice(0, 10),
  read_time: "5 min read",
  category: "AI in EHS",
  tags: "",
  featured_image: "",
  content: "",
  published: false,
});

export const BlogManager = () => {
  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [toDelete, setToDelete] = useState<BlogPostRow | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("publish_date", { ascending: false });
    if (error) {
      toast.error("Could not load blog posts");
    } else {
      setPosts((data as unknown as BlogPostRow[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (p: BlogPostRow) => {
    setEditingId(p.id);
    setForm({
      slug: p.slug,
      title: p.title,
      meta_description: p.meta_description,
      excerpt: p.excerpt,
      author: p.author,
      author_title: p.author_title,
      publish_date: p.publish_date.slice(0, 10),
      read_time: p.read_time,
      category: p.category,
      tags: p.tags.join(", "),
      featured_image: p.featured_image,
      content: p.content,
      published: p.published,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  const save = async () => {
    if (!form.slug.trim() || !form.title.trim()) {
      toast.error("Slug and title are required");
      return;
    }
    setSaving(true);
    const payload = {
      slug: slugify(form.slug),
      title: form.title.trim(),
      meta_description: form.meta_description.trim(),
      excerpt: form.excerpt.trim(),
      author: form.author.trim() || "Lucas Domingues",
      author_title: form.author_title.trim(),
      publish_date: form.publish_date,
      read_time: form.read_time.trim() || "5 min read",
      category: form.category.trim() || "AI in EHS",
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      featured_image: form.featured_image.trim(),
      content: form.content,
      published: form.published,
    };
    const { error } = editingId
      ? await supabase.from("blog_posts").update(payload).eq("id", editingId)
      : await supabase.from("blog_posts").insert(payload);
    setSaving(false);
    if (error) {
      toast.error(
        error.message.includes("duplicate") ? "That slug is already in use" : (editingId ? "Could not update post" : "Could not create post"),
      );
      return;
    }
    toast.success(editingId ? "Post updated" : "Post created");
    setEditingId(null);
    setForm(emptyForm());
    load();
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", toDelete.id);
    if (error) {
      toast.error("Delete failed");
    } else {
      toast.success("Post deleted");
      setToDelete(null);
      load();
    }
  };

  return (
    <div className="space-y-8">
      {/* Editor */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <FileText className="h-5 w-5 text-primary" />
            {editingId ? "Edit post" : "New post"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="bp-title">Title *</Label>
              <Input
                id="bp-title"
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm((f) => ({ ...f, title, slug: f.slug || slugify(title) }));
                }}
                placeholder="Post title"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="bp-slug">Slug *</Label>
              <div className="flex gap-2">
                <Input
                  id="bp-slug"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="post-url-slug"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForm((f) => ({ ...f, slug: slugify(f.title) }))}
                >
                  Generate from title
                </Button>
              </div>
              <p className="text-xs text-slate-400">Lives at /blog/{form.slug || "..."}</p>
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="bp-excerpt">Excerpt</Label>
              <Textarea
                id="bp-excerpt"
                rows={2}
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="One or two sentences shown on the blog listing card"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="bp-meta">Meta description</Label>
              <Textarea
                id="bp-meta"
                rows={2}
                value={form.meta_description}
                onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                placeholder="SEO description shown in search results"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="bp-author">Author</Label>
              <Input id="bp-author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="bp-author-title">Author title</Label>
              <Input id="bp-author-title" value={form.author_title} onChange={(e) => setForm({ ...form, author_title: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="bp-date">Publish date</Label>
              <Input id="bp-date" type="date" value={form.publish_date} onChange={(e) => setForm({ ...form, publish_date: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="bp-readtime">Read time</Label>
              <Input id="bp-readtime" value={form.read_time} onChange={(e) => setForm({ ...form, read_time: e.target.value })} placeholder="5 min read" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="bp-category">Category</Label>
              <Input id="bp-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="AI in EHS" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="bp-tags">Tags (comma-separated)</Label>
              <Input id="bp-tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="AI, Safety Leadership" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="bp-image">Featured image URL</Label>
              <Input id="bp-image" value={form.featured_image} onChange={(e) => setForm({ ...form, featured_image: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="bp-content">Content (Markdown)</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowPreview(true)}>
                  <Eye className="mr-2 h-3.5 w-3.5" /> Preview
                </Button>
              </div>
              <Textarea
                id="bp-content"
                rows={16}
                className="font-mono text-sm"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="## Heading&#10;&#10;Body text in Markdown..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="bp-published" checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
              <Label htmlFor="bp-published">Published (visible on the public blog)</Label>
            </div>
            <div className="md:col-span-2 flex flex-wrap gap-3">
              <Button onClick={save} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingId ? "Save changes" : "Create post"}
              </Button>
              {editingId && (
                <Button variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">Blog posts ({posts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : posts.length === 0 ? (
            <p className="text-slate-500 text-sm py-6 text-center">No blog posts yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="max-w-[280px]">
                        <div className="font-medium truncate">{p.title}</div>
                        <div className="text-xs text-slate-400 truncate">/blog/{p.slug}</div>
                      </TableCell>
                      <TableCell className="text-sm">{p.category}</TableCell>
                      <TableCell className="text-sm">{new Date(p.publish_date).toLocaleDateString("en-GB")}</TableCell>
                      <TableCell>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            p.published ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {p.published ? "Published" : "Draft"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {p.published && (
                            <Button size="icon" variant="ghost" title="View live" onClick={() => window.open(`/blog/${p.slug}`, "_blank")}>
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" title="Edit" onClick={() => startEdit(p)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" title="Delete" onClick={() => setToDelete(p)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete post?</DialogTitle>
            <DialogDescription>
              This permanently removes "{toDelete?.title}". If it's published, the live page will start 404-ing immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete permanently</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.title || "Untitled post"}</DialogTitle>
            <DialogDescription>Markdown preview — matches the public post's rendering</DialogDescription>
          </DialogHeader>
          <div className="prose prose-slate max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content || "*Nothing to preview yet.*"}</ReactMarkdown>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogManager;
