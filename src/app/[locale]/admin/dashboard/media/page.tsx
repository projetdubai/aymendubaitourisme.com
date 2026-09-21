'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { 
  FolderOpen, 
  Search, 
  Upload, 
  Copy, 
  CheckCheck, 
  ExternalLink, 
  RefreshCw, 
  Loader2, 
  ImageIcon,
  HardDrive,
  CheckCircle2,
  X,
  Eye,
  Edit2,
  Trash2,
  Plus,
  Link2,
  AlertTriangle,
  CheckSquare,
  Square,
  Sparkles
} from 'lucide-react';
import { MediaFile } from '@/app/api/admin/media/route';

// Bilingual translations dictionary
const DICT = {
  ar: {
    pageTitle: 'مكتبة الوسائط والصور',
    pageSubtitle: 'إدارة كاملة لجميع صور الموقع (السيارات، الشعارات، الفنادق، التأشيرات، صور الخلفية). يمكنك الإضافة، التعديل أو الحذف المباشر بسهولة.',
    refresh: 'تحديث',
    addImage: 'رفع صور من الجهاز',
    addByUrl: 'إضافة عبر رابط URL',
    totalImages: 'إجمالي الصور',
    carPhotos: 'أسطول السيارات',
    airlineLogos: 'شركات الطيران',
    totalSize: 'الحجم الإجمالي',
    allFolders: 'جميع الصور',
    carsFolder: 'السيارات',
    airlinesFolder: 'الطيران',
    servicesFolder: 'الخدمات والتأشيرات',
    uploadsFolder: 'الصور المرفوعة',
    generalFolder: 'الرئيسية والمؤسس',
    searchPlaceholder: 'بحث بالاسم أو الرابط...',
    loading: 'جاري تحميل مكتبة الصور...',
    empty: 'لم يتم العثور على أي ملفات وسائط.',
    copyUrl: 'نسخ الرابط',
    copied: 'تم النسخ!',
    preview: 'معاينة',
    edit: 'تعديل',
    delete: 'حذف',
    batchDelete: 'حذف المحدد',
    selectAll: 'تحديد الكل',
    selectedCount: (n: number) => `تم تحديد ${n} عنصر`,
    cancel: 'إلغاء',
    save: 'حفظ التعديلات',
    saving: 'جاري الحفظ...',
    confirmDeleteTitle: 'تأكيد حذف الصورة',
    confirmDeleteMsg: 'هل أنت متأكد من رغبتك في حذف هذه الصورة من الموقع؟ لن تظهر مجدداً في مكتبة الوسائط.',
    confirmBatchDeleteTitle: 'تأكيد الحذف المتعدد',
    confirmBatchDeleteMsg: (n: number) => `هل أنت متأكد من رغبتك في حذف ${n} صورة نهائياً؟`,
    deleteForever: 'حذف نهائي',
    deleting: 'جاري الحذف...',
    editModalTitle: 'تعديل بيانات الصورة',
    fileName: 'اسم الملف / العنوان',
    folderCategory: 'المجلد / التصنيف',
    altText: 'النص البديل (SEO)',
    replaceImage: 'استبدال الصورة الحالية (اختياري)',
    replacePlaceholder: 'رابط جديد للصورة https://...',
    addModalTitle: 'إضافة صورة جديدة عبر رابط',
    imageUrl: 'رابط الصورة المباشر (URL)',
    imageUrlPlaceholder: 'https://images.unsplash.com/... أو أي رابط مباشر',
    imagePreview: 'معاينة الصورة',
    sizeLabel: 'الحجم',
    dateLabel: 'تاريخ الإضافة',
    toastUploadSuccess: 'تم رفع الصورة بنجاح!',
    toastAddSuccess: 'تمت إضافة الصورة بنجاح!',
    toastEditSuccess: 'تم تحديث بيانات الصورة بنجاح!',
    toastDeleteSuccess: 'تم حذف الصورة بنجاح!',
    toastBatchDeleteSuccess: (n: number) => `تم حذف ${n} صورة بنجاح!`,
  },
  fr: {
    pageTitle: 'Médiathèque Globale',
    pageSubtitle: 'Gestion complète de toutes les images du site (voitures, logos, services, fondateurs). Ajoutez, modifiez ou supprimez n\'importe quelle image en direct.',
    refresh: 'Actualiser',
    addImage: 'Téléverser des photos',
    addByUrl: 'Ajouter par lien URL',
    totalImages: 'Total Images',
    carPhotos: 'Photos Voitures',
    airlineLogos: 'Logos Compagnies',
    totalSize: 'Poids Total',
    allFolders: 'Toutes les photos',
    carsFolder: 'Flotte Véhicules',
    airlinesFolder: 'Compagnies Aériennes',
    servicesFolder: 'Services & Visas',
    uploadsFolder: 'Téléversées',
    generalFolder: 'Racine / Fondateur',
    searchPlaceholder: 'Rechercher par nom ou lien...',
    loading: 'Chargement de la médiathèque...',
    empty: 'Aucun fichier média trouvé.',
    copyUrl: 'Copier URL',
    copied: 'Copié !',
    preview: 'Aperçu',
    edit: 'Modifier',
    delete: 'Supprimer',
    batchDelete: 'Supprimer la sélection',
    selectAll: 'Tout sélectionner',
    selectedCount: (n: number) => `${n} élément(s) sélectionné(s)`,
    cancel: 'Annuler',
    save: 'Enregistrer',
    saving: 'Enregistrement...',
    confirmDeleteTitle: 'Confirmer la suppression',
    confirmDeleteMsg: 'Êtes-vous sûr de vouloir supprimer cette image ? Elle ne sera plus disponible dans la médiathèque.',
    confirmBatchDeleteTitle: 'Suppression groupée',
    confirmBatchDeleteMsg: (n: number) => `Êtes-vous sûr de vouloir supprimer définitivement ces ${n} images ?`,
    deleteForever: 'Supprimer définitivement',
    deleting: 'Suppression...',
    editModalTitle: 'Modifier l\'image',
    fileName: 'Nom du fichier / Titre',
    folderCategory: 'Dossier / Catégorie',
    altText: 'Texte alternatif (SEO)',
    replaceImage: 'Remplacer l\'image (optionnel)',
    replacePlaceholder: 'Nouveau lien URL https://...',
    addModalTitle: 'Ajouter une image via URL',
    imageUrl: 'Lien direct de l\'image (URL)',
    imageUrlPlaceholder: 'https://images.unsplash.com/... ou lien externe',
    imagePreview: 'Aperçu de l\'image',
    sizeLabel: 'Taille',
    dateLabel: 'Date',
    toastUploadSuccess: 'Image téléversée avec succès !',
    toastAddSuccess: 'Image ajoutée avec succès !',
    toastEditSuccess: 'Image modifiée avec succès !',
    toastDeleteSuccess: 'Image supprimée avec succès !',
    toastBatchDeleteSuccess: (n: number) => `${n} images supprimées avec succès !`,
  },
  en: {
    pageTitle: 'Media Library',
    pageSubtitle: 'Manage all website media (cars, logos, services, founders). Add, edit, or delete any image in real time.',
    refresh: 'Refresh',
    addImage: 'Upload photos',
    addByUrl: 'Add via URL',
    totalImages: 'Total Images',
    carPhotos: 'Car Fleet',
    airlineLogos: 'Airlines',
    totalSize: 'Total Size',
    allFolders: 'All Photos',
    carsFolder: 'Cars',
    airlinesFolder: 'Airlines',
    servicesFolder: 'Services & Visas',
    uploadsFolder: 'Uploads',
    generalFolder: 'General & Founder',
    searchPlaceholder: 'Search by name or URL...',
    loading: 'Loading media library...',
    empty: 'No media files found.',
    copyUrl: 'Copy URL',
    copied: 'Copied!',
    preview: 'Preview',
    edit: 'Edit',
    delete: 'Delete',
    batchDelete: 'Delete Selected',
    selectAll: 'Select All',
    selectedCount: (n: number) => `${n} item(s) selected`,
    cancel: 'Cancel',
    save: 'Save Changes',
    saving: 'Saving...',
    confirmDeleteTitle: 'Confirm Deletion',
    confirmDeleteMsg: 'Are you sure you want to delete this image? It will be removed from the media library.',
    confirmBatchDeleteTitle: 'Batch Deletion',
    confirmBatchDeleteMsg: (n: number) => `Are you sure you want to delete ${n} images permanently?`,
    deleteForever: 'Delete permanently',
    deleting: 'Deleting...',
    editModalTitle: 'Edit Media',
    fileName: 'File Name / Title',
    folderCategory: 'Folder / Category',
    altText: 'Alt Text (SEO)',
    replaceImage: 'Replace image (optional)',
    replacePlaceholder: 'New image URL https://...',
    addModalTitle: 'Add Image via URL',
    imageUrl: 'Direct image URL',
    imageUrlPlaceholder: 'https://images.unsplash.com/... or CDN link',
    imagePreview: 'Image Preview',
    sizeLabel: 'Size',
    dateLabel: 'Date',
    toastUploadSuccess: 'Image uploaded successfully!',
    toastAddSuccess: 'Image added successfully!',
    toastEditSuccess: 'Image updated successfully!',
    toastDeleteSuccess: 'Image deleted successfully!',
    toastBatchDeleteSuccess: (n: number) => `${n} images deleted successfully!`,
  }
};

export default function MediaLibraryPage() {
  const params = useParams();
  const currentLocale = ((params?.locale as string) || 'ar') as 'ar' | 'fr' | 'en';
  const isAr = currentLocale === 'ar';
  const t = DICT[currentLocale] || DICT.ar;

  // Media state
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterFolder, setFilterFolder] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selection state (batch actions)
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

  // Modals state
  const [previewImage, setPreviewImage] = useState<MediaFile | null>(null);
  const [editingMedia, setEditingMedia] = useState<MediaFile | null>(null);
  const [deletingMedia, setDeletingMedia] = useState<MediaFile | null>(null);
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);
  const [isAddByUrlOpen, setIsAddByUrlOpen] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    folder: 'general',
    title: '',
    alt: '',
    newUrl: '',
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Add by URL form state
  const [addUrlForm, setAddUrlForm] = useState({
    url: '',
    name: '',
    folder: 'uploads',
    alt: '',
  });
  const [isAddingUrl, setIsAddingUrl] = useState(false);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch all media
  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/media');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.media)) {
          setMedia(data.media);
        }
      }
    } catch (err) {
      console.error('Error fetching media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // Multi-file upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', filterFolder !== 'all' ? filterFolder : 'uploads');
      formData.append('name', file.name);

      try {
        const res = await fetch('/api/admin/media', {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          successCount++;
        }
      } catch (err) {
        console.error('Upload error for file:', file.name, err);
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (successCount > 0) {
      showToast(successCount === 1 ? t.toastUploadSuccess : `${successCount} images téléversées avec succès !`);
      await fetchMedia();
    } else {
      alert('Erreur lors du téléversement.');
    }
  };

  // Add by direct URL handler
  const handleAddByUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addUrlForm.url.trim()) return;

    setIsAddingUrl(true);
    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addUrlForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(t.toastAddSuccess);
        setIsAddByUrlOpen(false);
        setAddUrlForm({ url: '', name: '', folder: 'uploads', alt: '' });
        await fetchMedia();
      } else {
        alert(data.error || 'Erreur lors de l\'ajout de l\'image.');
      }
    } catch (err) {
      console.error('Add by URL error:', err);
      alert('Erreur réseau.');
    } finally {
      setIsAddingUrl(false);
    }
  };

  // Open Edit modal
  const handleOpenEdit = (item: MediaFile) => {
    setEditingMedia(item);
    setEditForm({
      name: item.name || '',
      folder: item.folder || 'general',
      title: item.title || item.name || '',
      alt: item.alt || '',
      newUrl: '',
    });
  };

  // Save Edit handler
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedia) return;

    setIsSavingEdit(true);
    try {
      const res = await fetch('/api/admin/media', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingMedia.id,
          url: editingMedia.url,
          name: editForm.name,
          folder: editForm.folder,
          title: editForm.title,
          alt: editForm.alt,
          newUrl: editForm.newUrl ? editForm.newUrl.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(t.toastEditSuccess);
        setEditingMedia(null);
        await fetchMedia();
      } else {
        alert(data.error || 'Erreur lors de la modification.');
      }
    } catch (err) {
      console.error('Save edit error:', err);
      alert('Erreur réseau.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Single Delete handler
  const handleConfirmDelete = async () => {
    if (!deletingMedia) return;

    try {
      const res = await fetch(`/api/admin/media?url=${encodeURIComponent(deletingMedia.url)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(t.toastDeleteSuccess);
        setSelectedUrls((prev) => prev.filter((u) => u !== deletingMedia.url));
        setDeletingMedia(null);
        await fetchMedia();
      } else {
        alert(data.error || 'Erreur lors de la suppression.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Erreur réseau.');
    }
  };

  // Batch Delete handler
  const handleConfirmBatchDelete = async () => {
    if (selectedUrls.length === 0) return;

    try {
      const res = await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: selectedUrls }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(t.toastBatchDeleteSuccess(selectedUrls.length));
        setSelectedUrls([]);
        setIsBatchDeleting(false);
        await fetchMedia();
      } else {
        alert(data.error || 'Erreur lors de la suppression groupée.');
      }
    } catch (err) {
      console.error('Batch delete error:', err);
      alert('Erreur réseau.');
    }
  };

  // Selection toggle
  const toggleSelect = (url: string) => {
    setSelectedUrls((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  // Copy to clipboard
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    showToast(`${t.copied} : ${url}`);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  // Filtered media list
  const filteredMedia = media.filter((item) => {
    const matchesFolder =
      filterFolder === 'all' ||
      item.folder.toLowerCase() === filterFolder.toLowerCase() ||
      (filterFolder === 'general' && (item.folder === '/' || item.folder === ''));

    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.url.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFolder && matchesSearch;
  });

  const allFilteredSelected =
    filteredMedia.length > 0 &&
    filteredMedia.every((item) => selectedUrls.includes(item.url));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      const filteredUrlSet = new Set(filteredMedia.map((m) => m.url));
      setSelectedUrls((prev) => prev.filter((u) => !filteredUrlSet.has(u)));
    } else {
      const combined = Array.from(new Set([...selectedUrls, ...filteredMedia.map((m) => m.url)]));
      setSelectedUrls(combined);
    }
  };

  const totalBytes = media.reduce((acc, curr) => acc + (curr.size || 0), 0);
  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes <= 0) return 'Web / Cloud';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`space-y-6 max-w-7xl pb-16 ${isAr ? 'rtl font-sans' : 'ltr'}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 z-50 p-4 bg-emerald-600 text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500 animate-in fade-in slide-in-from-bottom-5 right-6">
          <CheckCircle2 size={22} className="shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Main Top Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gold-500/10 rounded-xl text-gold-600">
              <FolderOpen size={26} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-navy-900 flex items-center gap-2">
                <span>{t.pageTitle}</span>
                <span className="text-xs bg-gold-500/10 text-gold-600 px-2.5 py-0.5 rounded-full font-bold">
                  Pro CMS
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-3xl">
                {t.pageSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchMedia}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
            title={t.refresh}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>{t.refresh}</span>
          </button>

          {/* Add via direct URL */}
          <button
            onClick={() => setIsAddByUrlOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-navy-900 hover:bg-navy-800 text-gold-400 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Link2 size={14} />
            <span>{t.addByUrl}</span>
          </button>

          {/* Upload files */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            multiple
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            <span>{uploading ? 'Envoi...' : t.addImage}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
          <p className="text-xs text-gray-500 font-medium">{t.totalImages}</p>
          <p className="text-2xl font-bold text-navy-900 mt-1">{media.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
          <p className="text-xs text-gray-500 font-medium">{t.carPhotos}</p>
          <p className="text-2xl font-bold text-navy-900 mt-1">
            {media.filter((m) => m.folder === 'cars').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
          <p className="text-xs text-gray-500 font-medium">{t.airlineLogos}</p>
          <p className="text-2xl font-bold text-navy-900 mt-1">
            {media.filter((m) => m.folder === 'airlines').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">{t.totalSize}</p>
            <p className="text-2xl font-bold text-gold-600 mt-1">{formatFileSize(totalBytes)}</p>
          </div>
          <HardDrive size={24} className="text-gray-300" />
        </div>
      </div>

      {/* Batch Action Toolbar (When images selected) */}
      {selectedUrls.length > 0 && (
        <div className="bg-navy-900 text-white p-3.5 rounded-2xl shadow-xl border border-gold-500/40 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-3">
            <span className="bg-gold-500 text-navy-900 font-bold text-xs px-2.5 py-1 rounded-lg">
              {t.selectedCount(selectedUrls.length)}
            </span>
            <button
              onClick={() => setSelectedUrls([])}
              className="text-xs text-gray-300 hover:text-white underline cursor-pointer"
            >
              {t.cancel}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBatchDeleting(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Trash2 size={14} />
              <span>{t.batchDelete}</span>
            </button>
          </div>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Folder tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: t.allFolders },
            { id: 'cars', label: t.carsFolder },
            { id: 'airlines', label: t.airlinesFolder },
            { id: 'services', label: t.servicesFolder },
            { id: 'uploads', label: t.uploadsFolder },
            { id: 'general', label: t.generalFolder },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterFolder(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterFolder === tab.id
                  ? 'bg-navy-900 text-gold-400 shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Select All */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-gray-50 border border-gray-200 text-navy-900 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            title={t.selectAll}
          >
            {allFilteredSelected ? (
              <CheckSquare size={16} className="text-gold-500" />
            ) : (
              <Square size={16} className="text-gray-400" />
            )}
            <span className="hidden sm:inline">{t.selectAll}</span>
          </button>

          <div className="relative flex-1 sm:min-w-[260px]">
            <Search size={15} className={`absolute ${isAr ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-gray-400`} />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-gray-50 border border-gray-200 text-navy-900 text-xs rounded-xl ${
                isAr ? 'pr-9 pl-3.5' : 'pl-9 pr-3.5'
              } py-2 focus:border-gold-500 focus:outline-none placeholder:text-gray-400`}
            />
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-gray-500 gap-3">
            <Loader2 size={32} className="animate-spin text-gold-500" />
            <p className="text-sm font-medium">{t.loading}</p>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-2">
            <ImageIcon size={44} className="opacity-40" />
            <p className="text-sm font-medium">{t.empty}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredMedia.map((file) => {
              const isSelected = selectedUrls.includes(file.url);

              return (
                <div
                  key={file.url}
                  className={`group relative bg-gray-50 rounded-2xl overflow-hidden border transition-all flex flex-col ${
                    isSelected
                      ? 'border-gold-500 shadow-md ring-2 ring-gold-500/30'
                      : 'border-gray-200/80 hover:border-gold-500/50 hover:shadow-md'
                  }`}
                >
                  {/* Selection Checkbox (Top Left) */}
                  <div className="absolute top-2.5 start-2.5 z-20">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(file.url);
                      }}
                      className={`p-1.5 rounded-lg backdrop-blur-md transition-all ${
                        isSelected
                          ? 'bg-gold-500 text-navy-950 shadow-md'
                          : 'bg-black/40 text-white/80 hover:bg-black/60 opacity-0 group-hover:opacity-100'
                      }`}
                      title={isSelected ? 'Désélectionner' : 'Sélectionner'}
                    >
                      {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                  </div>

                  {/* Image Container with Hover Actions */}
                  <div
                    className="relative aspect-4/3 w-full bg-navy-950/5 overflow-hidden cursor-pointer"
                    onClick={() => setPreviewImage(file)}
                  >
                    <Image
                      src={file.url}
                      alt={file.alt || file.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 20vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Quick action buttons overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewImage(file);
                        }}
                        className="p-2 rounded-xl bg-white/95 text-navy-900 hover:bg-gold-500 hover:text-white shadow transition-colors"
                        title={t.preview}
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(file);
                        }}
                        className="p-2 rounded-xl bg-white/95 text-navy-900 hover:bg-gold-500 hover:text-white shadow transition-colors"
                        title={t.edit}
                      >
                        <Edit2 size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingMedia(file);
                        }}
                        className="p-2 rounded-xl bg-white/95 text-red-600 hover:bg-red-600 hover:text-white shadow transition-colors"
                        title={t.delete}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-bold text-navy-900 truncate" title={file.title || file.name}>
                        {file.title || file.name}
                      </p>
                      <div className="flex items-center justify-between mt-1 text-[11px] text-gray-500">
                        <span className="uppercase font-mono font-semibold bg-gray-200/60 px-1.5 py-0.5 rounded text-[10px]">
                          {file.folder}
                        </span>
                        <span>{formatFileSize(file.size)}</span>
                      </div>
                    </div>

                    {/* Card Actions Bottom Bar */}
                    <div className="pt-2.5 mt-2.5 border-t border-gray-200/60 flex items-center justify-between gap-1.5">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(file.url)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-navy-900 hover:bg-gold-500 hover:text-navy-950 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                        title={t.copyUrl}
                      >
                        {copiedUrl === file.url ? <CheckCheck size={13} /> : <Copy size={13} />}
                        <span>{copiedUrl === file.url ? t.copied : t.copyUrl}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(file)}
                        className="p-1.5 text-gray-500 hover:text-gold-600 hover:bg-gold-50 rounded-lg transition-colors cursor-pointer"
                        title={t.edit}
                      >
                        <Edit2 size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingMedia(file)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title={t.delete}
                      >
                        <Trash2 size={14} />
                      </button>

                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-gray-400 hover:text-navy-900 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Open full resolution"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT MEDIA (MODIFIER)                                            */}
      {/* ========================================================================= */}
      {editingMedia && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-navy-900 text-white">
              <div className="flex items-center gap-2">
                <Edit2 size={18} className="text-gold-400" />
                <h3 className="font-bold text-sm sm:text-base">{t.editModalTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingMedia(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              {/* Thumbnail preview */}
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="relative w-20 h-16 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                  <Image
                    src={editForm.newUrl || editingMedia.url}
                    alt={editForm.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="truncate flex-1">
                  <p className="text-xs font-bold text-navy-900 truncate">{editingMedia.name}</p>
                  <p className="text-[11px] text-gray-500 font-mono truncate">{editingMedia.url}</p>
                </div>
              </div>

              {/* Name field */}
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">{t.fileName}</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              {/* Folder / Category dropdown */}
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">{t.folderCategory}</label>
                <select
                  value={editForm.folder}
                  onChange={(e) => setEditForm({ ...editForm, folder: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none"
                >
                  <option value="cars">{t.carsFolder} (cars)</option>
                  <option value="airlines">{t.airlinesFolder} (airlines)</option>
                  <option value="services">{t.servicesFolder} (services)</option>
                  <option value="uploads">{t.uploadsFolder} (uploads)</option>
                  <option value="general">{t.generalFolder} (general)</option>
                </select>
              </div>

              {/* Alt Text (SEO) */}
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">{t.altText}</label>
                <input
                  type="text"
                  placeholder="Ex: Rolls Royce Ghost Luxury Rental Dubai"
                  value={editForm.alt}
                  onChange={(e) => setEditForm({ ...editForm, alt: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              {/* Replace Image URL */}
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">{t.replaceImage}</label>
                <input
                  type="text"
                  placeholder={t.replacePlaceholder}
                  value={editForm.newUrl}
                  onChange={(e) => setEditForm({ ...editForm, newUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none font-mono"
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingMedia(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-gold-500 hover:bg-gold-400 text-navy-950 rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSavingEdit ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>{isSavingEdit ? t.saving : t.save}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD VIA DIRECT URL                                               */}
      {/* ========================================================================= */}
      {isAddByUrlOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-navy-900 text-white">
              <div className="flex items-center gap-2">
                <Link2 size={18} className="text-gold-400" />
                <h3 className="font-bold text-sm sm:text-base">{t.addModalTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddByUrlOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddByUrl} className="p-6 space-y-4">
              {/* URL field */}
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">{t.imageUrl} *</label>
                <input
                  type="url"
                  required
                  placeholder={t.imageUrlPlaceholder}
                  value={addUrlForm.url}
                  onChange={(e) => setAddUrlForm({ ...addUrlForm, url: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none font-mono"
                />
              </div>

              {/* Name field */}
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">{t.fileName}</label>
                <input
                  type="text"
                  placeholder="Ex: Mercedes G63 AMG"
                  value={addUrlForm.name}
                  onChange={(e) => setAddUrlForm({ ...addUrlForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              {/* Folder dropdown */}
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">{t.folderCategory}</label>
                <select
                  value={addUrlForm.folder}
                  onChange={(e) => setAddUrlForm({ ...addUrlForm, folder: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none"
                >
                  <option value="cars">{t.carsFolder} (cars)</option>
                  <option value="airlines">{t.airlinesFolder} (airlines)</option>
                  <option value="services">{t.servicesFolder} (services)</option>
                  <option value="uploads">{t.uploadsFolder} (uploads)</option>
                  <option value="general">{t.generalFolder} (general)</option>
                </select>
              </div>

              {/* Image Preview if URL typed */}
              {addUrlForm.url && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
                  <div className="relative w-20 h-16 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                    <img
                      src={addUrlForm.url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 truncate">{t.imagePreview}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddByUrlOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isAddingUrl || !addUrlForm.url}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-gold-500 hover:bg-gold-400 text-navy-950 rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isAddingUrl ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  <span>{isAddingUrl ? t.saving : t.save}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CONFIRM SINGLE DELETE                                            */}
      {/* ========================================================================= */}
      {deletingMedia && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 bg-red-100 rounded-xl">
                <AlertTriangle size={24} />
              </div>
              <h3 className="font-bold text-base text-navy-900">{t.confirmDeleteTitle}</h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              {t.confirmDeleteMsg}
            </p>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                <Image
                  src={deletingMedia.url}
                  alt={deletingMedia.name}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-xs font-bold text-navy-900 truncate">{deletingMedia.name}</p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingMedia(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
                <span>{t.deleteForever}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CONFIRM BATCH DELETE                                             */}
      {/* ========================================================================= */}
      {isBatchDeleting && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 bg-red-100 rounded-xl">
                <AlertTriangle size={24} />
              </div>
              <h3 className="font-bold text-base text-navy-900">{t.confirmBatchDeleteTitle}</h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              {t.confirmBatchDeleteMsg(selectedUrls.length)}
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsBatchDeleting(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmBatchDelete}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
                <span>{t.deleteForever}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: FULL-SIZE PREVIEW LIGHTBOX                                       */}
      {/* ========================================================================= */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="bg-navy-950 border border-navy-800 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-navy-800 flex items-center justify-between text-white">
              <div className="truncate pr-4">
                <h4 className="text-sm font-bold truncate">{previewImage.title || previewImage.name}</h4>
                <p className="text-xs text-gold-400 font-mono truncate">{previewImage.url}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-navy-900 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative aspect-16/10 w-full bg-navy-900 flex items-center justify-center">
              <Image
                src={previewImage.url}
                alt={previewImage.alt || previewImage.name}
                fill
                className="object-contain"
              />
            </div>

            <div className="p-4 bg-navy-900 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-300">
              <div className="flex items-center gap-4">
                <span>{t.sizeLabel} : {formatFileSize(previewImage.size)}</span>
                <span className="uppercase font-mono font-semibold bg-navy-800 px-2 py-0.5 rounded text-[11px] text-gold-400">
                  {previewImage.folder}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenEdit(previewImage);
                    setPreviewImage(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-800 hover:bg-navy-700 text-white rounded-lg cursor-pointer"
                >
                  <Edit2 size={13} />
                  <span>{t.edit}</span>
                </button>

                <button
                  type="button"
                  onClick={() => copyToClipboard(previewImage.url)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gold-500 text-navy-950 font-bold rounded-lg hover:bg-gold-400 cursor-pointer"
                >
                  <Copy size={13} />
                  <span>{t.copyUrl}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
