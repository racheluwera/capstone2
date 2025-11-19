import { useState } from 'react';
import { Button } from './ui/button';
import PhotoUploadButton from './PhotoUploadButton';

export default function PostForm({ onPublish }) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [postContent, setPostContent] = useState('');

  const handlePublish = async () => {
    setIsLoading(true);
    try {
      const post = {
        content: postContent,
        image: imageUrl,
        timestamp: new Date().toISOString(),
      };
      await onPublish(post);
    } catch (error) {
      console.error('Publishing failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        value={postContent}
        onChange={(e) => setPostContent(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full p-3 border rounded-lg"
      />
      
      {imageUrl && (
        <img src={imageUrl} alt="Upload preview" className="max-w-xs rounded-lg" />
      )}
      
      <div className="flex justify-between items-center">
        <PhotoUploadButton onImageUpload={setImageUrl} />
        
        <Button onClick={handlePublish} disabled={isLoading}>
          {isLoading ? 'Publishing...' : 'Publish Now'}
        </Button>
      </div>
    </div>
  );
}