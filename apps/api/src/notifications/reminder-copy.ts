type Locale = 'es' | 'en';

function formatTime(date: Date, locale: Locale): string {
  return date.toLocaleTimeString(locale === 'es' ? 'es-NI' : 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

const COPY = {
  es: {
    appointment: {
      1440: (title: string, time: string) => ({
        title: 'Recordatorio de cita',
        body: `Mañana tenés: ${title}, ${time}`,
      }),
      120: (title: string, time: string) => ({
        title: 'Tu cita es pronto',
        body: `En 2 horas: ${title}, ${time}`,
      }),
    },
    exam: {
      1440: (title: string) => ({ title: 'Recordatorio de examen', body: `Mañana tenés: ${title}` }),
      120: (title: string) => ({ title: 'Tu examen es pronto', body: `En 2 horas: ${title}` }),
    },
  },
  en: {
    appointment: {
      1440: (title: string, time: string) => ({
        title: 'Appointment reminder',
        body: `Tomorrow: ${title}, ${time}`,
      }),
      120: (title: string, time: string) => ({
        title: 'Your appointment is coming up',
        body: `In 2 hours: ${title}, ${time}`,
      }),
    },
    exam: {
      1440: (title: string) => ({ title: 'Exam reminder', body: `Tomorrow: ${title}` }),
      120: (title: string) => ({ title: 'Your exam is coming up', body: `In 2 hours: ${title}` }),
    },
  },
} as const;

function resolveLocale(preferredLocale: string): Locale {
  return preferredLocale === 'en' ? 'en' : 'es';
}

export function buildAppointmentCopy(title: string, date: Date, offsetMinutes: 1440 | 120, preferredLocale: string) {
  const locale = resolveLocale(preferredLocale);
  return COPY[locale].appointment[offsetMinutes](title, formatTime(date, locale));
}

export function buildExamCopy(title: string, offsetMinutes: 1440 | 120, preferredLocale: string) {
  const locale = resolveLocale(preferredLocale);
  return COPY[locale].exam[offsetMinutes](title);
}
