import type { Locale } from '@/i18n/routing';

export type ProductCategory = 'vin-blanc' | 'vin-rouge' | 'vin-rose' | 'parchemins';

export interface ProductTranslation {
  name: string;
  short: string;
  long: string;
}

export interface Product {
  slug: string;
  category: ProductCategory;
  price: number; // en centimes (EUR)
  currency: 'EUR';
  stock: number;
  featured: boolean;
  customizable: boolean; // parchemins = saisie d'un texte personnalisé
  icon: 'wine' | 'scroll';
  gradient: string;
  image?: string;
  translations: Record<Locale, ProductTranslation>;
}

export const CATEGORY_ORDER: ProductCategory[] = ['vin-rouge', 'vin-blanc', 'vin-rose', 'parchemins'];

export const PRODUCTS: Product[] = [
  {
    slug: 'vin-rouge-galilee',
    category: 'vin-rouge',
    price: 2490,
    currency: 'EUR',
    stock: 120,
    featured: true,
    customizable: false,
    icon: 'wine',
    gradient: 'from-red-900/20 to-amber-700/10',
    image: '/images/wine-red-1.png',
    translations: {
      fr: { name: 'Vin rouge de Galilée', short: 'Un rouge profond, fruité et équilibré, né de la terre d\'Israël.', long: 'Issu des vignobles de Galilée, ce vin rouge révèle des arômes de fruits noirs et d\'épices douces. Élevé avec soin, il accompagne les grandes tables et les moments de partage. Chaque bouteille soutient la mission de Jubilé.' },
      en: { name: 'Galilee Red Wine', short: 'A deep, fruity and balanced red, born of the land of Israel.', long: 'From the vineyards of Galilee, this red wine reveals aromas of dark fruit and gentle spices. Carefully aged, it accompanies festive tables and moments of sharing. Every bottle supports Jubilee\'s mission.' },
      he: { name: 'יין אדום מהגליל', short: 'אדום עמוק, פירותי ומאוזן, מאדמת ישראל.', long: 'מכרמי הגליל, יין אדום זה חושף ניחוחות של פירות כהים ותבלינים עדינים. מיושן בקפידה, הוא מלווה שולחנות חג ורגעי שיתוף. כל בקבוק תומך בשליחות של יוּבּל.' },
      es: { name: 'Vino tinto de Galilea', short: 'Un tinto profundo, afrutado y equilibrado, de la tierra de Israel.', long: 'De los viñedos de Galilea, este vino tinto revela aromas de frutos negros y especias suaves. Criado con esmero, acompaña las grandes mesas y los momentos de compartir. Cada botella apoya la misión de Jubileo.' }
    }
  },
  {
    slug: 'vin-blanc-judee',
    category: 'vin-blanc',
    price: 2290,
    currency: 'EUR',
    stock: 90,
    featured: true,
    customizable: false,
    icon: 'wine',
    gradient: 'from-amber-200/30 to-secondary/10',
    image: '/images/wine-white.png',
    translations: {
      fr: { name: 'Vin blanc de Judée', short: 'Un blanc sec et lumineux, aux notes florales et minérales.', long: 'Cultivé sur les collines de Judée, ce vin blanc offre une fraîcheur élégante, des notes d\'agrumes et une belle minéralité. Idéal à l\'apéritif ou avec des mets délicats. Votre achat prolonge notre engagement en Terre Sainte.' },
      en: { name: 'Judea White Wine', short: 'A dry, luminous white with floral and mineral notes.', long: 'Grown on the hills of Judea, this white wine offers elegant freshness, citrus notes and lovely minerality. Perfect as an aperitif or with delicate dishes. Your purchase extends our commitment in the Holy Land.' },
      he: { name: 'יין לבן מיהודה', short: 'לבן יבש ובהיר, עם ניחוחות פרחוניים ומינרליים.', long: 'גדל על גבעות יהודה, יין לבן זה מציע רעננות אלגנטית, ניחוחות הדרים ומינרליות נאה. מושלם כאפריטיף או לצד מנות עדינות. רכישתכם ממשיכה את מחויבותנו בארץ הקדושה.' },
      es: { name: 'Vino blanco de Judea', short: 'Un blanco seco y luminoso, con notas florales y minerales.', long: 'Cultivado en las colinas de Judea, este vino blanco ofrece una frescura elegante, notas cítricas y una bella mineralidad. Ideal como aperitivo o con platos delicados. Su compra prolonga nuestro compromiso en Tierra Santa.' }
    }
  },
  {
    slug: 'vin-rose-sharon',
    category: 'vin-rose',
    price: 2190,
    currency: 'EUR',
    stock: 75,
    featured: false,
    customizable: false,
    icon: 'wine',
    gradient: 'from-pink-300/30 to-amber-200/10',
    image: '/images/wine-red-2.png',
    translations: {
      fr: { name: 'Vin rosé de Sharon', short: 'Un rosé délicat et fruité, parfait pour les beaux jours.', long: 'Né de la plaine de Sharon, ce rosé séduit par sa robe pâle, ses arômes de fruits rouges frais et sa finale tout en finesse. Une invitation à la convivialité, au service de la mission.' },
      en: { name: 'Sharon Rosé Wine', short: 'A delicate, fruity rosé, perfect for sunny days.', long: 'Born of the Sharon plain, this rosé charms with its pale hue, fresh red-fruit aromas and a refined finish. An invitation to conviviality, in service of the mission.' },
      he: { name: 'יין רוזה מהשרון', short: 'רוזה עדין ופירותי, מושלם לימים יפים.', long: 'נולד במישור השרון, רוזה זה מקסים בגוונו הבהיר, בניחוחות פירות אדומים רעננים ובסיומת מעודנת. הזמנה לחברותא, לשירות השליחות.' },
      es: { name: 'Vino rosado de Sharon', short: 'Un rosado delicado y afrutado, perfecto para los días soleados.', long: 'Nacido de la llanura de Sharon, este rosado seduce por su color pálido, sus aromas de frutos rojos frescos y un final lleno de finura. Una invitación a la convivencia, al servicio de la misión.' }
    }
  },
  {
    slug: 'parchemin-personnalise-jerusalem',
    category: 'parchemins',
    price: 8900,
    currency: 'EUR',
    stock: 25,
    featured: true,
    customizable: true,
    icon: 'scroll',
    gradient: 'from-amber-600/20 to-secondary/10',
    image: '/images/parchment-1.png',
    translations: {
      fr: { name: 'Parchemin personnalisé de Jérusalem', short: 'Un texte choisi, calligraphié à la main depuis Jérusalem.', long: 'Faites calligraphier à la main, depuis Jérusalem, le texte de votre choix — un verset, une bénédiction, un nom. Réalisé sur parchemin véritable par un artisan, c\'est un héritage unique à transmettre. La production est suivie pas à pas et confirmée par email.' },
      en: { name: 'Personalized Jerusalem Parchment', short: 'A chosen text, handwritten in Jerusalem.', long: 'Have the text of your choice handwritten in Jerusalem — a verse, a blessing, a name. Crafted on genuine parchment by an artisan, it is a unique heritage to pass on. Production is tracked step by step and confirmed by email.' },
      he: { name: 'מגילת קלף מותאמת אישית מירושלים', short: 'טקסט נבחר, נכתב בכתב יד מירושלים.', long: 'הזמינו כתיבה בכתב יד מירושלים של הטקסט שתבחרו — פסוק, ברכה או שם. מעוצב על קלף אמיתי בידי אומן, זוהי מורשת ייחודית להעברה. הייצור נמצא במעקב שלב אחר שלב ומאושר בדוא"ל.' },
      es: { name: 'Pergamino personalizado de Jerusalén', short: 'Un texto elegido, caligrafiado a mano desde Jerusalén.', long: 'Haga caligrafiar a mano, desde Jerusalén, el texto de su elección: un versículo, una bendición, un nombre. Realizado sobre pergamino auténtico por un artesano, es una herencia única para transmitir. La producción se sigue paso a paso y se confirma por correo.' }
    }
  }
];

export function getProductsByCategory(category: ProductCategory): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function formatPrice(cents: number, locale: Locale, currency: 'EUR' = 'EUR'): string {
  const localeMap: Record<Locale, string> = { fr: 'fr-FR', en: 'en-US', he: 'he-IL', es: 'es-ES' };
  return new Intl.NumberFormat(localeMap[locale], { style: 'currency', currency }).format(cents / 100);
}
