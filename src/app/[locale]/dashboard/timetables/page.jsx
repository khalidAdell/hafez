"use client";
import React, { useEffect, useState, useMemo } from 'react';
import DashboardHeader from '../../../../components/dashboard/DashboardHeader';
import DashboardTable from '../../../../components/dashboard/DashboardTable';
import DetailsModal from '../../../../components/modals/DetailsModal';
import CustomActions from '../../../../components/modals/CustomActions';
import { fetchMosques, fetchSessions, fetchTimeTables } from '../../../../lib/api';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import Select from 'react-select';

const TimeTables = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "ar";

  const [selectedMosque, setSelectedMosque] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [timeTables, setTimeTables] = useState([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTimetableId, setSelectedTimetableId] = useState(null);

  useEffect(() => {
    setSelectedSession(null);
    setTimeTables([]);
  }, [selectedMosque]);

  const { data: mosquesData = [], isLoading: mosquesLoading } = useQuery({
    queryKey: ["mosques", locale],
    queryFn: () => fetchMosques({}, locale),
  });
  const mosques = mosquesData?.data?.data || [];

  const { data: sessionsData = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["sessions", selectedMosque?.value, locale],
    queryFn: () => fetchSessions({ mosque_id: selectedMosque.value }, locale),
    enabled: !!selectedMosque,
  });
  const sessions = sessionsData?.data?.data || [];


  useEffect(() => {
    if (selectedSession) {
      fetchTimeTables({ user_session_id: selectedSession.value }, locale).then((res) => {
        setTimeTables(res.data?.data || []);
      });
    } else {
      setTimeTables([]);
    }
  }, [selectedSession, locale]);

  const handleShowDetails = (row) => {
    setSelectedTimetableId(row.id);
    setIsDetailsModalOpen(true);
  };

  const columns = useMemo(() => [
    { 
      header: t('student-name'), 
      accessor: 'user.name',
      render: (row) => row.user?.name || t('not_specified')
    },
    { 
      header: t('date'), 
      accessor: 'dates',
      render: (row) => row.dates || t('not_specified')
    },
    { 
      header: t('type'), 
      accessor: 'type',
      render: (row) => row.type || t('not_specified')
    },
    { 
      header: t('surah-from'), 
      accessor: 'surah_from',
      render: (row) => row.surah_from || t('not_specified')
    },
    { 
      header: t('surah-to'), 
      accessor: 'surah_to',
      render: (row) => row.surah_to || t('not_specified')
    },
    { 
      header: t('ayah-from'), 
      accessor: 'ayah_from',
      render: (row) => row.ayah_from || t('not_specified')
    },
    { 
      header: t('ayah-to'), 
      accessor: 'ayah_to',
      render: (row) => row.ayah_to || t('not_specified')
    },
    { 
      header: t('status'), 
      accessor: 'status',
      render: (row) => row.status || t('not_specified')
    },
    {
      header: t('options'),
      accessor: 'actions',
      render: (row) => (
        <button
          onClick={() => handleShowDetails(row)}
          className="text-primary-600 hover:text-primary-900"
        >
          {t('view-details')}
        </button>
      ),
    },
  ], [t, locale]);

  const detailsFieldsConfig = useMemo(() => [
    { name: 'user.name', label: t('student-name'), type: 'text', readOnly: true, nested: true },
    { name: 'dates', label: t('date'), type: 'text', readOnly: true },
    { name: 'type', label: t('type'), type: 'text', readOnly: true },
    { name: 'surah_from', label: t('surah-from'), type: 'text', readOnly: true },
    { name: 'surah_to', label: t('surah-to'), type: 'text', readOnly: true },
    { name: 'ayah_from', label: t('ayah-from'), type: 'text', readOnly: true },
    { name: 'ayah_to', label: t('ayah-to'), type: 'text', readOnly: true },
    { name: 'degree', label: t('degree'), type: 'text', readOnly: true },
    { name: 'status', label: t('status'), type: 'text', readOnly: true },
    { name: 'created_at', label: t('created_at'), type: 'text', readOnly: true },
  ], [t]);

  const mosqueOptions = mosques?.map((mosque) => ({ value: mosque.id, label: mosque.name })) || [];
  const sessionOptions = sessions?.map((session) => ({ value: session.id, label: session.name })) || [];

  return (
    <div className='p-4 sm:p-6 lg:p-8'>
      <DashboardHeader pageTitle={t("timetables")} backUrl={`/${locale}/dashboard`} />
      <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          options={mosqueOptions}
          instanceId={"mosque"}
          onChange={setSelectedMosque}
          value={selectedMosque}
          placeholder={t('select-mosque')}
          isLoading={mosquesLoading}
          className="react-select-container"
          classNamePrefix="react-select"
        />
        <Select
          options={sessionOptions}
          instanceId={"session"}
          onChange={setSelectedSession}
          value={selectedSession}
          placeholder={t('select-session')}
          isDisabled={!selectedMosque || sessionsLoading}
          isLoading={sessionsLoading}
          className="react-select-container"
          classNamePrefix="react-select"
        />

        </div>
      </div>

      <DashboardTable columns={columns} data={timeTables} />

      {isDetailsModalOpen && (
        <DetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedTimetableId(null);
          }}
          timetableId={selectedTimetableId}
          locale={locale}
        />
      )}
    </div>
  );
};

export default TimeTables;