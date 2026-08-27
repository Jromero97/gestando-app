import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  requestRecordingPermissionsAsync,
} from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  addDiaryPhoto,
  fetchDay,
  removeDiaryPhoto,
  upsertDiaryEntry,
} from '../../services/diaryService';
import { updateAppointmentResults } from '../../services/agendaService';
import { uploadFile } from '../../services/storageService';
import { getApiErrorMessage } from '../../services/apiError';
import { currentDateLocale } from '../../i18n';
import { CARD_SHADOW } from '../../constants/shadow';
import { Appointment, DayData, DiaryMood, Symptom } from '../../types/pregnancy';
import { StatusBadge } from '../../components/StatusBadge';

const MOODS: { value: DiaryMood; color: string }[] = [
  { value: 'GREAT', color: '#E28A96' },
  { value: 'GOOD', color: '#8B7FD1' },
  { value: 'OKAY', color: '#7FA3C9' },
  { value: 'TIRED', color: '#C9B896' },
  { value: 'BAD', color: '#8B4A52' },
];

const SYMPTOMS: Symptom[] = [
  'NAUSEA',
  'HEARTBURN',
  'BACK_PAIN',
  'INSOMNIA',
  'CRAVINGS',
  'CRAMPS',
  'SWELLING',
  'DIZZINESS',
];

export default function DayScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { date } = useLocalSearchParams<{ date: string }>();
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [note, setNote] = useState('');
  const [mood, setMood] = useState<DiaryMood | undefined>(undefined);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [weightKg, setWeightKg] = useState('');
  const [babyMovementsCount, setBabyMovementsCount] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchDay(date).then((data) => {
      setDayData(data);
      setNote(data.diaryEntry?.note ?? '');
      setMood(data.diaryEntry?.mood ?? undefined);
      setSymptoms(data.diaryEntry?.symptoms ?? []);
      setWeightKg(data.diaryEntry?.weightKg != null ? String(data.diaryEntry.weightKg) : '');
      setBabyMovementsCount(
        data.diaryEntry?.babyMovementsCount != null ? String(data.diaryEntry.babyMovementsCount) : '',
      );
      setSleepHours(data.diaryEntry?.sleepHours != null ? String(data.diaryEntry.sleepHours) : '');
      setIsLoading(false);
    });
  }, [date]);

  function toggleSymptom(value: Symptom) {
    setSymptoms((prev) => (prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]));
  }

  async function handleSave() {
    setIsSaving(true);
    setSavedMessage(null);
    try {
      const entry = await upsertDiaryEntry({
        date,
        note: note || undefined,
        mood,
        symptoms,
        weightKg: weightKg ? parseFloat(weightKg) : undefined,
        babyMovementsCount: babyMovementsCount ? parseInt(babyMovementsCount, 10) : undefined,
        sleepHours: sleepHours ? parseFloat(sleepHours) : undefined,
      });
      setDayData((prev) => (prev ? { ...prev, diaryEntry: entry } : prev));
      setSavedMessage(t('day.saved'));
    } catch (err) {
      setSavedMessage(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  function updateAppointmentInList(updated: Appointment) {
    setDayData((prev) =>
      prev ? { ...prev, appointments: prev.appointments.map((a) => (a.id === updated.id ? updated : a)) } : prev,
    );
  }

  function refreshDiaryEntry() {
    fetchDay(date).then(setDayData);
  }

  const formattedDate = new Date(`${date}T00:00:00.000Z`).toLocaleDateString(currentDateLocale(), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  if (isLoading || !dayData) {
    return (
      <SafeAreaView edges={['top', 'bottom']} className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#E28A96" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <View className="flex-row items-center gap-2 px-5 pt-5">
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('day.backLabel')}
          className="p-2.5"
        >
          <Ionicons name="chevron-back" size={24} color="#2B2A33" />
        </TouchableOpacity>
        <Text className="flex-1 font-display text-lg capitalize text-ink" numberOfLines={1}>
          {formattedDate}
        </Text>
      </View>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="p-5 gap-4"
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        contentInsetAdjustmentBehavior="automatic"
      >
        {dayData.appointments.length > 0 && (
          <Section title={t('day.sectionAppointments')}>
            {dayData.appointments.map((a) => (
              <AppointmentResultsCard key={a.id} appointment={a} onSaved={updateAppointmentInList} />
            ))}
          </Section>
        )}

        {dayData.exams.length > 0 && (
          <Section title={t('day.sectionExams')}>
            {dayData.exams.map((e) => (
              <Card key={e.id}>
                <Text className="font-display text-base text-ink">{e.title}</Text>
                <Text className="mt-1 font-semi text-sm text-lavenderText">{t(`day.examCategory.${e.category}`)}</Text>
              </Card>
            ))}
          </Section>
        )}

        {dayData.milestones.length > 0 && (
          <Section title={t('day.sectionMilestones')}>
            <View className="flex-row flex-wrap gap-3">
              {dayData.milestones.map((m) => (
                <Image
                  key={m.id}
                  source={{ uri: m.photoUrl }}
                  accessible
                  accessibilityLabel={t('day.sectionMilestones')}
                  className="h-24 w-24 rounded-xl"
                  resizeMode="cover"
                />
              ))}
            </View>
          </Section>
        )}

        <Section title={t('day.moodTitle')}>
          <View className="flex-row flex-wrap gap-2">
            {MOODS.map((m) => {
              const selected = mood === m.value;
              return (
                <TouchableOpacity
                  key={m.value}
                  onPress={() => setMood(selected ? undefined : m.value)}
                  className={`items-center rounded-2xl border px-4 py-3 ${
                    selected ? 'border-primary bg-rose' : 'border-neutral-200 bg-surface'
                  }`}
                >
                  <View className="h-3 w-3 rounded-full" style={{ backgroundColor: m.color }} />
                  <Text className="mt-1 font-semi text-xs text-ink">{t(`day.moods.${m.value}`)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        <View>
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="font-semi text-sm uppercase text-muted">{t('day.symptomsTitle')}</Text>
            {symptoms.length > 0 && (
              <Text className="font-semi text-sm text-primary">{t('day.activeCount', { count: symptoms.length })}</Text>
            )}
          </View>
          <View className="rounded-card bg-surface p-4" style={CARD_SHADOW}>
            <View className="flex-row flex-wrap gap-2">
              {SYMPTOMS.map((value) => {
                const active = symptoms.includes(value);
                return (
                  <TouchableOpacity
                    key={value}
                    onPress={() => toggleSymptom(value)}
                    className={`rounded-2xl px-4 py-2 ${active ? 'bg-primary' : 'border border-neutral-200 bg-surface'}`}
                  >
                    <Text className={`font-semi text-sm ${active ? 'text-ink' : 'text-ink'}`}>
                      {t(`day.symptoms.${value}`)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <View className="flex-row rounded-card bg-surface p-4" style={CARD_SHADOW}>
          <StatField label={t('day.statWeight')} value={weightKg} onChangeText={setWeightKg} suffix={t('day.unitKg')} />
          <StatField
            label={t('day.statMovements')}
            value={babyMovementsCount}
            onChangeText={setBabyMovementsCount}
            suffix={t('day.unitToday')}
          />
          <StatField label={t('day.statSleep')} value={sleepHours} onChangeText={setSleepHours} suffix={t('day.unitHours')} last />
        </View>

        <PhotoGallery date={date} photos={dayData.diaryEntry?.photos ?? []} onChange={refreshDiaryEntry} />

        <Section title={t('day.diarySectionTitle')}>
          <TextInput
            className="min-h-32 rounded-xl border border-neutral-200 bg-white px-4 py-3 font-sans text-base text-ink"
            placeholder={t('day.diaryPlaceholder')}
            accessibilityLabel={t('day.diarySectionTitle')}
            value={note}
            onChangeText={setNote}
            multiline
            textAlignVertical="top"
          />

          <AudioNote date={date} audioUrl={dayData.diaryEntry?.audioUrl} onChange={refreshDiaryEntry} />

          <TouchableOpacity onPress={handleSave} disabled={isSaving} className="mt-4 items-center rounded-2xl bg-primary py-4">
            <Text className="font-semi text-base text-ink">{isSaving ? t('common.saving') : t('day.saveDiary')}</Text>
          </TouchableOpacity>

          {savedMessage && <Text className="mt-2 text-center font-semi text-sm text-muted">{savedMessage}</Text>}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatField({
  label,
  value,
  onChangeText,
  suffix,
  last,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  suffix: string;
  last?: boolean;
}) {
  return (
    <View className={`flex-1 ${last ? '' : 'border-r border-neutral-100 pr-3 mr-3'}`}>
      <Text className="font-semi text-xs uppercase text-muted">{label}</Text>
      <View className="mt-1 flex-row items-baseline gap-1">
        <TextInput
          className="min-w-8 font-display text-lg text-ink"
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          placeholder="-"
          accessibilityLabel={label}
        />
        <Text className="font-semi text-xs text-muted">{suffix}</Text>
      </View>
    </View>
  );
}

function PhotoGallery({
  date,
  photos,
  onChange,
}: {
  date: string;
  photos: { id: string; photoUrl: string; caption?: string | null }[];
  onChange: () => void;
}) {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);

  async function handleAdd() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled || !result.assets[0]) return;

    setIsUploading(true);
    try {
      const photoUrl = await uploadFile(result.assets[0].uri, 'diary');
      await addDiaryPhoto(date, photoUrl);
      onChange();
    } finally {
      setIsUploading(false);
    }
  }

  async function handleRemove(photoId: string) {
    await removeDiaryPhoto(photoId);
    onChange();
  }

  return (
    <Section title={t('day.photosOfDay')}>
      <View className="flex-row flex-wrap gap-3">
        {photos.map((p) => (
          <View key={p.id} className="w-24">
            <View className="overflow-hidden rounded-xl">
              <Image
                source={{ uri: p.photoUrl }}
                accessible
                accessibilityLabel={t('day.photosOfDay')}
                className="h-24 w-24"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => handleRemove(p.id)}
                accessibilityRole="button"
                accessibilityLabel={t('day.removePhotoLabel')}
                className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full bg-ink/60"
              >
                <Ionicons name="close" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            {p.caption && <Text className="mt-1 font-semi text-xs text-muted" numberOfLines={1}>{p.caption}</Text>}
          </View>
        ))}
        <TouchableOpacity
          onPress={handleAdd}
          disabled={isUploading}
          accessibilityRole="button"
          accessibilityLabel={t('day.addPhotoLabel')}
          className="h-24 w-24 items-center justify-center rounded-xl border border-dashed border-primary/40"
        >
          {isUploading ? (
            <ActivityIndicator color="#E28A96" />
          ) : (
            <Ionicons name="add" size={24} color="#E28A96" />
          )}
        </TouchableOpacity>
      </View>
    </Section>
  );
}

function AudioNote({
  date,
  audioUrl,
  onChange,
}: {
  date: string;
  audioUrl: string | null | undefined;
  onChange: () => void;
}) {
  const { t } = useTranslation();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const player = useAudioPlayer(audioUrl ?? undefined);
  const playerStatus = useAudioPlayerStatus(player);
  const [isUploading, setIsUploading] = useState(false);

  async function handleToggleRecord() {
    if (recorderState.isRecording) {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) return;

      setIsUploading(true);
      try {
        const uploadedUrl = await uploadFile(uri, 'diary', 'audio/m4a');
        await upsertDiaryEntry({ date, audioUrl: uploadedUrl });
        onChange();
      } finally {
        setIsUploading(false);
      }
    } else {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) return;
      await recorder.prepareToRecordAsync();
      recorder.record();
    }
  }

  return (
    <View className="mt-3 flex-row items-center gap-3">
      {audioUrl && !recorderState.isRecording && (
        <TouchableOpacity
          onPress={() => (playerStatus.playing ? player.pause() : player.play())}
          accessibilityRole="button"
          accessibilityLabel={playerStatus.playing ? t('day.pauseAudioLabel') : t('day.playAudioLabel')}
          className="h-11 w-11 items-center justify-center rounded-full bg-lavender"
        >
          <Ionicons name={playerStatus.playing ? 'pause' : 'play'} size={18} color="#5B5470" />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        onPress={handleToggleRecord}
        disabled={isUploading}
        className={`flex-1 items-center rounded-xl py-3 ${recorderState.isRecording ? 'bg-red-100' : 'bg-white'}`}
      >
        <Text className={`font-semi text-sm ${recorderState.isRecording ? 'text-red-500' : 'text-primaryDark'}`}>
          {isUploading
            ? t('day.uploading')
            : recorderState.isRecording
              ? t('day.recording', { seconds: Math.round(recorderState.durationMillis / 1000) })
              : audioUrl
                ? t('day.reRecordAudio')
                : t('day.addAudio')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function AppointmentResultsCard({
  appointment,
  onSaved,
}: {
  appointment: Appointment;
  onSaved: (updated: Appointment) => void;
}) {
  const { t } = useTranslation();
  const [bloodPressure, setBloodPressure] = useState(appointment.bloodPressure ?? '');
  const [uterineHeightCm, setUterineHeightCm] = useState(
    appointment.uterineHeightCm != null ? String(appointment.uterineHeightCm) : '',
  );
  const [fetalHeartRateBpm, setFetalHeartRateBpm] = useState(
    appointment.fetalHeartRateBpm != null ? String(appointment.fetalHeartRateBpm) : '',
  );
  const [estimatedBabyWeightG, setEstimatedBabyWeightG] = useState(
    appointment.estimatedBabyWeightG != null ? String(appointment.estimatedBabyWeightG) : '',
  );
  const [resultsFileUrl, setResultsFileUrl] = useState(appointment.resultsFileUrl ?? undefined);
  const [resultsFileName, setResultsFileName] = useState(appointment.resultsFileName ?? undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  async function handlePickPdf() {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (result.canceled || !result.assets[0]) return;

    setIsUploadingFile(true);
    try {
      const url = await uploadFile(result.assets[0].uri, 'exams', 'application/pdf');
      setResultsFileUrl(url);
      setResultsFileName(result.assets[0].name);
    } finally {
      setIsUploadingFile(false);
    }
  }

  async function handleSaveResults() {
    setIsSaving(true);
    try {
      const updated = await updateAppointmentResults(appointment.id, {
        bloodPressure: bloodPressure || undefined,
        uterineHeightCm: uterineHeightCm ? parseFloat(uterineHeightCm) : undefined,
        fetalHeartRateBpm: fetalHeartRateBpm ? parseInt(fetalHeartRateBpm, 10) : undefined,
        estimatedBabyWeightG: estimatedBabyWeightG ? parseInt(estimatedBabyWeightG, 10) : undefined,
        resultsFileUrl,
        resultsFileName,
      });
      onSaved(updated);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <View className="flex-row items-start justify-between">
        <Text className="flex-1 font-display text-base text-ink">{appointment.title}</Text>
        <StatusBadge status={appointment.status} />
      </View>
      {appointment.doctorName && (
        <Text className="mt-1 font-semi text-sm text-muted">
          {t('tabs.agenda.doctorPrefix', { name: appointment.doctorName })}
        </Text>
      )}

      <Text className="mb-2 mt-4 font-semi text-xs uppercase text-muted">{t('day.resultsTitle')}</Text>
      <View className="gap-2">
        <ResultRow label={t('day.bloodPressure')} value={bloodPressure} onChangeText={setBloodPressure} placeholder="110/70" />
        <ResultRow
          label={t('day.uterineHeight')}
          value={uterineHeightCm}
          onChangeText={setUterineHeightCm}
          keyboardType="decimal-pad"
        />
        <ResultRow
          label={t('day.fetalHeartRate')}
          value={fetalHeartRateBpm}
          onChangeText={setFetalHeartRateBpm}
          keyboardType="number-pad"
        />
        <ResultRow
          label={t('day.estimatedBabyWeight')}
          value={estimatedBabyWeightG}
          onChangeText={setEstimatedBabyWeightG}
          keyboardType="number-pad"
        />
      </View>

      <View className="mt-3 flex-row items-center gap-2">
        {resultsFileUrl ? (
          <>
            <View className="flex-1 flex-row items-center gap-2 rounded-xl bg-background px-3 py-2">
              <Ionicons name="document-text" size={16} color="#5B5470" />
              <Text className="flex-1 font-semi text-xs text-muted" numberOfLines={1}>
                {resultsFileName ?? t('day.defaultReportFileName')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => Linking.openURL(resultsFileUrl)}
              className="rounded-full bg-ink px-4 py-2"
            >
              <Text className="font-semi text-xs text-white">{t('day.viewResults')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={handlePickPdf}
            disabled={isUploadingFile}
            className="flex-1 items-center rounded-xl border border-dashed border-primary/40 py-2"
          >
            <Text className="font-semi text-xs text-primary">
              {isUploadingFile ? t('day.uploading') : t('day.uploadResults')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity onPress={handleSaveResults} disabled={isSaving} className="mt-3 items-center rounded-xl bg-primary py-3">
        <Text className="font-semi text-sm text-ink">{isSaving ? t('common.saving') : t('day.saveResults')}</Text>
      </TouchableOpacity>
    </Card>
  );
}

function ResultRow({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'decimal-pad' | 'number-pad';
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="font-semi text-sm text-muted">{label}</Text>
      <TextInput
        className="w-28 rounded-lg border border-neutral-200 bg-background px-2 py-1 text-right font-semi text-sm text-ink"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        accessibilityLabel={label}
      />
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View>
      <Text className="mb-2 font-semi text-sm uppercase text-muted">{title}</Text>
      {children}
    </View>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <View className="mb-2 rounded-card bg-surface p-4" style={CARD_SHADOW}>
      {children}
    </View>
  );
}
