import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DatePickerField } from '../../components/DatePickerField';
import { DateChip } from '../../components/DateChip';
import { StatusBadge } from '../../components/StatusBadge';
import { PillToggle } from '../../components/PillToggle';
import {
  createAppointment,
  createExam,
  deleteAppointment,
  deleteExam,
  fetchAppointments,
  fetchExams,
  updateAppointment,
  updateAppointmentStatus,
} from '../../services/agendaService';
import { fetchGestationalAge } from '../../services/pregnancyService';
import { getApiErrorMessage } from '../../services/apiError';
import { currentDateLocale } from '../../i18n';
import { CARD_SHADOW } from '../../constants/shadow';
import { Appointment, AppointmentStatus, Exam, ExamCategory, GestationalAge } from '../../types/pregnancy';

const EXAM_CATEGORIES: ExamCategory[] = ['ULTRASOUND', 'LAB', 'GENERAL'];
const STATUS_CYCLE: AppointmentStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

type Tab = 'appointments' | 'exams';

export default function AgendaScreen() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [gestationalAge, setGestationalAge] = useState<GestationalAge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [appointmentsData, examsData, age] = await Promise.all([
        fetchAppointments(),
        fetchExams(),
        fetchGestationalAge().catch(() => null),
      ]);
      setAppointments(appointmentsData);
      setExams(examsData);
      setGestationalAge(age);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleDeleteAppointment(id: string) {
    await deleteAppointment(id);
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleDeleteExam(id: string) {
    await deleteExam(id);
    setExams((prev) => prev.filter((e) => e.id !== id));
  }

  async function handleCycleStatus(appointment: Appointment) {
    const currentIndex = STATUS_CYCLE.indexOf(appointment.status);
    const next = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length];
    const updated = await updateAppointmentStatus(appointment.id, next);
    setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  }

  function closeForm() {
    setFormVisible(false);
    setEditingAppointment(null);
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="px-5 pt-5">
        <Text className="font-display text-2xl text-ink">{t('tabs.agenda.title')}</Text>
        {gestationalAge && (
          <Text className="mt-1 font-semi text-sm text-muted">
            {t('tabs.agenda.weekSummary', {
              weeks: gestationalAge.weeks,
              trimester: t(`tabs.agenda.trimester.${gestationalAge.trimester}`),
            })}
          </Text>
        )}
        <View className="mt-4">
          <PillToggle
            value={tab}
            onChange={setTab}
            options={[
              { value: 'appointments', label: t('tabs.agenda.tabAppointments') },
              { value: 'exams', label: t('tabs.agenda.tabExams') },
            ]}
          />
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#E28A96" size="large" />
        </View>
      ) : tab === 'appointments' ? (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3 p-5"
          ListEmptyComponent={
            <Text className="mt-8 text-center font-semi text-muted">{t('tabs.agenda.noAppointments')}</Text>
          }
          ListFooterComponent={
            <AddButton label={t('tabs.agenda.addAppointment')} onPress={() => setFormVisible(true)} />
          }
          renderItem={({ item }) => (
            <View className="rounded-card bg-surface p-4" style={CARD_SHADOW}>
              <View className="flex-row gap-3">
                <DateChip date={new Date(item.date)} />
                <View className="flex-1">
                  <View className="flex-row items-start justify-between">
                    <Text className="flex-1 font-display text-base text-ink">{item.title}</Text>
                    <StatusBadge status={item.status} />
                  </View>
                  {item.doctorName && (
                    <Text className="mt-1 font-semi text-sm text-muted">
                      {t('tabs.agenda.doctorPrefix', { name: item.doctorName })}
                    </Text>
                  )}
                  <Text className="mt-1 font-semi text-sm text-lavenderText">
                    {new Date(item.date).toLocaleTimeString(currentDateLocale(), { hour: '2-digit', minute: '2-digit' })}
                    {item.location ? ` · ${item.location}` : ''}
                  </Text>
                </View>
              </View>
              <View className="mt-3 flex-row gap-4">
                <TouchableOpacity onPress={() => handleCycleStatus(item)}>
                  <Text className="font-semi text-sm text-primary">{t('tabs.agenda.changeStatus')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setEditingAppointment(item);
                    setFormVisible(true);
                  }}
                >
                  <Text className="font-semi text-sm text-primary">{t('tabs.agenda.edit')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteAppointment(item.id)}>
                  <Text className="font-semi text-sm text-red-400">{t('tabs.agenda.delete')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={exams}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3 p-5"
          ListEmptyComponent={<Text className="mt-8 text-center font-semi text-muted">{t('tabs.agenda.noExams')}</Text>}
          ListFooterComponent={<AddButton label={t('tabs.agenda.addExam')} onPress={() => setFormVisible(true)} />}
          renderItem={({ item }) => (
            <View className="rounded-card bg-surface p-4" style={CARD_SHADOW}>
              <View className="flex-row gap-3">
                <DateChip date={new Date(item.date)} />
                <View className="flex-1">
                  <Text className="font-display text-base text-ink">{item.title}</Text>
                  <Text className="mt-1 font-semi text-sm text-lavenderText">
                    {t(`tabs.agenda.examCategory.${item.category}`)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleDeleteExam(item.id)} className="mt-3 self-start">
                <Text className="font-semi text-sm text-red-400">{t('tabs.agenda.delete')}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <Modal visible={formVisible} animationType="slide" transparent onRequestClose={closeForm}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
          {tab === 'appointments' ? (
            <AppointmentForm
              appointment={editingAppointment}
              onClose={closeForm}
              onSaved={(appointment) =>
                setAppointments((prev) =>
                  prev.some((a) => a.id === appointment.id)
                    ? prev.map((a) => (a.id === appointment.id ? appointment : a))
                    : [...prev, appointment],
                )
              }
            />
          ) : (
            <ExamForm onClose={closeForm} onCreated={(exam) => setExams((prev) => [...prev, exam])} />
          )}
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function AddButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} className="items-center rounded-card border border-dashed border-primary/40 py-4">
      <Text className="font-semi text-sm text-primary">{label}</Text>
    </TouchableOpacity>
  );
}

function AppointmentForm({
  appointment,
  onClose,
  onSaved,
}: {
  appointment?: Appointment | null;
  onClose: () => void;
  onSaved: (a: Appointment) => void;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(appointment?.title ?? '');
  const [date, setDate] = useState(appointment ? new Date(appointment.date) : new Date());
  const [doctorName, setDoctorName] = useState(appointment?.doctorName ?? '');
  const [location, setLocation] = useState(appointment?.location ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!title.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      const input = {
        title,
        date: date.toISOString(),
        doctorName: doctorName || undefined,
        location: location || undefined,
      };
      const saved = appointment ? await updateAppointment(appointment.id, input) : await createAppointment(input);
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View className="mt-auto rounded-t-3xl bg-background p-5">
      <Text className="mb-4 font-display text-xl text-ink">
        {appointment ? t('tabs.agenda.editAppointmentTitle') : t('tabs.agenda.newAppointmentTitle')}
      </Text>
      <TextInput
        className="mb-4 rounded-xl border border-neutral-200 bg-white px-4 py-3 font-sans text-base"
        placeholder={t('tabs.agenda.titlePlaceholder')}
        accessibilityLabel={t('tabs.agenda.titlePlaceholder')}
        value={title}
        onChangeText={setTitle}
      />
      <DatePickerField label={t('tabs.agenda.dateLabel')} value={date} onChange={setDate} />
      <DatePickerField label={t('tabs.agenda.timeLabel')} value={date} onChange={setDate} mode="time" />
      <TextInput
        className="mb-4 rounded-xl border border-neutral-200 bg-white px-4 py-3 font-sans text-base"
        placeholder={t('tabs.agenda.doctorPlaceholder')}
        accessibilityLabel={t('tabs.agenda.doctorPlaceholder')}
        value={doctorName}
        onChangeText={setDoctorName}
      />
      <TextInput
        className="mb-4 rounded-xl border border-neutral-200 bg-white px-4 py-3 font-sans text-base"
        placeholder={t('tabs.agenda.locationPlaceholder')}
        accessibilityLabel={t('tabs.agenda.locationPlaceholder')}
        value={location}
        onChangeText={setLocation}
      />
      {error && <Text className="mb-4 font-semi text-sm text-red-400">{error}</Text>}
      <FormActions onCancel={onClose} onSubmit={handleSubmit} isSaving={isSaving} disabled={!title.trim()} />
    </View>
  );
}

function ExamForm({ onClose, onCreated }: { onClose: () => void; onCreated: (e: Exam) => void }) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [category, setCategory] = useState<ExamCategory>('LAB');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!title.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      const exam = await createExam({ title, date: date.toISOString(), category });
      onCreated(exam);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View className="mt-auto rounded-t-3xl bg-background p-5">
      <Text className="mb-4 font-display text-xl text-ink">{t('tabs.agenda.newExamTitle')}</Text>
      <TextInput
        className="mb-4 rounded-xl border border-neutral-200 bg-white px-4 py-3 font-sans text-base"
        placeholder={t('tabs.agenda.examTitlePlaceholder')}
        accessibilityLabel={t('tabs.agenda.examTitlePlaceholder')}
        value={title}
        onChangeText={setTitle}
      />
      <DatePickerField label={t('tabs.agenda.dateLabel')} value={date} onChange={setDate} />
      <View className="mb-4">
        <PillToggle
          value={category}
          onChange={setCategory}
          options={EXAM_CATEGORIES.map((c) => ({ value: c, label: t(`tabs.agenda.examCategory.${c}`) }))}
        />
      </View>
      {error && <Text className="mb-4 font-semi text-sm text-red-400">{error}</Text>}
      <FormActions onCancel={onClose} onSubmit={handleSubmit} isSaving={isSaving} disabled={!title.trim()} />
    </View>
  );
}

function FormActions({
  onCancel,
  onSubmit,
  isSaving,
  disabled,
}: {
  onCancel: () => void;
  onSubmit: () => void;
  isSaving: boolean;
  disabled: boolean;
}) {
  const { t } = useTranslation();
  return (
    <View className="flex-row gap-3">
      <TouchableOpacity onPress={onCancel} className="flex-1 items-center rounded-2xl bg-white py-4">
        <Text className="font-semi text-base text-muted">{t('common.cancel')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onSubmit}
        disabled={isSaving || disabled}
        className="flex-1 items-center rounded-2xl bg-primary py-4"
      >
        <Text className="font-semi text-base text-ink">{isSaving ? t('common.saving') : t('common.save')}</Text>
      </TouchableOpacity>
    </View>
  );
}
