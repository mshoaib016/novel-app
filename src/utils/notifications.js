/**
 * Local notification helper.
 *
 * IMPORTANT: expo-notifications is loaded LAZILY (required only when a
 * notification feature is actually used). This is deliberate:
 *
 *  - In Expo Go on SDK 53+, simply importing expo-notifications at startup
 *    triggers a one-time warning that "remote push was removed from Expo Go".
 *    By requiring the module only when the user enables/edits a reminder,
 *    that warning never fires on the Home screen at launch.
 *  - We ONLY use LOCAL notifications (scheduleNotificationAsync). Those work
 *    in Expo Go AND in the published build, on both Android and iOS. We never
 *    call getExpoPushTokenAsync, so no remote-push code path runs at all.
 */
import { Platform } from 'react-native';

let _mod = null;
let _handlerSet = false;

// Lazily load + configure expo-notifications the first time it's needed.
function loadModule() {
  if (_mod) return _mod;
  // eslint-disable-next-line global-require
  _mod = require('expo-notifications');
  if (!_handlerSet) {
    _handlerSet = true;
    try {
      _mod.setNotificationHandler({
        handleNotification: async () => ({
          // Older + newer key names kept together for cross-version safety.
          shouldShowAlert: true,
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    } catch (e) {
      // handler API unavailable — safe to ignore
    }
  }
  return _mod;
}

const CHANNEL_ID = 'reading-reminders';

async function ensureAndroidChannel(N) {
  if (Platform.OS !== 'android') return;
  try {
    await N.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Reading Reminders',
      importance: (N.AndroidImportance && N.AndroidImportance.DEFAULT) || 3,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });
  } catch (e) {
    // ignore
  }
}

/** Ask for notification permission. Returns true if granted. */
export async function requestPermission() {
  try {
    const N = loadModule();
    const current = await N.getPermissionsAsync();
    let granted = current.granted || current.status === 'granted';
    if (!granted && current.canAskAgain !== false) {
      const req = await N.requestPermissionsAsync();
      granted = req.granted || req.status === 'granted';
    }
    if (granted) await ensureAndroidChannel(N);
    return granted;
  } catch (e) {
    return false;
  }
}

/** Cancel every scheduled reminder (this app only schedules reminders). */
export async function cancelAllReminders() {
  try {
    const N = loadModule();
    await N.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    // ignore
  }
}

function buildTrigger(N, base) {
  const trigger = { ...base };
  if (Platform.OS === 'android') trigger.channelId = CHANNEL_ID;
  return trigger;
}

/**
 * Schedule a reading reminder.
 * @param {object} cfg
 *   cfg.mode     'daily' | 'weekly' | 'once'
 *   cfg.hour     0..23
 *   cfg.minute   0..59
 *   cfg.weekdays array of 1..7 (1 = Sunday … 7 = Saturday) — for 'weekly'
 *   cfg.date     ISO string — for 'once'
 * @returns {Promise<{ok:boolean, reason?:string}>}
 */
export async function scheduleReminder(cfg) {
  const { mode = 'daily', hour = 20, minute = 0, weekdays = [], date } = cfg || {};
  const granted = await requestPermission();
  if (!granted) return { ok: false, reason: 'permission' };

  const N = loadModule();
  await N.cancelAllScheduledNotificationsAsync();

  const Types = N.SchedulableTriggerInputTypes; // undefined on very old SDKs
  const content = {
    title: '📖 Reading time',
    body: 'Your Urdu novel is waiting — pick up where you left off.',
    sound: 'default',
  };

  try {
    if (mode === 'once' && date) {
      const when = new Date(date);
      when.setHours(hour, minute, 0, 0);
      // If the chosen moment is already in the past, don't schedule.
      if (when.getTime() <= Date.now()) return { ok: false, reason: 'past' };
      const trigger = buildTrigger(
        N,
        Types ? { type: Types.DATE, date: when } : { date: when }
      );
      await N.scheduleNotificationAsync({ content, trigger });
    } else if (mode === 'weekly' && weekdays && weekdays.length > 0 && weekdays.length < 7) {
      for (const wd of weekdays) {
        const trigger = buildTrigger(
          N,
          Types
            ? { type: Types.WEEKLY, weekday: wd, hour, minute }
            : { weekday: wd, hour, minute, repeats: true }
        );
        // eslint-disable-next-line no-await-in-loop
        await N.scheduleNotificationAsync({ content, trigger });
      }
    } else {
      // daily (also the fallback when weekly = all 7 days)
      const trigger = buildTrigger(
        N,
        Types ? { type: Types.DAILY, hour, minute } : { hour, minute, repeats: true }
      );
      await N.scheduleNotificationAsync({ content, trigger });
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: 'failed' };
  }
}

/** Fire a one-off local notification immediately (used to preview reminders). */
export async function sendTestNotification() {
  const granted = await requestPermission();
  if (!granted) return false;
  try {
    const N = loadModule();
    await N.scheduleNotificationAsync({
      content: {
        title: '📖 Reading time',
        body: 'This is how your reading reminder will look.',
        sound: 'default',
      },
      trigger: buildTrigger(N, { seconds: 1 }),
    });
    return true;
  } catch (e) {
    return false;
  }
}
