'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { 
  FolderOpen, 
  Search, 
  Upload, 
  Check, 
  X, 
  Loader2, 
  Copy, 
  CheckCheck,
  ImageIcon
} from 'lucide-react';

export interface MediaFile {
  name: string;
  url: string;
  size: number;
  folder: string;
  modifiedAt?: string;
}

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (url: string) => void;
  title?: string;
}

export default function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  title = 'Médiathèque du Site'
}: MediaLibraryModalProps) {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUrl, setSelectedUrl] = useState<string>('');
  const [filterFolder, setFilterFolder] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/media');
      if (res.ok) {
        const data = await res.json();
        if (data.media) {
          setMedia(data.media);
        }
      }
    } catch (err) {
      console.error('Failed to load media files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('folder', filterFolder !== 'all' ? filterFolder : 'uploads');
    formData.append('name', files[0].name);

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        const uploadedUrl = data.media?.url || data.url;
        if (uploadedUrl) {
          await loadMedia();
          setSelectedUrl(uploadedUrl);
        }
      }
    } catch (err) {
      console.error('Error uploading media:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const copyToClipboard = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const filteredMedia = media.filter((item) => {
    const matchesFolder = filterFolder === 'all' || item.folder.toLowerCase() === filterFolder.toLowerCase();
    const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.url.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-navy-900 border border-navy-700 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-navy-800 flex items-center justify-between bg-navy-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-400">
              <FolderOpen size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">{title}</h3>
              <p className="text-xs text-cream-100/60">
                {media.length} fichier(s) multimédia disponibles dans le projet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Upload size={15} />
              )}
              <span>Téléverser une image</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-navy-800 text-cream-100/70 hover:text-white hover:bg-navy-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filters and search bar */}
        <div className="px-5 py-3 border-b border-navy-800 bg-navy-950/40 flex flex-wrap items-center justify-between gap-3">
          {/* Folders */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'all', label: 'Toutes les images' },
              { id: 'cars', label: 'Voitures' },
              { id: 'airlines', label: 'Compagnies' },
              { id: 'uploads', label: 'Téléchargées' },
              { id: 'root', label: 'Général' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterFolder(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterFolder === tab.id
                    ? 'bg-gold-500 text-navy-950 font-bold shadow-sm'
                    : 'bg-navy-800/80 text-cream-100/70 hover:bg-navy-800 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative min-w-[240px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-100/40" />
            <input
              type="text"
              placeholder="Rechercher par nom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-navy-800/90 border border-navy-700 text-cream-100 text-xs rounded-xl pl-9 pr-3 py-1.5 focus:border-gold-500 focus:outline-none placeholder:text-cream-100/30"
            />
          </div>
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-5 bg-navy-950/20">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-cream-100/60 gap-3">
              <Loader2 size={32} className="animate-spin text-gold-400" />
              <p className="text-sm">Chargement des médias...</p>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-cream-100/60 gap-3">
              <ImageIcon size={40} className="text-navy-700" />
              <p className="text-sm">Aucune image trouvée pour ces critères</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {filteredMedia.map((item) => {
                const isSelected = selectedUrl === item.url;
                return (
                  <div
                    key={item.url}
                    onClick={() => setSelectedUrl(item.url)}
                    className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-gold-500 ring-2 ring-gold-500/50 bg-navy-800 shadow-lg'
                        : 'border-navy-800 bg-navy-900/90 hover:border-navy-600'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-4/3 w-full bg-navy-950/60 overflow-hidden">
                      <Image
                        src={item.url}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 20vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gold-500 text-navy-950 flex items-center justify-center shadow-md">
                          <Check size={14} className="stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="p-2.5">
                      <p className="text-xs font-semibold text-cream-100 truncate" title={item.name}>
                        {item.name}
                      </p>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-cream-100/50">
                        <span className="uppercase">{item.folder}</span>
                        <span>{formatFileSize(item.size)}</span>
                      </div>
                    </div>

                    {/* Hover copy button */}
                    <button
                      type="button"
                      onClick={(e) => copyToClipboard(item.url, e)}
                      title="Copier l'URL"
                      className="absolute bottom-10 right-2 p-1.5 rounded-lg bg-navy-950/90 text-gold-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gold-500 hover:text-navy-950 border border-navy-700"
                    >
                      {copiedUrl === item.url ? <CheckCheck size={13} /> : <Copy size={13} />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-navy-800 bg-navy-950 flex items-center justify-between gap-4">
          <div className="text-xs text-cream-100/70 truncate">
            {selectedUrl ? (
              <span className="font-mono text-gold-400 truncate">Sélectionné : {selectedUrl}</span>
            ) : (
              <span>Cliquez sur une image pour la sélectionner</span>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-cream-100/80 hover:bg-navy-800 hover:text-white transition-colors"
            >
              Annuler
            </button>
            {onSelect && (
              <button
                type="button"
                disabled={!selectedUrl}
                onClick={() => {
                  if (selectedUrl) {
                    onSelect(selectedUrl);
                    onClose();
                  }
                }}
                className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Utiliser cette image
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
