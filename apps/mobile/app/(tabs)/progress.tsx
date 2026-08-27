import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { currentDateLocale } from '../../i18n';
import { CARD_SHADOW } from '../../constants/shadow';
import { uploadFile } from '../../services/storageService';
import { getApiErrorMessage } from '../../services/apiError';
import { createMilestone, fetchMilestones } from '../../services/milestonesService';
import { fetchGestationalAge } from '../../services/pregnancyService';
import { fetchMe } from '../../services/usersService';
import { MilestonePhoto } from '../../types/pregnancy';
import { PillToggle } from '../../components/PillToggle';

type ViewMode = 'grid' | 'line';

export default function ProgressScreen() {
  const { t } = useTranslation();
  const [milestones, setMilestones] = useState<MilestonePhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState<number | null>(null);
  const [prePregnancyWeightKg, setPrePregnancyWeightKg] = useState<number | null>(null);
  const [pendingUri, setPendingUri] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  useEffect(() => {
    Promise.all([fetchMilestones(), fetchGestationalAge().catch(() => null), fetchMe().catch(() => null)]).then(
      ([photos, age, user]) => {
        setMilestones(photos.slice().sort((a, b) => b.weekNumber - a.weekNumber));
        setCurrentWeek(age?.weeks ?? null);
        setPrePregnancyWeightKg(user?.prePregnancyWeightKg ?? null);
        setIsLoading(false);
      },
    );
  }, []);

  async function handlePickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      setPendingUri(result.assets[0].uri);
    }
  }

  function handleCreated(photo: MilestonePhoto) {
    setMilestones((prev) => [photo, ...prev].sort((a, b) => b.weekNumber - a.weekNumber));
    setPendingUri(null);
  }

  if (isLoading) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#E28A96" size="large" />
      </SafeAreaView>
    );
  }

  const weights = milestones.filter((m) => m.weight != null).map((m) => m.weight as number);
  const currentWeight = milestones.find((m) => m.weight != null)?.weight ?? null;
  const baselineWeight = prePregnancyWeightKg ?? (weights.length ? weights[weights.length - 1] : null);
  const gain = currentWeight != null && baselineWeight != null ? currentWeight - baselineWeight : null;
  const firstWeek = milestones.length ? milestones[milestones.length - 1].weekNumber : currentWeek;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="flex-row items-start justify-between px-5 pt-5">
        <View>
          <Text className="font-display text-2xl text-ink">{t('tabs.progress.title')}</Text>
          <Text className="mt-1 font-semi text-sm text-muted">
            {t('tabs.progress.recordsCount', { count: milestones.length })}
            {firstWeek != null ? t('tabs.progress.sinceWeek', { week: firstWeek }) : ''}
          </Text>
        </View>
        <View className="w-32">
          <PillToggle
            value={viewMode}
            onChange={setViewMode}
            options={[
              { value: 'grid', label: t('tabs.progress.viewGrid') },
              { value: 'line', label: t('tabs.progress.viewLine') },
            ]}
          />
        </View>
      </View>

      {currentWeight != null && (
        <View className="mx-5 mt-4 flex-row rounded-card bg-surface p-4" style={CARD_SHADOW}>
          <View className="flex-1">
            <Text className="font-semi text-xs uppercase text-muted">{t('tabs.progress.currentWeight')}</Text>
            <Text className="mt-1 font-display text-xl text-ink">{currentWeight} kg</Text>
          </View>
          {gain != null && (
            <View className="flex-1 border-l border-neutral-100 pl-4">
              <Text className="font-semi text-xs uppercase text-muted">{t('tabs.progress.gain')}</Text>
              <Text className="mt-1 font-display text-xl text-lavenderText">
                {gain >= 0 ? '+' : ''}
                {gain.toFixed(1)} kg
              </Text>
            </View>
          )}
        </View>
      )}

      {viewMode === 'grid' ? (
        <FlatList
          key="grid"
          data={milestones}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerClassName="gap-3 p-5"
          columnWrapperClassName="gap-3"
          ListEmptyComponent={
            <Text className="mt-8 text-center font-semi text-muted">{t('tabs.progress.emptyState')}</Text>
          }
          renderItem={({ item }) => (
            <View className="flex-1 rounded-card bg-surface" style={CARD_SHADOW}>
              <View className="overflow-hidden rounded-card">
                <Image
                  source={{ uri: item.photoUrl }}
                  accessible
                  accessibilityLabel={t('tabs.progress.weekTitle', { week: item.weekNumber })}
                  className="h-40 w-full bg-rose"
                  resizeMode="cover"
                />
                <View className="p-3">
                  <View className="flex-row items-center gap-2">
                    <View className="rounded-full bg-rose px-2 py-0.5">
                      <Text className="font-semi text-xs text-primaryDark">
                        {t('tabs.progress.weekAbbrev', { week: item.weekNumber })}
                      </Text>
                    </View>
                  </View>
                  {item.weight != null && <Text className="mt-2 font-display text-base text-ink">{item.weight} kg</Text>}
                  {item.notes && <Text className="mt-1 font-semi text-sm text-muted">{item.notes}</Text>}
                </View>
              </View>
            </View>
          )}
        />
      ) : (
        <FlatList
          key="line"
          data={milestones}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3 p-5"
          ListEmptyComponent={
            <Text className="mt-8 text-center font-semi text-muted">{t('tabs.progress.emptyState')}</Text>
          }
          renderItem={({ item }) => (
            <View className="flex-row gap-3 rounded-card bg-surface p-3" style={CARD_SHADOW}>
              <Image
                source={{ uri: item.photoUrl }}
                accessible
                accessibilityLabel={t('tabs.progress.weekTitle', { week: item.weekNumber })}
                className="h-24 w-24 rounded-xl bg-rose"
                resizeMode="cover"
              />
              <View className="flex-1 justify-center">
                <View className="flex-row items-center justify-between">
                  <Text className="font-display text-base text-ink">
                    {t('tabs.progress.weekTitle', { week: item.weekNumber })}
                  </Text>
                  <Text className="font-semi text-xs text-muted">
                    {new Date(item.date).toLocaleDateString(currentDateLocale(), { day: 'numeric', month: 'short' })}
                  </Text>
                </View>
                <View className="mt-1 flex-row flex-wrap gap-x-3">
                  {item.weight != null && (
                    <Text className="font-semi text-sm text-lavenderText">{item.weight} kg</Text>
                  )}
                  {item.bellyCircumference != null && (
                    <Text className="font-semi text-sm text-lavenderText">
                      {t('tabs.progress.bellyCircumference')}: {item.bellyCircumference} cm
                    </Text>
                  )}
                </View>
                {item.notes && (
                  <Text className="mt-1 font-semi text-sm text-muted" numberOfLines={2}>
                    {item.notes}
                  </Text>
                )}
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        onPress={handlePickPhoto}
        className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg"
      >
        <Text className="text-2xl text-ink">+</Text>
      </TouchableOpacity>

      <Modal visible={!!pendingUri} animationType="slide" transparent onRequestClose={() => setPendingUri(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
          {pendingUri && (
            <MilestoneForm uri={pendingUri} defaultWeek={currentWeek} onClose={() => setPendingUri(null)} onCreated={handleCreated} />
          )}
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function MilestoneForm({
  uri,
  defaultWeek,
  onClose,
  onCreated,
}: {
  uri: string;
  defaultWeek: number | null;
  onClose: () => void;
  onCreated: (photo: MilestonePhoto) => void;
}) {
  const { t } = useTranslation();
  const [weekNumber, setWeekNumber] = useState(String(defaultWeek ?? ''));
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const week = parseInt(weekNumber, 10);
    if (Number.isNaN(week)) return;

    setIsSaving(true);
    setError(null);
    try {
      const photoUrl = await uploadFile(uri, 'milestones');
      const photo = await createMilestone({
        weekNumber: week,
        photoUrl,
        weight: weight ? parseFloat(weight) : undefined,
        notes: note || undefined,
      });
      onCreated(photo);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View className="mt-auto rounded-t-3xl bg-background p-5">
      <Text className="mb-4 font-display text-xl text-ink">{t('tabs.progress.newPhotoTitle')}</Text>
      <Image
        source={{ uri }}
        accessible
        accessibilityLabel={t('tabs.progress.newPhotoTitle')}
        className="mb-4 h-48 w-full rounded-2xl"
        resizeMode="cover"
      />

      <Text className="mb-1 font-semi text-sm text-muted">{t('tabs.progress.weekNumberLabel')}</Text>
      <TextInput
        className="mb-4 rounded-xl border border-neutral-200 bg-white px-4 py-3 font-sans text-base"
        value={weekNumber}
        onChangeText={setWeekNumber}
        keyboardType="number-pad"
        accessibilityLabel={t('tabs.progress.weekNumberLabel')}
      />

      <Text className="mb-1 font-semi text-sm text-muted">{t('tabs.progress.weightLabel')}</Text>
      <TextInput
        className="mb-4 rounded-xl border border-neutral-200 bg-white px-4 py-3 font-sans text-base"
        value={weight}
        onChangeText={setWeight}
        keyboardType="decimal-pad"
        accessibilityLabel={t('tabs.progress.weightLabel')}
      />

      <Text className="mb-1 font-semi text-sm text-muted">{t('tabs.progress.noteLabel')}</Text>
      <TextInput
        className="mb-6 rounded-xl border border-neutral-200 bg-white px-4 py-3 font-sans text-base"
        value={note}
        onChangeText={setNote}
        placeholder={t('tabs.progress.notePlaceholder')}
        accessibilityLabel={t('tabs.progress.noteLabel')}
      />

      {error && <Text className="mb-4 font-semi text-sm text-red-400">{error}</Text>}

      <View className="flex-row gap-3">
        <TouchableOpacity onPress={onClose} className="flex-1 items-center rounded-2xl bg-white py-4">
          <Text className="font-semi text-base text-muted">{t('common.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSaving || !weekNumber}
          className="flex-1 items-center rounded-2xl bg-primary py-4"
        >
          <Text className="font-semi text-base text-ink">{isSaving ? t('tabs.progress.uploading') : t('common.save')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
