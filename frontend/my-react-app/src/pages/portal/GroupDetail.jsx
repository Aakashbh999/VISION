import { useParams } from "react-router-dom";
import { useGroup } from "../../hooks/useGroup";
import { useGroupPosts } from "../../hooks/useGroupPosts";
import { useJoinGroup } from "../../hooks/useJoinGroup";
import { useCreatePost } from "../../hooks/useCreatePost";
import { useState } from "react";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Send, ChevronLeft, Users } from "lucide-react";
import { Link } from "react-router-dom";

const GroupDetail = () => {
  const { id } = useParams();
  const {
    data: group,
    isLoading: groupLoading,
    error: groupError,
  } = useGroup(id);
  const {
    data: posts,
    isLoading: postsLoading,
    error: postsError,
  } = useGroupPosts(id);
  const joinMutation = useJoinGroup(id);
  const createPostMutation = useCreatePost(id);
  const [newPost, setNewPost] = useState("");

  if (groupLoading || postsLoading) return <LoadingSpinner />;
  if (groupError || postsError)
    return <div className="p-8 text-red-500">Failed to load group</div>;

  const handleJoin = () => {
    joinMutation.mutate();
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    createPostMutation.mutate(newPost, {
      onSuccess: () => setNewPost(""),
    });
  };

  return (
    <div className="space-y-6">
      <Link
        to="/portal/groups"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Groups
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
            <p className="text-gray-600 mt-2">{group.description}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span>Created by {group.creator}</span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" /> {group.members} members
              </span>
            </div>
          </div>
          <button
            onClick={handleJoin}
            disabled={joinMutation.isLoading}
            className="mt-4 md:mt-0 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {joinMutation.isLoading ? "Joining..." : "Join Group"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Posts</h2>

        {posts?.length === 0 ? (
          <p className="text-gray-500">No posts yet. Be the first to post!</p>
        ) : (
          posts?.map((post) => (
            <div
              key={post.post_id}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span className="font-medium text-gray-800">
                  {post.full_name}
                </span>
                <span>•</span>
                <span>{new Date(post.created_at).toLocaleString()}</span>
              </div>
              <p className="text-gray-700">{post.content}</p>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={handlePostSubmit}
        className="bg-white rounded-xl border border-gray-200 p-4"
      >
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Write a post..."
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
        />
        <div className="flex justify-end mt-3">
          <button
            type="submit"
            disabled={createPostMutation.isLoading || !newPost.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {createPostMutation.isLoading ? (
              "Posting..."
            ) : (
              <>
                <Send className="w-4 h-4" /> Post
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GroupDetail;
