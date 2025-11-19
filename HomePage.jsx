import { useState } from 'react';
import PostForm from './PostForm';

export default function HomePage() {
  const [posts, setPosts] = useState([]);

  const handlePublish = async (newPost) => {
    // Add post to the beginning of the array (newest first)
    setPosts(prev => [newPost, ...prev]);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <PostForm onPublish={handlePublish} />
      
      <div className="space-y-4">
        {posts.map((post, index) => (
          <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
            <p className="mb-3">{post.content}</p>
            {post.image && (
              <img src={post.image} alt="Post" className="w-full rounded-lg mb-3" />
            )}
            <small className="text-gray-500">
              {new Date(post.timestamp).toLocaleString()}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}