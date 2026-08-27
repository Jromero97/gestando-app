import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

function TabIcon({ name, focused }: { name: keyof typeof Ionicons.glyphMap; focused: boolean }) {
  return (
    <View
      className="h-9 w-9 items-center justify-center rounded-full"
      style={{ backgroundColor: focused ? '#E28A96' : 'rgba(229, 231, 235, 0.7)' }}
    >
      <Ionicons name={name} size={18} color={focused ? '#FFFFFF' : '#9C98A6'} />
    </View>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2B2A33',
        tabBarInactiveTintColor: '#9C98A6',
        tabBarLabelStyle: { fontFamily: 'Nunito_600SemiBold', fontSize: 11 },
        tabBarStyle: { borderTopColor: '#F3E3E2' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t('nav.home'), tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} /> }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: t('nav.progress'),
          tabBarIcon: ({ focused }) => <TabIcon name="trending-up" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{ title: t('nav.diary'), tabBarIcon: ({ focused }) => <TabIcon name="book" focused={focused} /> }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: t('nav.agenda'),
          tabBarIcon: ({ focused }) => <TabIcon name="calendar" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: t('nav.profile'), tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} /> }}
      />
    </Tabs>
  );
}
