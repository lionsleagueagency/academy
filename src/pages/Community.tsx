import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, MessageSquare, Heart, Share2, Search, Send, X,
  TrendingUp, Award, Crown, Loader2, Trash2, Image, ChevronDown, ChevronUp
} from 'lucide-react';
import { communityService } from '../services/community.service';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  author: string;
  avatar_url: string | null;
  role: string;
  user_liked: number;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  author: string;
  avatar_url: string | null;
  role: string;
}

interface TopMember {
  id: string;
  name: string;
  avatar_url: string | null;
  role: string;
  posts_count: number;
  received_likes: number;
}

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [postImage, setPostImage] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [topMembers, setTopMembers] = useState<TopMember[]>([]);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [sendingComment, setSendingComment] = useState<Record<string, boolean>>({});

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await communityService.getPosts();
      setPosts(res.data || []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopMembers = async () => {
    try {
      const res = await communityService.getTopMembers();
      setTopMembers(res.data || []);
    } catch {
      setTopMembers([]);
    }
  };

  useEffect(() => { fetchPosts(); fetchTopMembers(); }, []);

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    try {
      setSending(true);
      const res = await communityService.createPost({
        content: newPost,
        imageUrl: postImage || null,
      });
      setPosts([res.data, ...posts]);
      setNewPost('');
      setPostImage('');
    } catch (err: any) {
      alert(err.message || 'Erro ao criar post');
    } finally {
      setSending(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await communityService.deletePost(id);
      setPosts(posts.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir');
    }
  };

  const handleLike = async (post: Post) => {
    try {
      const res = await communityService.toggleLike(post.id);
      setPosts(posts.map((p) =>
        p.id === post.id
          ? {
              ...p,
              user_liked: res.data.liked ? 1 : 0,
              likes_count: res.data.liked ? p.likes_count + 1 : p.likes_count - 1,
            }
          : p
      ));
    } catch {}
  };

  const handleLoadComments = async (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
      return;
    }
    setExpandedPost(postId);
    if (comments[postId]) return;

    try {
      setLoadingComments({ ...loadingComments, [postId]: true });
      const res = await communityService.getComments(postId);
      setComments({ ...comments, [postId]: res.data || [] });
    } catch {
      setComments({ ...comments, [postId]: [] });
    } finally {
      setLoadingComments({ ...loadingComments, [postId]: false });
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = newComment[postId]?.trim();
    if (!text) return;
    try {
      setSendingComment({ ...sendingComment, [postId]: true });
      const res = await communityService.createComment(postId, text);
      setComments({
        ...comments,
        [postId]: [...(comments[postId] || []), res.data],
      });
      setNewComment({ ...newComment, [postId]: '' });
      setPosts(posts.map((p) => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p));
    } catch (err: any) {
      alert(err.message || 'Erro ao comentar');
    } finally {
      setSendingComment({ ...sendingComment, [postId]: false });
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      await communityService.deleteComment(commentId);
      setComments({
        ...comments,
        [postId]: (comments[postId] || []).filter((c) => c.id !== commentId),
      });
      setPosts(posts.map((p) => p.id === postId ? { ...p, comments_count: p.comments_count - 1 } : p));
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir');
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const res = await api.upload(file);
      setPostImage(res.data.url);
    } catch (err: any) {
      alert(err.message || 'Erro no upload');
    }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    return d.toLocaleDateString('pt-BR');
  };

  const filteredPosts = posts.filter((p) =>
    p.content.toLowerCase().includes(search.toLowerCase()) ||
    p.author.toLowerCase().includes(search.toLowerCase())
  );

  const inputStyle = {
    background: 'var(--surface-hover)',
    borderColor: 'var(--border)',
    color: 'var(--text)',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>Comunidade</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Conecte-se com outros agenciados e troque experiências</p>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Membros', value: String(topMembers.length || 0) },
          { icon: MessageSquare, label: 'Posts', value: String(posts.length || 0) },
          { icon: TrendingUp, label: 'Interações', value: String(posts.reduce((a, p) => a + p.likes_count + p.comments_count, 0)) },
          { icon: Award, label: 'Top', value: topMembers[0]?.name?.split(' ')[0] || '-' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 rounded-2xl border text-center"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <stat.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
            <p className="font-display text-xl font-bold" style={{ color: 'var(--text)' }}>{stat.value}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Create Post */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border p-5"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-start gap-3">
              <img
                src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6C5CE7&color=fff`}
                alt=""
                className="w-10 h-10 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Compartilhe algo com a comunidade..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none border resize-none focus:ring-2 focus:ring-primary/30"
                  style={inputStyle}
                />
                {postImage && (
                  <div className="relative mt-2 rounded-xl overflow-hidden">
                    <img src={postImage} alt="" className="w-full max-h-48 object-cover" />
                    <button onClick={() => setPostImage('')} className="absolute top-2 right-2 p-1 rounded-lg bg-black/50 text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="flex items-center justify-between mt-3">
                  <label className="cursor-pointer p-2 rounded-lg hover:bg-primary/10 transition-colors">
                    <Image className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
                  </label>
                  <button
                    onClick={handleCreatePost}
                    disabled={sending || !newPost.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-primary hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Publicar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar na comunidade..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none border"
              style={inputStyle}
            />
          </div>

          {/* Posts */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <MessageSquare className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="font-semibold" style={{ color: 'var(--text)' }}>Nenhum post ainda</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Seja o primeiro a compartilhar!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl border"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      <img
                        src={post.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author)}&background=6C5CE7&color=fff`}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{post.author}</span>
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatTime(post.created_at)}</span>
                          </div>
                          {(user?.id === post.user_id || user?.role === 'admin') && (
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          )}
                        </div>

                        <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--text-secondary)' }}>{post.content}</p>

                        {post.image_url && (
                          <div className="mt-3 rounded-xl overflow-hidden">
                            <img src={post.image_url} alt="" className="w-full max-h-80 object-cover" />
                          </div>
                        )}

                        <div className="flex items-center gap-5 mt-4">
                          <button
                            onClick={() => handleLike(post)}
                            className="flex items-center gap-1.5 text-xs transition-colors"
                            style={{ color: post.user_liked ? '#FF6B6B' : 'var(--text-muted)' }}
                          >
                            <Heart className={`w-4 h-4 ${post.user_liked ? 'fill-current' : ''}`} /> {post.likes_count}
                          </button>
                          <button
                            onClick={() => handleLoadComments(post.id)}
                            className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <MessageSquare className="w-4 h-4" /> {post.comments_count}
                            {expandedPost === post.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                          <button className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors" style={{ color: 'var(--text-muted)' }}>
                            <Share2 className="w-4 h-4" /> Compartilhar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <AnimatePresence>
                    {expandedPost === post.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <div className="p-5 space-y-4">
                          {loadingComments[post.id] ? (
                            <div className="flex justify-center py-4">
                              <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            </div>
                          ) : (
                            <>
                              {(comments[post.id] || []).map((comment) => (
                                <div key={comment.id} className="flex items-start gap-2">
                                  <img
                                    src={comment.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author)}&background=6C5CE7&color=fff`}
                                    alt=""
                                    className="w-7 h-7 rounded-lg object-cover shrink-0"
                                  />
                                  <div className="flex-1 bg-opacity-50 rounded-xl px-3 py-2"
                                    style={{ background: 'var(--surface-hover)' }}>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{comment.author}</span>
                                      {(user?.id === comment.user_id || user?.role === 'admin') && (
                                        <button
                                          onClick={() => handleDeleteComment(post.id, comment.id)}
                                          className="p-0.5 rounded hover:bg-red-50"
                                        >
                                          <X className="w-3 h-3 text-red-400" />
                                        </button>
                                      )}
                                    </div>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{comment.content}</p>
                                  </div>
                                </div>
                              ))}

                              {/* Add Comment */}
                              <div className="flex items-center gap-2 pt-2">
                                <img
                                  src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6C5CE7&color=fff`}
                                  alt=""
                                  className="w-7 h-7 rounded-lg object-cover shrink-0"
                                />
                                <input
                                  type="text"
                                  value={newComment[post.id] || ''}
                                  onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                                  placeholder="Escreva um comentário..."
                                  className="flex-1 px-3 py-2 rounded-xl text-xs outline-none border focus:ring-2 focus:ring-primary/30"
                                  style={inputStyle}
                                />
                                <button
                                  onClick={() => handleAddComment(post.id)}
                                  disabled={sendingComment[post.id] || !newComment[post.id]?.trim()}
                                  className="p-2 rounded-xl bg-gradient-primary text-white hover:scale-105 transition-transform disabled:opacity-50"
                                >
                                  {sendingComment[post.id] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3 mb-5">
              <Crown className="w-5 h-5 text-amber-500" />
              <h2 className="font-semibold" style={{ color: 'var(--text)' }}>Top Membros</h2>
            </div>
            <div className="space-y-3">
              {topMembers.map((member, i) => (
                <div key={member.id} className="flex items-center gap-3 p-2 rounded-xl"
                  style={{ background: i === 0 ? 'var(--surface-hover)' : 'transparent' }}
                >
                  <span className="w-5 text-center text-sm font-bold"
                    style={{ color: i < 3 ? 'var(--primary)' : 'var(--text-muted)' }}
                  >
                    {i + 1}
                  </span>
                  <img
                    src={member.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=6C5CE7&color=fff`}
                    alt=""
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{member.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{member.posts_count} posts · {member.received_likes} likes</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
