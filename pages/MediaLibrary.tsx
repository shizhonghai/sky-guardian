import React from 'react';
import { ArrowLeft, PlayCircle, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MediaLibrary: React.FC = () => {
  const navigate = useNavigate();
  // Mock Media Data
  const media = Array.from({length: 12}).map((_, i) => ({
      id: i,
      type: i % 3 === 0 ? 'VIDEO' : 'IMAGE',
      url: `https://picsum.photos/300/300?random=${i + 20}`,
      date: '2023-10-27'
  }));

  return (
    <div className="flex flex-col h-full bg-slate-900 pb-20">
       <div className="p-4 bg-slate-950 sticky top-0 z-10 flex items-center gap-3">
           <button onClick={() => navigate(-1)} className="p-1 text-slate-400"><ArrowLeft /></button>
           <h1 className="text-xl font-bold text-white">回放图库</h1>
       </div>

       <div className="grid grid-cols-3 gap-1 p-1 overflow-y-auto">
         {media.map(item => (
           <div key={item.id} className="aspect-square relative group bg-gray-800">
             <img src={item.url} className="w-full h-full object-cover" alt="" />
             <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               {item.type === 'VIDEO' ? <PlayCircle className="text-white" /> : <Image className="text-white" />}
             </div>
             {item.type === 'VIDEO' && <div className="absolute top-1 right-1"><PlayCircle size={14} className="text-white drop-shadow-md" fill="rgba(0,0,0,0.5)" /></div>}
           </div>
         ))}
       </div>
    </div>
  );
};

export default MediaLibrary;