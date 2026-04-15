import React from 'react';
import { CheckCircle2, Trash2, Upload } from 'lucide-react';
import { storageService } from '../../services/storageService';

interface ImageUploadProps {
  images: any[];
  setImages: (imgs: any[]) => void;
  folder: 'properties' | 'developments';
  uploading: boolean;
  setUploading: (v: boolean) => void;
}

const ImageUpload = ({ images, setImages, folder, uploading, setUploading }: ImageUploadProps) => {

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    const newImages = [...images];

    for (let i = 0; i < files.length; i++) {
      try {
        const publicUrl = await storageService.uploadFile(files[i], folder);
        newImages.push({
          url: publicUrl,
          es_portada: newImages.length === 0,
          orden: newImages.length,
          descripcion: ''
        });
      } catch (error: any) {
        console.error('Error uploading file:', error);
        alert(`Error al subir imagen: ${error.message || 'Error desconocido'}`);
      }
    }

    setImages(newImages);
    setUploading(false);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const setPortada = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      es_portada: i === index
    }));
    setImages(newImages);
  };

  return (
    <div className="space-y-6">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Multimedia</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {images.map((img, index) => (
          <div key={index} className={`relative aspect-square rounded-[1.5rem] overflow-hidden border-2 ${img.es_portada ? 'border-indigo-500' : 'border-slate-100'}`}>
            <img src={img.url} className="w-full h-full object-cover" />
            <div className="absolute top-2 right-2 flex gap-1">
              <button onClick={() => setPortada(index)} className={`p-2 rounded-lg transition-all ${img.es_portada ? 'bg-indigo-500 text-white' : 'bg-black/50 text-white hover:bg-white hover:text-indigo-500'}`}>
                <CheckCircle2 size={12} />
              </button>
              <button onClick={() => removeImage(index)} className="p-2 bg-black/50 text-white rounded-lg hover:bg-rose-500 hover:text-white transition-all">
                <Trash2 size={12} />
              </button>
            </div>
            {img.es_portada && (
              <div className="absolute bottom-0 inset-x-0 bg-indigo-500 text-white text-[8px] font-black uppercase tracking-widest py-1 text-center">Portada</div>
            )}
          </div>
        ))}
        <label className="aspect-square rounded-[1.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all group">
          {uploading ? (
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Upload size={24} className="text-slate-300 group-hover:text-indigo-500 mb-2" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Subir</span>
            </>
          )}
          <input type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      </div>
    </div>
  );
};

export default ImageUpload;
