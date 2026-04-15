import { useEffect, useMemo, useState } from "react";
import { Heart, MessageCircle, Send, Trash2 } from "lucide-react";
import {
  addCommentToPost,
  createPost,
  deleteComment,
  getPosts,
  likePost
} from "../../services/apiService";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import Pagination from "../../components/Pagination";
import PageHeader from "../../components/PageHeader";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/errors";

function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [likeLoadingId, setLikeLoadingId] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Career");
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const { addToast } = useToast();
  const pageSize = 5;

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);

    try {
      const response = await getPosts();
      const nextPosts = [...(response.data || [])].sort(
        (first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0)
      );
      setPosts(nextPosts);
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to load posts."), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      addToast("Title and content are required.", "error");
      return;
    }

    setSubmitting(true);

    try {
      await createPost({
        title: title.trim(),
        content: content.trim(),
        category,
        tags: [category.toLowerCase()]
      });

      setTitle("");
      setContent("");
      setCurrentPage(1);
      addToast("Post created successfully.", "success");
      await loadPosts();
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to create post."), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (id) => {
    setLikeLoadingId(id);

    try {
      const response = await likePost(id);
      const updatedPost = response.data || {};

      setPosts((current) =>
        current.map((post) =>
          post.id === id
            ? {
                ...post,
                likesCount: updatedPost.likesCount ?? post.likesCount,
                likedByCurrentUser: Boolean(updatedPost.likedByCurrentUser)
              }
            : post
        )
      );
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to update like."), "error");
    } finally {
      setLikeLoadingId(null);
    }
  };

  const handleComment = async (postId) => {
    const text = commentText[postId]?.trim();

    if (!text) {
      addToast("Comment cannot be empty.", "error");
      return;
    }

    try {
      await addCommentToPost(postId, text);
      setCommentText((current) => ({ ...current, [postId]: "" }));
      await loadPosts();
    } catch (error) {
      addToast(getErrorMessage(error, "Failed to post comment."), "error");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      addToast("Comment deleted.", "success");
      await loadPosts();
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to delete comment."), "error");
    }
  };

  const toggleComments = (id) => {
    setShowComments((current) => ({ ...current, [id]: !current[id] }));
  };

  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return posts.slice(start, start + pageSize);
  }, [currentPage, posts]);

  if (loading) {
    return <Loader label="Loading forum..." />;
  }

  return (
    <div className="space-y-8 p-6 md:p-8">
      <PageHeader
        title="Community Forum"
        subtitle="Start discussions, ask for help, and keep alumni conversations visible."
      />

      <div className="glass-card p-6">
        <div className="grid gap-4">
          <input
            placeholder="Post title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="glass-input"
          />

          <textarea
            placeholder="What would you like to share?"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="glass-input min-h-36"
          />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="glass-input w-full sm:max-w-xs"
            >
              <option>Career</option>
              <option>Jobs</option>
              <option>Network</option>
            </select>

            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? "Publishing..." : "Create Post"}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {paginatedPosts.map((post) => (
          <article key={post.id} className="glass-card p-6 card-hover">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{post.title}</h3>
                <p className="mt-2 leading-7 text-slate-700">{post.content}</p>
                <div className="mt-3 text-sm text-slate-500">
                  {post.authorName} | {post.category} |{" "}
                  {post.createdAt ? new Date(post.createdAt).toLocaleString() : "Recently posted"}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleLike(post.id)}
                disabled={likeLoadingId === post.id}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  post.likedByCurrentUser
                    ? "border-rose-200 bg-rose-50 text-rose-600"
                    : "border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:text-rose-500"
                } ${likeLoadingId === post.id ? "cursor-not-allowed opacity-70" : ""}`}
              >
                <Heart
                  size={18}
                  className={post.likedByCurrentUser ? "fill-rose-500 text-rose-500" : "text-slate-500"}
                />
                <span>{post.likesCount || 0}</span>
              </button>

              <button
                type="button"
                onClick={() => toggleComments(post.id)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-sky-200 hover:text-sky-500"
              >
                <MessageCircle size={18} className="text-sky-500" />
                <span>{post.comments?.length || 0}</span>
              </button>
            </div>

            {showComments[post.id] ? (
              <div className="mt-6 space-y-4 rounded-3xl bg-slate-50 p-4">
                {(post.comments || []).map((comment) => (
                  <div key={comment.id} className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-800">{comment.authorName}</p>
                        <p className="mt-2 text-slate-700">{comment.content}</p>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-400"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                    <p className="mt-3 text-xs text-slate-400">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    className="glass-input flex-1"
                    placeholder="Write a comment..."
                    value={commentText[post.id] || ""}
                    onChange={(event) =>
                      setCommentText((current) => ({
                        ...current,
                        [post.id]: event.target.value
                      }))
                    }
                  />

                  <Button onClick={() => handleComment(post.id)} className="inline-flex items-center gap-2">
                    <Send size={16} />
                    Post Comment
                  </Button>
                </div>
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={posts.length}
        pageSize={pageSize}
        itemLabel="posts"
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default Posts;
