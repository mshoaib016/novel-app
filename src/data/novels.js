/**
 * ================================================================
 * NOVEL DATA FILE
 * ================================================================
 * Yahan aap apne novels ki details add karenge.
 *
 * PDF add karne ke 2 tareeqe hain:
 *
 * 1) LOCAL PDF (app ke andar bundled):
 *    - Apni PDF file "assets/pdfs" folder me copy karein
 *      e.g. assets/pdfs/novel1.pdf
 *    - Phir is tarah likhein:
 *        pdf: require("../../assets/pdfs/novel1.pdf")
 *
 * 2) REMOTE PDF (internet link se):
 *    - Seedha URL string de dein:
 *        pdf: "https://example.com/my-novel.pdf"
 *
 * Har novel ke extra fields (optional but recommended):
 *   type        : "pdf" (default) ya "text"
 *   content     : sirf type === "text" ke liye — poora Urdu text
 *   titleUrdu   : Urdu title (RTL) — nicer typography ke liye
 *   authorUrdu  : Urdu author name
 *   category    : "classic" | "romance" | "suspense" | "spiritual"
 *                 | "historical" | "shortstories" | "social" | "travel"
 *   featured    : true/false  -> Home "Featured" section
 *   popular     : true/false  -> Home "Popular" section
 *   pages       : approx page count (progress ke liye helpful)
 *   dateAdded   : "YYYY-MM-DD" -> "Recently Added" sorting
 *
 * ----------------------------------------------------------------
 * COVER PHOTOS KAISE ADD KAREIN  (apni cover photo lagane ka tareeqa)
 * ----------------------------------------------------------------
 * 1) Apni cover images is folder me rakhein:  assets/covers/
 *      e.g.  assets/covers/1.jpg   (novel id = 1 ke liye)
 *            assets/covers/2.jpg   (novel id = 2 ke liye)
 *            ... yehi tareeqa 12 tak.
 *      (JPG ya PNG dono chalega. Best size: ~600 x 860 px, portrait.)
 *
 * 2) Neeche har novel me "cover: null," ko badal kar us ka require likhein:
 *      cover: require('../../assets/covers/1.jpg'),   // <- id 1
 *
 *    Bas itna hi! Jis novel ka cover: null rahega us par app khud ek
 *    saaf gradient placeholder dikha dega (bina naam likhe).
 *
 * NOTE: require() sirf usi file par lagayein jo waqai mojood ho — agar file
 *       mojood na ho to app build error de ga. Jab tak photo add na karein,
 *       "cover: null" hi rehne dein.
 * ================================================================
 */

export const CATEGORIES = [
  { key: 'all', label: 'All', labelUrdu: 'سب', icon: 'library-outline' },
  { key: 'classic', label: 'Classic', labelUrdu: 'کلاسیک', icon: 'book-outline' },
  { key: 'romance', label: 'Romance', labelUrdu: 'رومانوی', icon: 'heart-outline' },
  { key: 'suspense', label: 'Suspense', labelUrdu: 'سسپنس', icon: 'flash-outline' },
  { key: 'spiritual', label: 'Spiritual', labelUrdu: 'روحانی', icon: 'moon-outline' },
  { key: 'historical', label: 'Historical', labelUrdu: 'تاریخی', icon: 'time-outline' },
  { key: 'shortstories', label: 'Short Stories', labelUrdu: 'افسانے', icon: 'documents-outline' },
  { key: 'social', label: 'Social', labelUrdu: 'سماجی', icon: 'people-outline' },
  { key: 'travel', label: 'Travelogue', labelUrdu: 'سفرنامہ', icon: 'airplane-outline' },
];

const novels = [
  {
    id: '1',
    type: 'pdf',
    title: 'Namal',
    titleUrdu: 'نمل',
    author: 'Nimra Ahmad',
    authorUrdu: 'نمرہ احمد',
    description:
      'Namal by Nimra Ahmed is counted among the finest suspense, crime, and spiritual thriller novels in Urdu literature.',
    category: 'suspense',
    featured: true,
    popular: true,
    pages: 1006,
    rating: 4.8,
    dateAdded: '2026-08-20',
    cover: require('../../assets/covers/Namal.png'),
    pdf: require('../../assets/pdfs/Namal novel by Nimra Ahmad.pdf'),
  },
  {
    id: '2',
    type: 'pdf',
    title: 'Mirat Ul Uroos',
    titleUrdu: 'مراۃ العروس',
    author: 'Deputy Nazeer Ahmad',
    authorUrdu: 'ڈپٹی نذیر احمد',
    description:
      'A classic of Urdu literature exploring domestic life and moral lessons, based on authentic reader opinions and Goodreads ratings.',
    category: 'classic',
    featured: false,
    popular: false,
    pages: 220,
    rating: 4.2,
    dateAdded: '2026-08-10',
    cover: require('../../assets/covers/Mirat Ul Uroos.png'),
    pdf: require('../../assets/pdfs/Mirat Ul Uroos By Deputy Nazeer Ahmad.pdf'),
  },
  {
    id: '3',
    type: 'pdf',
    title: 'Sarkash Novel',
    titleUrdu: 'سرکش',
    author: 'Mehmood Ahmed Moody',
    authorUrdu: 'محمود احمد مودی',
    description:
      'A unique story of human emotions, social attitudes, and love from Mahmood Ahmed Modi.',
    category: 'romance',
    featured: false,
    popular: false,
    pages: 480,
    rating: 4.1,
    dateAdded: '2026-07-28',
    cover: require('../../assets/covers/Sarkash Novel.png'),
    pdf: require('../../assets/pdfs/Sarkash Novel by Mehmood Ahmed Moody.pdf'),
  },
  {
    id: '4',
    type: 'pdf',
    title: 'PEER E KAMIL (P.B.U.H)',
    titleUrdu: 'پیرِ کامل',
    author: 'Umaira Ahmed',
    authorUrdu: 'عمیرہ احمد',
    description:
      'A masterpiece novel by Umera Ahmed — a story charting the journey from darkness to light, featuring Salar and Imama.',
    category: 'spiritual',
    featured: true,
    popular: true,
    pages: 558,
    rating: 4.9,
    dateAdded: '2026-08-22',
    cover: require('../../assets/covers/PEER E KAMIL (P.B.U.H).png'),
    pdf: require('../../assets/pdfs/PEER E KAMIL (P.B.U.H) NOVEL BY UMAIRA AHMED.pdf'),
  },
  {
    id: '5',
    type: 'pdf',
    title: 'RajaGidh',
    titleUrdu: 'راجہ گدھ',
    author: 'Bano Qudsia',
    authorUrdu: 'بانو قدسیہ',
    description:
      'Alongside its central narrative, this Urdu novel by Bano Qudsia presents a vision of a kingdom where vultures rule.',
    category: 'classic',
    featured: true,
    popular: true,
    pages: 462,
    rating: 4.7,
    dateAdded: '2026-08-05',
    cover: require('../../assets/covers/RajaGidh.png'),
    pdf: require('../../assets/pdfs/RajaGidhbyBanoQudsia.pdf'),
  },
  {
    id: '6',
    type: 'pdf',
    title: 'Udaas Naslain',
    titleUrdu: 'اداس نسلیں',
    author: 'Abdullah Hussain',
    authorUrdu: 'عبداللہ حسین',
    description:
      'This novel chronicles the events and circumstances of the British colonial era in India, a significant work of Urdu literature.',
    category: 'historical',
    featured: true,
    popular: false,
    pages: 470,
    rating: 4.5,
    dateAdded: '2026-07-15',
    cover: require('../../assets/covers/Udaas Naslain.png'),
    pdf: require('../../assets/pdfs/Udaas Naslain by Abdullah Hussain.pdf'),
  },
  {
    id: '7',
    type: 'pdf',
    title: 'Safreena',
    titleUrdu: 'سفرینہ',
    author: 'Ibn Naseer',
    authorUrdu: 'ابنِ نصیر',
    description: 'A masterpiece from the pen of Ibn Naseer.',
    category: 'suspense',
    featured: false,
    popular: false,
    pages: 600,
    rating: 4.3,
    dateAdded: '2026-06-30',
    cover: require('../../assets/covers/Safreena.png'),
    pdf: require('../../assets/pdfs/Safreena By Ibn e Naseer.pdf'),
  },
  {
    id: '8',
    type: 'pdf',
    title: "Manto's 100 Best Short Stories",
    titleUrdu: 'منٹو کے سو بہترین افسانے',
    author: 'Saadat Hasan Manto',
    authorUrdu: 'سعادت حسن منٹو',
    description:
      "A collection of one hundred of Saadat Hasan Manto's celebrated short stories.",
    category: 'shortstories',
    featured: false,
    popular: true,
    pages: 520,
    rating: 4.6,
    dateAdded: '2026-08-18',
    cover: require('../../assets/covers/Manto 100 Best Short Stories.jpg'),
    pdf: require('../../assets/pdfs/Manto’s 100 Best Short Stories By Saadat Hasan Manto.pdf'),
  },
  {
    id: '9',
    type: 'pdf',
    title: 'Hijaz Ki Aandhi',
    titleUrdu: 'حجاز کی آندھی',
    author: 'Inayatullah Altamash',
    authorUrdu: 'عنایت اللہ التمش',
    description:
      "A stirring saga that chronicles the Muslim advance into Persia and the shattering of Khosrow's arrogance.",
    category: 'historical',
    featured: false,
    popular: false,
    pages: 384,
    rating: 4.4,
    dateAdded: '2026-07-02',
    cover: require('../../assets/covers/Hijaz Ki Aandhi.jpg'),
    pdf: require('../../assets/pdfs/HijaazKiAandhi By Inayatullah Altamash.pdf'),
  },
  {
    id: '10',
    type: 'pdf',
    title: 'Lazzat-e-Sang',
    titleUrdu: 'لذتِ سنگ',
    author: 'Saadat Hasan Manto',
    authorUrdu: 'سعادت حسن منٹو',
    description:
      'A collection of Saadat Hassan Manto\'s famous short stories including "Boo" and others.',
    category: 'shortstories',
    featured: false,
    popular: false,
    pages: 210,
    rating: 4.2,
    dateAdded: '2026-06-20',
    cover: require('../../assets/covers/Lazzat-e-Sang.jpg'),
    pdf: require('../../assets/pdfs/Lazat-e-Sang_by_Saadat_Hassan_Manto.pdf'),
  },
  {
    id: '11',
    type: 'pdf',
    title: 'The Story of the Atrocities of 1947',
    titleUrdu: '۱۹۴۷ کے مظالم کی کہانی',
    author: 'Hakim Muhammad Tariq Mahmood',
    authorUrdu: 'حکیم محمد طارق محمود',
    description:
      'Detailing the atrocities inflicted upon innocent Muslims of the subcontinent during the migration of 1947.',
    category: 'historical',
    featured: false,
    popular: false,
    pages: 180,
    rating: 4.3,
    dateAdded: '2026-06-10',
    cover: require('../../assets/covers/The Story of the Atrocities of 1947.jpg'),
    pdf: require('../../assets/pdfs/1947 K MAZALIM KI KAHANI.pdf'),
  },
  {
    id: '12',
    type: 'pdf',
    title: 'Payar ka Pehla Shaher',
    titleUrdu: 'پیار کا پہلا شہر',
    author: 'Mustansar Hussain Tarrar',
    authorUrdu: 'مستنصر حسین تارڑ',
    description: 'A celebrated novel by Mustansar Hussain Tarrar.',
    category: 'travel',
    featured: false,
    popular: true,
    pages: 320,
    rating: 4.5,
    dateAdded: '2026-08-01',
    cover: require('../../assets/covers/Payar ka Pehla Shaher.jpg'),
    pdf: require('../../assets/pdfs/Pyar ka Pehla Shehar by Mustansar Hussain Tarar.pdf'),
  },
];

export default novels;
