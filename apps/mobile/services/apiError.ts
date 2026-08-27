import { AxiosError } from 'axios';
import i18n from '../i18n';

interface ApiErrorBody {
  message?: string;
}

/**
 * The API's global exception filter always responds with
 * `{ statusCode, message }` where `message` is a single human-readable
 * string (see apps/api/src/common/filters/all-exceptions.filter.ts) - safe
 * to show directly to the user. Falls back to a localized generic message
 * for network failures (no response at all) or anything unexpected.
 */
export function getApiErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    if (!err.response) return i18n.t('errors.network');
    const message = (err.response.data as ApiErrorBody | undefined)?.message;
    if (message) return message;
  }
  return i18n.t('errors.generic');
}
