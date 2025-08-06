import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTimeTablesById } from '../../lib/api';
import { useTranslations } from 'next-intl';
import { X, User, Calendar, BookOpen, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { useUser } from '../../context/userContext';

const DetailItem = ({ icon, label, value }) => (
  <div className="group relative overflow-hidden bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm border border-white/30 rounded-2xl p-5 hover:shadow-xl hover:shadow-emerald-600/10 transition-all duration-600 hover:scale-[1.02] hover:bg-gradient-to-br hover:from-emerald-50/80 hover:to-emerald-50/40">
    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/0 to-emerald-400/0 group-hover:from-emerald-400/5 group-hover:via-emerald-400/5 group-hover:to-emerald-400/5 transition-all duration-700"></div>
    <div className="relative flex items-start gap-x-4 rtl:gap-x-reverse">
      <div className="flex-shrink-0 p-2 rounded-xl bg-gradient-to-br from-emerald-600/10 to-emerald-600/10 text-emerald-600 group-hover:from-emerald-600/20 group-hover:to-emerald-600/20 group-hover:text-emerald-700 transition-all duration-300">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-600 mb-1 group-hover:text-gray-700 transition-colors">{label}</p>
        <p className="text-lg font-bold text-gray-900 group-hover:text-gray-950 transition-colors break-words">{value || '-'}</p>
      </div>
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center h-96 gap-y-4">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-emerald-400 rounded-full animate-ping"></div>
    </div>
    <p className="text-gray-600 font-medium animate-pulse">Loading magical details...</p>
  </div>
);

const RecitationCard = ({ rec, index, t }) => (
  <div className="group relative overflow-hidden bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-lg border border-white/40 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-700 animate-fadeIn"
       style={{ animationDelay: `${index * 150}ms` }}>
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-400/10 via-emerald-400/5 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-1000"></div>
    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-400/10 via-emerald-400/5 to-transparent rounded-full translate-y-12 -translate-x-12 group-hover:scale-150 transition-transform duration-1000"></div>
    
    <div className="relative">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-600/10 to-emerald-600/10">
          <Sparkles className="w-5 h-5 text-emerald-600" />
        </div>
        <h4 className="text-lg font-bold text-gray-800">Recitation {index + 1}</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <DetailItem icon={<Calendar size={18} />} label={t('day')} value={rec.day} />
        <DetailItem icon={<User size={18} />} label={t('teacher')} value={rec.teacher?.name || t('not_specified')} />
        <DetailItem icon={<BookOpen size={18} />} label={t('surah_from_readable')} value={rec.surah_from_readable} />
        <DetailItem icon={<BookOpen size={18} />} label={t('surah_to_readable')} value={rec.surah_to_readable} />
        <DetailItem icon={<BookOpen size={18} />} label={t('ayah_from_readable')} value={rec.ayah_from_readable} />
        <DetailItem icon={<BookOpen size={18} />} label={t('ayah_to_readable')} value={rec.ayah_to_readable} />
        <DetailItem icon={<CheckCircle size={18} />} label={t('status')} value={rec.status?.name} />
        <DetailItem icon={<BookOpen size={18} />} label={t('pages')} value={rec.pages} />
      </div>
    </div>
  </div>
);

const DetailsModal = ({ isOpen, onClose, timetableId, locale }) => {
  const t = useTranslations();
  const {user} = useUser();

  const { data: timetableData, isLoading, isError, error } = useQuery({
    queryKey: ['timetable', timetableId, locale],
    queryFn: () => fetchTimeTablesById({ id: timetableId }, locale, user?.type),
    enabled: !!isOpen && !!timetableId,
  });

  if (!isOpen) {
    return null;
  }

  const details = timetableData?.data;

  const renderRecitations = (recitations) => {
    if (!recitations || recitations.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
            <BookOpen className="w-12 h-12 text-gray-400" />
          </div>
          <p className="text-gray-600 text-lg font-medium">{t('no-data')}</p>
          <p className="text-gray-400 text-sm mt-2">No recitations found for this timetable</p>
        </div>
      );
    }
    
    return (
      <div className="gap-y-6">
        {recitations.map((rec, index) => (
          <RecitationCard key={index} rec={rec} index={index} t={t} />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-xl rounded-3xl shadow-2xl w-full h-full max-w-full max-h-full flex flex-col overflow-hidden border border-white/30 animate-slideUp">
        
        {/* Header */}
        <header className="relative overflow-hidden bg-gradient-to-r from-emerald-600/90 via-emerald-600/90 to-emerald-600/90 backdrop-blur-lg p-6 pb-12 border-b border-white/20">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-emerald-400/20 to-emerald-400/20 animate-pulse"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="md:p-3 p-2 rounded-2xl bg-white/20 backdrop-blur-sm">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h2 className="md:text-2xl text-xl font-bold text-white drop-shadow-lg">{t('timetable-details')}</h2>
            </div>
            <button 
              onClick={onClose} 
              className="md:p-3 p-2 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 hover:scale-110 transition-all duration-300 group"
            >
              <X size={22} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow overflow-y-auto bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50">
          <div className="p-8">
            {isLoading && <LoadingSpinner />}
            
            {isError && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mb-6">
                  <X className="w-12 h-12 text-red-600" />
                </div>
                <p className="text-red-600 text-xl font-bold mb-2">Oops! Something went wrong</p>
                <p className="text-red-600 text-center">{error?.message || 'Failed to load timetable details'}</p>
              </div>
            )}
            
            {details && (
              <div className="gap-y-12">
                {/* Main Details Section */}
                <section className="animate-fadeIn">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600/10 to-purple-600/10">
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{t('main-details')}</h3>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <DetailItem icon={<User size={20} />} label={t('student-name')} value={details.user?.name} />
                    <DetailItem icon={<Calendar size={20} />} label={t('date_from')} value={details.date_from} />
                    <DetailItem icon={<Calendar size={20} />} label={t('date_to')} value={details.date_to} />
                    <DetailItem icon={<CheckCircle size={20} />} label={t('type')} value={details.type} />
                    <DetailItem icon={<BookOpen size={20} />} label={t('surah_from_readable')} value={details.surah_from_readable} />
                    <DetailItem icon={<BookOpen size={20} />} label={t('surah_to_readable')} value={details.surah_to_readable} />
                    <DetailItem icon={<CheckCircle size={20} />} label={t('status')} value={details.status} />
                    <DetailItem icon={<Clock size={20} />} label={t('created_at')} value={details.created_at_humanly} />
                    <DetailItem icon={<BookOpen size={20} />} label={t('ayah_from_readable')} value={details.ayah_from_readable} />
                    <DetailItem icon={<BookOpen size={20} />} label={t('ayah_to_readable')} value={details.ayah_to_readable} />
                  </div>
                </section>

                {/* Recitations Section */}
                <section className="animate-fadeIn mt-4" style={{ animationDelay: '300ms' }}>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600/10 to-pink-600/10">
                      <Sparkles className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{t('recitations')}</h3>
                    </div>
                  </div>
                  
                  {renderRecitations(details.recitations)}
                </section>
              </div>
            )}
          </div>
        </main>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(50px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default DetailsModal;