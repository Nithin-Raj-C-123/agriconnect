
import React, { useState } from 'react';
import { Play, ExternalLink, X, BookOpen, Video as VideoIcon, Search } from 'lucide-react';

interface EducationalVideo {
  id: string;
  title: string;
  category: 'App Guide' | 'Government Schemes' | 'Farming Techniques';
  thumbnail: string;
  youtubeId: string; 
  description: string;
  duration: string;
}

const VIDEOS: EducationalVideo[] = [
  {
    id: 'v1',
    title: 'How to use AgriLink App',
    category: 'App Guide',
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop',
    youtubeId: 'dQw4w9WgXcQ', // Placeholder
    description: 'Step-by-step guide to uploading crops, managing orders, and receiving payments.',
    duration: '5:20'
  },
  {
    id: 'v2',
    title: 'PM KISAN Scheme Benefit',
    category: 'Government Schemes',
    thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1000&auto=format&fit=crop',
    youtubeId: '7_wQGj5j1jI', // Placeholder
    description: 'Complete process to apply for PM Kisan Samman Nidhi and check installment status.',
    duration: '8:45'
  },
  {
    id: 'v3',
    title: 'Organic Pesticides Guide',
    category: 'Farming Techniques',
    thumbnail: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?q=80&w=1000&auto=format&fit=crop',
    youtubeId: 'P_mQ8', // Placeholder
    description: 'Learn how to make effective organic pesticides at home using Neem and Garlic.',
    duration: '12:10'
  },
  {
    id: 'v4',
    title: 'Drip Irrigation Setup',
    category: 'Farming Techniques',
    thumbnail: 'https://images.unsplash.com/photo-1563514227149-561c2c013ca8?q=80&w=1000&auto=format&fit=crop',
    youtubeId: 'drip123', // Placeholder
    description: 'Low-cost drip irrigation installation guide for small farmers to save water.',
    duration: '15:30'
  },
  {
    id: 'v5',
    title: 'Crop Insurance Claim Process',
    category: 'App Guide',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1000&auto=format&fit=crop',
    youtubeId: 'claim123',
    description: 'How to use the AI damage scanner and submit a claim report on AgriLink.',
    duration: '4:15'
  }
];

export const KnowledgeHub: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeVideo, setActiveVideo] = useState<EducationalVideo | null>(null);

  const categories = ['All', 'App Guide', 'Government Schemes', 'Farming Techniques'];

  const filteredVideos = VIDEOS.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || v.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="text-agri-600" /> Kissan Knowledge Hub
            </h2>
            <p className="text-slate-500 mt-1">Learn best practices, government schemes, and app tutorials.</p>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search videos..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-agri-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-agri-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map(video => (
          <div key={video.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all group">
            <div className="relative h-48 cursor-pointer" onClick={() => setActiveVideo(video)}>
              <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/90 p-3 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                  <Play size={24} className="text-agri-600 ml-1" fill="currentColor" />
                </div>
              </div>
              <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-mono">
                {video.duration}
              </span>
            </div>
            
            <div className="p-5">
              <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full mb-2 inline-block ${
                video.category === 'Government Schemes' ? 'bg-orange-100 text-orange-700' :
                video.category === 'App Guide' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
              }`}>
                {video.category}
              </span>
              <h3 className="font-bold text-slate-800 text-lg mb-2 leading-tight group-hover:text-agri-700 transition-colors cursor-pointer" onClick={() => setActiveVideo(video)}>
                {video.title}
              </h3>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">{video.description}</p>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveVideo(video)}
                  className="flex-1 bg-slate-900 text-white py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Play size={14} /> Watch Now
                </button>
                <button 
                  onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(video.title)}`, '_blank')}
                  className="px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  title="Watch on YouTube"
                >
                  <VideoIcon size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">{activeVideo.title}</h3>
              <button onClick={() => setActiveVideo(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="aspect-video bg-black relative">
               {/* In a real app, integrate YouTube Embed Iframe here */}
               <iframe 
                 width="100%" 
                 height="100%" 
                 src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1`}
                 title={activeVideo.title}
                 frameBorder="0" 
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                 allowFullScreen
               ></iframe>
            </div>

            <div className="p-6 bg-slate-50 overflow-y-auto">
               <h4 className="font-bold text-slate-700 mb-2">Description</h4>
               <p className="text-slate-600 text-sm leading-relaxed">{activeVideo.description}</p>
               
               <div className="mt-6 flex gap-4">
                 <button 
                   onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(activeVideo.title)}`, '_blank')}
                   className="flex items-center gap-2 text-red-600 font-bold hover:underline text-sm"
                 >
                   <ExternalLink size={16} /> Open in YouTube
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
