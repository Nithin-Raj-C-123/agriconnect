
import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, Plus, Search, Tag, User, X, Send } from 'lucide-react';
import { ForumPost, User as UserType } from '../types';
import { FORUM_POSTS } from '../services/mockStore';

interface ForumProps {
  currentUser?: UserType | null;
}

export const Forum: React.FC<ForumProps> = ({ currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [posts, setPosts] = useState<ForumPost[]>(FORUM_POSTS);
  
  // New Post State
  const [isCreating, setIsCreating] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General' });

  const categories = ['All', 'Seeds', 'Diseases', 'Market Prices', 'Govt Schemes', 'General'];
  const postCategories = ['Seeds', 'Diseases', 'Market Prices', 'Govt Schemes', 'General'];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("You must be logged in to post.");
      return;
    }
    if (!newPost.title || !newPost.content) {
      alert("Please fill in all fields");
      return;
    }

    const post: ForumPost = {
      id: `post-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      category: newPost.category,
      title: newPost.title,
      content: newPost.content,
      likes: 0,
      comments: 0,
      timestamp: Date.now()
    };

    setPosts([post, ...posts]);
    setIsCreating(false);
    setNewPost({ title: '', content: '', category: 'General' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="text-agri-600" /> Community Forum
          </h2>
          <p className="text-slate-500 mt-1">Connect, share, and learn from other farmers.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-agri-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-agri-700 transition-colors flex items-center gap-2 active:scale-95"
        >
          <Plus size={20} /> Start Discussion
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
             <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text"
                  placeholder="Search topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-500 outline-none"
                />
             </div>
             <div className="space-y-1">
               {categories.map(cat => (
                 <button
                   key={cat}
                   onClick={() => setSelectedCategory(cat)}
                   className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === cat ? 'bg-agri-50 text-agri-700' : 'text-slate-600 hover:bg-slate-50'}`}
                 >
                   {cat}
                 </button>
               ))}
             </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
             <h3 className="font-bold text-blue-900 mb-2">Trending Topic</h3>
             <p className="text-sm text-blue-800 mb-2">"Export demand for organic cotton looks promising this quarter."</p>
             <button className="text-xs text-blue-600 font-bold hover:underline">Read Thread</button>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="lg:col-span-3 space-y-4">
          {filteredPosts.map(post => (
            <div key={post.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-agri-200 transition-colors animate-slide-up">
              <div className="flex justify-between items-start mb-3">
                 <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <span className={`px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium flex items-center gap-1`}>
                      <Tag size={10} /> {post.category}
                    </span>
                    <span>•</span>
                    <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                 </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-2 hover:text-agri-600 cursor-pointer">{post.title}</h3>
              <p className="text-slate-600 text-sm mb-4 line-clamp-2">{post.content}</p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                 <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 overflow-hidden">
                       <User size={12} />
                    </div>
                    <span className="text-xs font-medium text-slate-700">{post.authorName}</span>
                 </div>
                 
                 <div className="flex items-center gap-4 text-slate-500 text-sm">
                    <button className="flex items-center gap-1 hover:text-agri-600 transition-colors">
                       <ThumbsUp size={16} /> {post.likes}
                    </button>
                    <button className="flex items-center gap-1 hover:text-agri-600 transition-colors">
                       <MessageSquare size={16} /> {post.comments} Comments
                    </button>
                 </div>
              </div>
            </div>
          ))}

          {filteredPosts.length === 0 && (
             <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
               <p className="text-slate-500">No discussions found matching your criteria.</p>
             </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">Start a Discussion</h3>
              <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} className="text-slate-500"/>
              </button>
            </div>
            
            <form onSubmit={handlePostSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
                <input 
                  type="text" 
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-agri-500"
                  placeholder="What's on your mind?"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                <select 
                  value={newPost.category}
                  onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                  className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-agri-500 bg-white"
                >
                  {postCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Content</label>
                <textarea 
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-agri-500 h-32 resize-none"
                  placeholder="Describe your question or topic..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-agri-600 text-white font-bold rounded-lg hover:bg-agri-700 transition-colors flex items-center gap-2"
                >
                  <Send size={16} /> Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
