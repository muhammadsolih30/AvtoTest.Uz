
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getQuestions, saveQuestion, deleteQuestion, deleteAllQuestions } from '../../services/db';
import { Question } from '../../types';
import { Trash2, Edit, ArrowLeft, Save, Plus, Search, ImageIcon } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { VirtualScroll } from '../../components/VirtualScroll';
import ConfirmModal from '../../components/ConfirmModal';

export const QuestionList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useUI();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState('');
  
  // Confirmation States
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteAll, setIsDeleteAll] = useState(false);

  useEffect(() => {
    setQuestions(getQuestions());
  }, []);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteQuestion(deleteId);
      setQuestions(prev => prev.filter(q => q.id !== deleteId));
      setDeleteId(null);
    }
  };

  const handleDeleteAllClick = () => {
    setIsDeleteAll(true);
  };

  const handleConfirmDeleteAll = () => {
    deleteAllQuestions();
    setQuestions([]);
    setIsDeleteAll(false);
  };

  const filtered = useMemo(() => {
    return questions.filter(q => q.questionText.toLowerCase().includes(search.toLowerCase()));
  }, [questions, search]);

  const renderRow = (q: Question) => (
    <div className="p-2 h-full">
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex gap-4 transition-colors h-full items-center shadow-sm hover:shadow-md">
            {q.image ? (
                <img src={q.image} alt="" className="w-16 h-16 object-cover rounded-lg bg-slate-100 dark:bg-slate-700 flex-shrink-0" />
            ) : (
                <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <ImageIcon size={20} />
                </div>
            )}
            <div className="flex-1 overflow-hidden min-w-0">
              <p className="font-medium text-slate-800 dark:text-white line-clamp-2 mb-1 text-sm">{q.questionText}</p>
              <div className="flex gap-2">
                  <span className="text-[10px] px-2 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded border border-green-100 dark:border-green-900">
                  {t('q_answer')}: {q.correctAnswer}
                  </span>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button 
                  onClick={() => navigate(`/admin/questions/${q.id}`)}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title={t('q_edit')}
              >
                  <Edit size={18} />
              </button>
              <button 
                  onClick={(e) => handleDeleteClick(e, q.id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="O'chirish"
              >
                  <Trash2 size={18} />
              </button>
            </div>
        </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 h-screen flex flex-col pb-4 box-border">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 flex-shrink-0">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button onClick={() => navigate('/admin')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-slate-300"><ArrowLeft /></button>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('q_list_title')}</h1>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={handleDeleteAllClick}
              className="flex-1 sm:flex-none bg-red-100 text-red-600 px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold hover:bg-red-200 transition-all"
            >
              <Trash2 size={16} /> Tozalash
            </button>
            <button 
              onClick={() => navigate('/admin/questions/new')}
              className="flex-1 sm:flex-none bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all"
            >
              <Plus size={16} /> {t('q_new')}
            </button>
        </div>
      </div>

      <div className="relative mb-6 flex-shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder={t('q_search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white shadow-sm"
        />
      </div>

      <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden relative">
          {filtered.length > 0 ? (
              <VirtualScroll 
                items={filtered} 
                height={600} // Approximate height
                rowHeight={104} // 80px height + padding
                renderRow={renderRow} 
                className="h-full"
              />
          ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                  Savollar topilmadi
              </div>
          )}
      </div>
      <div className="text-center text-xs text-slate-400 mt-2">
         Jami: {filtered.length} ta savol
      </div>

      {/* Delete Single Question Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Savolni o'chirish"
        message="Siz rostdan ham ushbu savolni o'chirib tashlamoqchimisiz?"
      />

      {/* Delete All Questions Modal */}
      <ConfirmModal
        isOpen={isDeleteAll}
        onClose={() => setIsDeleteAll(false)}
        onConfirm={handleConfirmDeleteAll}
        title="Barchasini tozalash"
        message="DIQQAT! Barcha savollar o'chiriladi. Bu amalni ortga qaytarib bo'lmaydi."
      />
    </div>
  );
};

export const QuestionForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useUI();
  const isEdit = id && id !== 'new';

  const [formData, setFormData] = useState<Question>({
    id: '',
    questionText: '',
    options: { A: '', B: '', C: '', D: '' },
    correctAnswer: 'A',
    image: ''
  });

  useEffect(() => {
    if (isEdit) {
      const all = getQuestions();
      const found = all.find(q => q.id === id);
      if (found) setFormData(found);
    }
  }, [id, isEdit]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      id: isEdit ? formData.id : Date.now().toString()
    };
    saveQuestion(payload);
    navigate('/admin/questions');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
          alert("Rasm hajmi juda katta!");
          return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;
              const MAX_WIDTH = 800;
              if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, width, height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
              setFormData(prev => ({ ...prev, image: dataUrl }));
          };
          img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/questions')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-slate-300"><ArrowLeft /></button>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{isEdit ? t('q_form_edit') : t('q_form_new')}</h1>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6 transition-colors">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('q_form_img')}</label>
          <div className="flex items-center gap-4">
            {formData.image ? (
                <div className="relative">
                    <img src={formData.image} alt="Preview" className="w-24 h-24 object-cover rounded-lg border dark:border-slate-600" />
                    <button type="button" onClick={() => setFormData(p => ({...p, image: ''}))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600">
                        <Trash2 size={12} />
                    </button>
                </div>
            ) : (
                <div className="w-24 h-24 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-600">
                    <ImageIcon className="text-slate-400" />
                </div>
            )}
            <label className="cursor-pointer bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                Rasm Tanlash
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('q_form_text')}</label>
          <textarea
            required
            rows={3}
            value={formData.questionText}
            onChange={e => setFormData({...formData, questionText: e.target.value})}
            className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('q_form_opts')}</label>
          {(['A', 'B', 'C', 'D'] as const).map(opt => (
            <div key={opt} className="flex gap-3 items-center">
              <span className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded font-bold text-slate-500 dark:text-slate-300">{opt}</span>
              <input
                required
                type="text"
                placeholder={`${opt} varianti`}
                value={formData.options[opt]}
                onChange={e => setFormData({
                  ...formData, 
                  options: { ...formData.options, [opt]: e.target.value }
                })}
                className="flex-1 p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('q_form_correct')}</label>
          <select
            value={formData.correctAnswer}
            onChange={e => setFormData({...formData, correctAnswer: e.target.value as any})}
            className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg outline-none"
          >
            <option value="A">Variant A</option>
            <option value="B">Variant B</option>
            <option value="C">Variant C</option>
            <option value="D">Variant D</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all flex justify-center gap-2"
        >
          <Save size={20} /> {t('q_form_save')}
        </button>
      </form>
    </div>
  );
};
