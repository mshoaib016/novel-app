import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import ScreenHeader from '../components/ScreenHeader';
import FadeInView from '../components/FadeInView';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { SPACING, RADIUS, elevation } from '../theme/theme';

const APP_VERSION = '1.0.0';

/**
 * About / Privacy / Terms content screen.
 *
 * The `kind` route param ('about' | 'privacy' | 'terms') selects the page.
 * Each page has a gradient hero, a lead paragraph, icon-led section cards,
 * and a footer — fully bilingual (English + Urdu, RTL-aware) and animated.
 */
const CONTENT = {
  en: {
    ui: {
      version: 'Version',
      lastUpdated: 'Last updated',
      updatedDate: 'August 27, 2026',
      madeWith: 'Made with care for Urdu readers',
      appName: 'Urdu Novel Library',
    },
    about: {
      title: 'About',
      heroIcon: 'book',
      tagline: 'Read Urdu novels, beautifully — online or off.',
      intro:
        'Urdu Novel Library is a calm, modern home for reading and collecting Urdu literature. Browse a curated shelf, download the books you love, and read them anytime — even with no internet connection.',
      sections: [
        {
          icon: 'reader-outline',
          heading: 'A reader built for Urdu',
          body: 'Right-to-left typography with adjustable font family, size, line spacing, margins, and text alignment. Read in a smooth continuous scroll or turn the pages one by one.',
        },
        {
          icon: 'color-palette-outline',
          heading: 'Three reading themes',
          body: 'Switch between Light, Dark, and Sepia to suit the time of day, and dim the screen further with the in-app brightness control for comfortable night reading.',
        },
        {
          icon: 'cloud-offline-outline',
          heading: 'Truly offline',
          body: 'Once a novel is downloaded it lives on your device and opens instantly — no re-downloading and no data used. You can restrict downloads to Wi-Fi from Settings.',
        },
        {
          icon: 'bookmark-outline',
          heading: 'Bookmarks & progress',
          body: 'Your last reading position, page bookmarks, and overall progress are saved automatically, so you always pick up exactly where you left off.',
        },
        {
          icon: 'notifications-outline',
          heading: 'Reading reminders',
          body: 'Set a gentle daily, weekly, or one-time reminder to keep your reading habit going. Reminders are optional and fully under your control.',
        },
        {
          icon: 'lock-closed-outline',
          heading: 'Private by design',
          body: 'No account, no sign-up, and no tracking. Everything you read and save stays on your device.',
        },
      ],
    },
    privacy: {
      title: 'Privacy Policy',
      heroIcon: 'shield-checkmark',
      tagline: 'Your reading stays on your device.',
      intro:
        'We designed Urdu Novel Library to work entirely on your device. This policy explains, in plain language, what the app stores and why.',
      sections: [
        {
          icon: 'phone-portrait-outline',
          heading: 'Everything is stored locally',
          body: 'Downloaded novels, bookmarks, reading history, your reading position, and app settings are saved only on your device. They are never uploaded to us or shared with anyone.',
        },
        {
          icon: 'person-remove-outline',
          heading: 'No account, no tracking',
          body: 'The app does not require an account and does not collect personal information or analytics about what or how you read.',
        },
        {
          icon: 'wifi-outline',
          heading: 'When the internet is used',
          body: 'Your connection is used only to download a novel you choose and to show any cover images. You can limit downloads to Wi-Fi in Settings.',
        },
        {
          icon: 'notifications-outline',
          heading: 'Notifications',
          body: 'If you enable reading reminders, the app schedules them locally on your device using the system notification service. You can turn them off at any time.',
        },
        {
          icon: 'trash-outline',
          heading: 'You are in control',
          body: 'You can delete any download, clear your reading history, and clear cached files whenever you like from the Settings screen.',
        },
        {
          icon: 'people-outline',
          heading: "Children's privacy",
          body: 'The app does not knowingly collect any personal data from anyone, including children.',
        },
        {
          icon: 'refresh-outline',
          heading: 'Changes to this policy',
          body: 'If this policy is updated, the revised version will appear here with a new date.',
        },
      ],
    },
    terms: {
      title: 'Terms & Conditions',
      heroIcon: 'document-text',
      tagline: 'The simple rules for using this app.',
      intro:
        'By using Urdu Novel Library, you agree to these terms. We have kept them short and clear.',
      sections: [
        {
          icon: 'checkmark-circle-outline',
          heading: 'Acceptance',
          body: 'Using the app means you accept these terms. If you do not agree, please discontinue use.',
        },
        {
          icon: 'person-outline',
          heading: 'Personal, non-commercial use',
          body: 'The app and its content are provided for your personal reading. Please do not redistribute, resell, or use the content commercially.',
        },
        {
          icon: 'ribbon-outline',
          heading: 'Copyright & ownership',
          body: 'All novels remain the property of their respective authors and publishers. Please respect their intellectual property rights.',
        },
        {
          icon: 'information-circle-outline',
          heading: 'Content is provided "as is"',
          body: 'We aim for accurate, high-quality texts, but we cannot guarantee that every novel is complete or free of errors.',
        },
        {
          icon: 'construct-outline',
          heading: 'Availability may change',
          body: 'Features and the novel catalog may be added, changed, or removed over time. Offline availability depends on the novels you have downloaded.',
        },
        {
          icon: 'warning-outline',
          heading: 'Limitation of liability',
          body: 'The app is provided without warranties of any kind. To the extent permitted by law, we are not liable for any loss arising from its use.',
        },
        {
          icon: 'mail-outline',
          heading: 'Contact',
          body: 'Questions about these terms? Reach us from Settings → Contact Us.',
        },
      ],
    },
  },
  ur: {
    ui: {
      version: 'ورژن',
      lastUpdated: 'آخری تازہ کاری',
      updatedDate: '۲۷ اگست ۲۰۲۶',
      madeWith: 'اردو قارئین کے لیے محبت سے بنایا گیا',
      appName: 'اردو ناول لائبریری',
    },
    about: {
      title: 'ایپ کے بارے میں',
      heroIcon: 'book',
      tagline: 'اردو ناول خوبصورتی سے پڑھیں — آن لائن یا آف لائن۔',
      intro:
        'اردو ناول لائبریری اردو ادب پڑھنے اور محفوظ کرنے کے لیے ایک پُرسکون، جدید گھر ہے۔ منتخب شیلف دیکھیں، پسندیدہ کتابیں ڈاؤن لوڈ کریں اور انہیں کسی بھی وقت، انٹرنیٹ کے بغیر بھی پڑھیں۔',
      sections: [
        {
          icon: 'reader-outline',
          heading: 'اردو کے لیے بنایا گیا ریڈر',
          body: 'دائیں سے بائیں خطاطی کے ساتھ فونٹ، سائز، سطروں کا فاصلہ، حاشیے اور ترتیبِ متن قابلِ ترمیم۔ ہموار اسکرول میں پڑھیں یا صفحہ بہ صفحہ پلٹیں۔',
        },
        {
          icon: 'color-palette-outline',
          heading: 'تین ریڈنگ تھیمز',
          body: 'دن کے وقت کے مطابق روشن، تاریک یا سیپیا تھیم منتخب کریں، اور رات کو آرام دہ مطالعے کے لیے اِن ایپ برائٹنس سے اسکرین مزید مدھم کریں۔',
        },
        {
          icon: 'cloud-offline-outline',
          heading: 'مکمل آف لائن',
          body: 'ایک بار ڈاؤن لوڈ ہونے کے بعد ناول آپ کے آلے پر رہتا ہے اور فوراً کھلتا ہے — نہ دوبارہ ڈاؤن لوڈ، نہ ڈیٹا خرچ۔ چاہیں تو ترتیبات سے ڈاؤن لوڈ کو صرف وائی فائی تک محدود کریں۔',
        },
        {
          icon: 'bookmark-outline',
          heading: 'بک مارکس اور پیش رفت',
          body: 'آپ کی آخری پوزیشن، صفحے کے بک مارکس اور مجموعی پیش رفت خودبخود محفوظ ہوتی ہے، تاکہ آپ ہمیشہ وہیں سے شروع کریں جہاں چھوڑا تھا۔',
        },
        {
          icon: 'notifications-outline',
          heading: 'مطالعے کی یاد دہانی',
          body: 'اپنی عادت برقرار رکھنے کے لیے روزانہ، ہفتہ وار یا ایک بار کی نرم یاد دہانی مقرر کریں۔ یہ اختیاری ہے اور مکمل طور پر آپ کے کنٹرول میں۔',
        },
        {
          icon: 'lock-closed-outline',
          heading: 'رازداری بنیاد میں',
          body: 'نہ اکاؤنٹ، نہ سائن اپ، نہ ٹریکنگ۔ آپ جو پڑھتے اور محفوظ کرتے ہیں وہ آپ کے آلے پر ہی رہتا ہے۔',
        },
      ],
    },
    privacy: {
      title: 'رازداری کی پالیسی',
      heroIcon: 'shield-checkmark',
      tagline: 'آپ کا مطالعہ آپ کے آلے پر رہتا ہے۔',
      intro:
        'ہم نے اردو ناول لائبریری کو مکمل طور پر آپ کے آلے پر کام کرنے کے لیے بنایا ہے۔ یہ پالیسی سادہ الفاظ میں بتاتی ہے کہ ایپ کیا محفوظ کرتی ہے اور کیوں۔',
      sections: [
        {
          icon: 'phone-portrait-outline',
          heading: 'سب کچھ آلے پر محفوظ',
          body: 'ڈاؤن لوڈ کیے گئے ناول، بک مارکس، مطالعہ کی تاریخ، پڑھنے کی پوزیشن اور ترتیبات صرف آپ کے آلے پر محفوظ ہوتی ہیں۔ یہ ہمیں نہیں بھیجی جاتیں اور نہ کسی کے ساتھ شیئر ہوتی ہیں۔',
        },
        {
          icon: 'person-remove-outline',
          heading: 'نہ اکاؤنٹ، نہ ٹریکنگ',
          body: 'ایپ کے لیے اکاؤنٹ ضروری نہیں، اور یہ اس بارے میں کوئی ذاتی معلومات یا اعداد و شمار جمع نہیں کرتی کہ آپ کیا یا کیسے پڑھتے ہیں۔',
        },
        {
          icon: 'wifi-outline',
          heading: 'انٹرنیٹ کب استعمال ہوتا ہے',
          body: 'آپ کا کنکشن صرف اُس ناول کو ڈاؤن لوڈ کرنے اور کور تصاویر دکھانے کے لیے استعمال ہوتا ہے جو آپ منتخب کریں۔ آپ ڈاؤن لوڈ کو وائی فائی تک محدود کر سکتے ہیں۔',
        },
        {
          icon: 'notifications-outline',
          heading: 'نوٹیفیکیشنز',
          body: 'اگر آپ یاد دہانیاں آن کریں تو ایپ انہیں سسٹم نوٹیفیکیشن سروس کے ذریعے آپ کے آلے پر مقامی طور پر شیڈول کرتی ہے۔ آپ انہیں کسی بھی وقت بند کر سکتے ہیں۔',
        },
        {
          icon: 'trash-outline',
          heading: 'اختیار آپ کے پاس',
          body: 'آپ کسی بھی وقت ترتیبات سے کوئی بھی ڈاؤن لوڈ حذف کر سکتے ہیں، مطالعہ کی تاریخ اور کیشے صاف کر سکتے ہیں۔',
        },
        {
          icon: 'people-outline',
          heading: 'بچوں کی رازداری',
          body: 'ایپ کسی سے بھی، بشمول بچوں، جان بوجھ کر کوئی ذاتی معلومات جمع نہیں کرتی۔',
        },
        {
          icon: 'refresh-outline',
          heading: 'پالیسی میں تبدیلی',
          body: 'اگر یہ پالیسی اپ ڈیٹ ہوئی تو نظرثانی شدہ نسخہ نئی تاریخ کے ساتھ یہاں ظاہر ہوگا۔',
        },
      ],
    },
    terms: {
      title: 'شرائط و ضوابط',
      heroIcon: 'document-text',
      tagline: 'اس ایپ کے استعمال کے سادہ اصول۔',
      intro:
        'اردو ناول لائبریری استعمال کرنے سے آپ ان شرائط سے اتفاق کرتے ہیں۔ ہم نے انہیں مختصر اور واضح رکھا ہے۔',
      sections: [
        {
          icon: 'checkmark-circle-outline',
          heading: 'قبولیت',
          body: 'ایپ کا استعمال ان شرائط کی قبولیت ہے۔ اگر آپ متفق نہیں تو براہِ کرم استعمال بند کر دیں۔',
        },
        {
          icon: 'person-outline',
          heading: 'ذاتی، غیر تجارتی استعمال',
          body: 'ایپ اور اس کا مواد آپ کے ذاتی مطالعے کے لیے ہے۔ براہِ کرم مواد کو دوبارہ تقسیم، فروخت یا تجارتی طور پر استعمال نہ کریں۔',
        },
        {
          icon: 'ribbon-outline',
          heading: 'حقوقِ اشاعت و ملکیت',
          body: 'تمام ناول اپنے متعلقہ مصنفین اور ناشرین کی ملکیت ہیں۔ براہِ کرم ان کے حقوقِ دانش کا احترام کریں۔',
        },
        {
          icon: 'information-circle-outline',
          heading: 'مواد جوں کا توں',
          body: 'ہم معیاری اور درست متن کی کوشش کرتے ہیں، مگر اس بات کی ضمانت نہیں دیتے کہ ہر ناول مکمل یا غلطیوں سے پاک ہے۔',
        },
        {
          icon: 'construct-outline',
          heading: 'دستیابی بدل سکتی ہے',
          body: 'خصوصیات اور ناولوں کی فہرست وقت کے ساتھ شامل، تبدیل یا ختم ہو سکتی ہے۔ آف لائن دستیابی اُن ناولوں پر منحصر ہے جو آپ نے ڈاؤن لوڈ کیے ہوں۔',
        },
        {
          icon: 'warning-outline',
          heading: 'ذمہ داری کی حد',
          body: 'ایپ بغیر کسی ضمانت کے فراہم کی جاتی ہے۔ قانون کی اجازت کی حد تک، اس کے استعمال سے ہونے والے کسی نقصان کے ہم ذمہ دار نہیں۔',
        },
        {
          icon: 'mail-outline',
          heading: 'رابطہ',
          body: 'ان شرائط کے بارے میں سوالات؟ ترتیبات ← ہم سے رابطہ سے رابطہ کریں۔',
        },
      ],
    },
  },
};

export default function InfoScreen({ route }) {
  const { colors } = useTheme();
  const { settings, isRTL } = useSettings();
  const insets = useSafeAreaInsets();

  const kind = route.params?.kind || 'about';
  const lang = CONTENT[settings.language] ? settings.language : 'en';
  const data = CONTENT[lang][kind] || CONTENT[lang].about;
  const ui = CONTENT[lang].ui;

  const textAlign = isRTL ? 'right' : 'left';
  const writingDirection = isRTL ? 'rtl' : 'ltr';
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const chipSpacing = isRTL ? { marginLeft: SPACING.md } : { marginRight: SPACING.md };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={data.title} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: SPACING.lg,
          paddingBottom: SPACING.xxl + insets.bottom,
        }}
      >
        {/* ---- Hero banner ---- */}
        <FadeInView offset={16}>
          <LinearGradient
            colors={[colors.primaryLight, colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.hero, elevation(colors, 4)]}
          >
            <View style={styles.heroIconWrap}>
              <Ionicons name={data.heroIcon} size={34} color="#FFFFFF" />
            </View>
            <Text style={styles.heroTitle}>{data.title}</Text>
            <Text style={styles.heroTagline}>{data.tagline}</Text>
          </LinearGradient>
        </FadeInView>

        {/* ---- Lead paragraph ---- */}
        <FadeInView delay={70} offset={14}>
          <Text style={[styles.intro, { color: colors.textMuted, textAlign, writingDirection }]}>
            {data.intro}
          </Text>
        </FadeInView>

        {/* ---- Section cards ---- */}
        {data.sections.map((s, i) => (
          <FadeInView key={i} delay={130 + i * 70} offset={14}>
            <View
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border, flexDirection: rowDirection },
                elevation(colors, 2),
              ]}
            >
              <View style={[styles.chip, chipSpacing, { backgroundColor: colors.primary + '1A' }]}>
                <Ionicons name={s.icon} size={20} color={colors.primary} />
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.cardHeading, { color: colors.text, textAlign, writingDirection }]}>
                  {s.heading}
                </Text>
                <Text style={[styles.cardBody, { color: colors.textMuted, textAlign, writingDirection }]}>
                  {s.body}
                </Text>
              </View>
            </View>
          </FadeInView>
        ))}

        {/* ---- Footer ---- */}
        <FadeInView delay={130 + data.sections.length * 70 + 40} offset={10}>
          <View style={styles.footer}>
            {kind === 'about' ? (
              <>
                <View style={[styles.versionPill, { backgroundColor: colors.surfaceAlt }]}>
                  <Ionicons name="pricetag-outline" size={13} color={colors.textMuted} />
                  <Text style={[styles.versionText, { color: colors.textMuted }]}>
                    {ui.version} {APP_VERSION}
                  </Text>
                </View>
                <Text style={[styles.footerNote, { color: colors.textFaint }]}>{ui.madeWith}</Text>
              </>
            ) : (
              <Text style={[styles.footerNote, { color: colors.textFaint }]}>
                {ui.lastUpdated}: {ui.updatedDate}
              </Text>
            )}
          </View>
        </FadeInView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  heroIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  heroTagline: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  intro: {
    fontSize: 15.5,
    lineHeight: 25,
    marginBottom: SPACING.lg,
  },
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'flex-start',
  },
  chip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 5,
  },
  cardBody: {
    fontSize: 14.5,
    lineHeight: 23,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  versionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    marginBottom: SPACING.sm,
  },
  versionText: {
    fontSize: 12.5,
    fontWeight: '600',
    marginLeft: 6,
  },
  footerNote: {
    fontSize: 12.5,
    textAlign: 'center',
  },
});
