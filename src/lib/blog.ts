import type { Locale } from '@/i18n/routing';

export interface BlogPostTranslation {
  title: string;
  excerpt: string;
  body: string[];
}

export interface BlogPost {
  slug: string;
  date: string;
  translations: Record<Locale, BlogPostTranslation>;
}

export const POSTS: BlogPost[] = [
  {
    slug: 'agriculture-en-israel-et-prophetie-biblique',
    date: '2024-11-02',
    translations: {
      fr: {
        title: "Semer des promesses : l'agriculture en Israël et la prophétie biblique",
        excerpt: "Comment le renouveau agricole de la Terre d'Israël fait écho aux promesses bibliques de restauration.",
        body: [
          "La terre d'Israël, longtemps décrite comme aride, connaît depuis plus d'un siècle un renouveau agricole remarquable. Vignobles, vergers et champs refleurissent là où la prophétie annonçait la restauration.",
          "Pour Jubilé, soutenir cette terre, c'est participer à une histoire qui dépasse l'agriculture : c'est honorer une promesse et préparer l'avenir. Nos vins, issus de cette terre, en sont le témoignage vivant.",
          "« Le désert et la terre aride se réjouiront ; la steppe sera dans l'allégresse et fleurira comme un narcisse » (Ésaïe 35:1)."
        ]
      },
      en: {
        title: "Sowing Promises: Agriculture in Israel and Biblical Prophecy",
        excerpt: "How the agricultural renewal of the Land of Israel echoes the biblical promises of restoration.",
        body: [
          "The land of Israel, long described as barren, has been undergoing a remarkable agricultural revival for more than a century. Vineyards, orchards, and fields are blooming where prophecy foretold restoration.",
          "For Jubilee, supporting this land means participating in a history that goes beyond agriculture: it is honoring a promise and preparing the future. Our wines, born from this land, are its living testimony.",
          "\"The desert and the parched land will be glad; the wilderness will rejoice and blossom like the crocus\" (Isaiah 35:1)."
        ]
      },
      es: {
        title: "Sembrar promesas: la agricultura en Israel y la profecía bíblica",
        excerpt: "Cómo el renacimiento agrícola de la Tierra de Israel se hace eco de las promesas bíblicas de restauración.",
        body: [
          "La tierra de Israel, descrita durante mucho tiempo como árida, experimenta desde hace más de un siglo un renacimiento agrícola notable. Viñedos, huertos y campos florecen donde la profecía anunciaba la restauración.",
          "Para Jubileo, apoyar esta tierra es participar en una historia que va más allá de la agricultura: es honrar una promesa y preparar el futuro. Nuestros vinos, nacidos de esta tierra, son su testimonio vivo.",
          "\"Se alegrarán el desierto y la soledad; el yermo se gozará y florecerá como la rosa\" (Isaías 35:1)."
        ]
      },
      he: {
        title: "לזרוע הבטחות: חקלאות בישראל ונבואה תנ\"כית",
        excerpt: "כיצד ההתחדשות החקלאית בארץ ישראל מהדהדת את ההבטחות המקראיות לשיקום.",
        body: [
          "אדמת ישראל, שתוארה במשך שנים רבות כשוממה, עוברת מזה למעלה ממאה שנה התחדשות חקלאית יוצאת דופן. כרמים, מטעים ושדות פורחים מחדש היכן שהנבואה בישרה על שיקום.",
          "עבור יוּבּל, תמיכה באדמה זו פירושה השתתפות בסיפור שחורג מעבר לחקלאות: זהו כיבוד של הבטחה והכנת העתיד. היינות שלנו, שמקורם באדמה זו, הם עדות חיה לכך.",
          "\"יְשֻׂשׂוּם מִדְבָּר וְצִיָּה וְתָגֵל עֲרָבָה וְתִפְרַח כַּחֲבַצָּלֶת\" (ישעיהו ל\"ה:א')."
        ]
      }
    }
  },
  {
    slug: 'restaurer-la-terre-restaurer-la-foi',
    date: '2024-10-15',
    translations: {
      fr: {
        title: "Restaurer la terre, restaurer la foi",
        excerpt: "Comment la redécouverte de la Terre Sainte fortifie la foi chrétienne contemporaine.",
        body: [
          "La Terre Sainte n'est pas seulement un lieu de mémoire : elle est un espace vivant où la foi se ravive. Marcher là où l'histoire biblique s'est déroulée transforme la lecture des Écritures.",
          "Jubilé œuvre à préserver ces lieux et à en transmettre le sens, pour que les générations futures puissent à leur tour s'y enraciner."
        ]
      },
      en: {
        title: "Restoring the Land, Restoring Faith",
        excerpt: "How the rediscovery of the Holy Land strengthens contemporary Christian faith.",
        body: [
          "The Holy Land is not just a place of memory: it is a living space where faith is revived. Walking where biblical history unfolded transforms the reading of Scripture.",
          "Jubilee works to preserve these places and transmit their meaning, so that future generations can in turn take root there."
        ]
      },
      es: {
        title: "Restaurar la tierra, restaurar la fe",
        excerpt: "Cómo el redescubrimiento de Tierra Santa fortalece la fe cristiana contemporánea.",
        body: [
          "Tierra Santa no es solo un lugar de memoria: es un espacio vivo donde la fe se reaviva. Caminar donde se desarrolló la historia bíblica transforma la lectura de las Escrituras.",
          "Jubileo trabaja para preservar estos lugares y transmitir su significado, para que las generaciones futuras puedan a su vez echar raíces en ellos."
        ]
      },
      he: {
        title: "לשקם את האדמה, לשקם את האמונה",
        excerpt: "כיצד הגילוי מחדש של הארץ הקדושה מחזק את האמונה המשיחית בת ימינו.",
        body: [
          "הארץ הקדושה אינה רק מקום של זיכרון: היא מרחב חי שבו האמונה מתעוררת לחיים. הליכה במקום שבו התרחשה ההיסטוריה המקראית משנה את קריאת כתבי הקודש.",
          "יוּבּל פועל לשימור מקומות אלו ולהעברת משמעותם, כדי שהדורות הבאים יוכלו להכות בהם שורש בתורם."
        ]
      }
    }
  },
  {
    slug: 'redemption-biblique-de-la-terre',
    date: '2024-09-20',
    translations: {
      fr: {
        title: "La rédemption biblique de la terre : d'Abraham à l'Israël moderne",
        excerpt: "Un fil rouge spirituel reliant la promesse faite à Abraham à la Terre d'aujourd'hui.",
        body: [
          "De la promesse faite à Abraham jusqu'à nos jours, la terre occupe une place centrale dans le récit biblique. Elle est don, héritage et signe de fidélité.",
          "Comprendre cette continuité éclaire l'engagement de Jubilé : servir la Terre Sainte, c'est s'inscrire dans une longue chaîne de transmission."
        ]
      },
      en: {
        title: "The Biblical Redemption of the Land: From Abraham to Modern Israel",
        excerpt: "A spiritual thread connecting the promise made to Abraham to the Land today.",
        body: [
          "From the promise made to Abraham to the present day, the land occupies a central place in the biblical narrative. It is a gift, a heritage, and a sign of faithfulness.",
          "Understanding this continuity sheds light on Jubilee's commitment: serving the Holy Land means being part of a long chain of transmission."
        ]
      },
      es: {
        title: "La redención bíblica de la tierra: de Abraham al Israel moderno",
        excerpt: "Un hilo conductor espiritual que conecta la promesa hecha a Abraham con la Tierra de hoy.",
        body: [
          "Desde la promesa hecha a Abraham hasta nuestros días, la tierra ocupa un lugar central en la narrativa bíblica. Es don, herencia y signo de fidelidad.",
          "Comprender esta continuidad ilumina el compromiso de Jubileo: servir a Tierra Santa es formar parte de una larga cadena de transmisión."
        ]
      },
      he: {
        title: "הגאולה המקראית של הארץ: מאברהם לישראל המודרנית",
        excerpt: "חוט שני רוחני המחבר בין ההבטחה שניתנה לאברהם לארץ של ימינו.",
        body: [
          "מההבטחה שניתנה לאברהם ועד ימינו, הארץ תופסת מקום מרכזי בסיפור המקראי. היא מתנה, מורשת וסימן לנאמנות.",
          "הבנת המשכיות זו מאירה את המחויבות של יוּבּל: לשרת את הארץ הקדושה פירושו להשתלב בשרשרת ארוכה של מסירה."
        ]
      }
    }
  },
  {
    slug: 'medias-evangeliques-et-soutien-a-israel',
    date: '2024-08-30',
    translations: {
      fr: {
        title: "L'influence des médias évangéliques et le soutien à Israël",
        excerpt: "Le rôle des médias dans la sensibilisation des communautés chrétiennes au lien avec Israël.",
        body: [
          "Les médias évangéliques ont profondément façonné la manière dont de nombreuses communautés chrétiennes perçoivent Israël et la Terre Sainte.",
          "Jubilé s'inscrit dans cette dynamique de sensibilisation, en privilégiant un discours authentique, respectueux et centré sur la mission."
        ]
      },
      en: {
        title: "The Influence of Evangelical Media and Support for Israel",
        excerpt: "The role of media in raising awareness among Christian communities of their connection to Israel.",
        body: [
          "Evangelical media have deeply shaped the way many Christian communities perceive Israel and the Holy Land.",
          "Jubilee is part of this awareness-raising dynamic, prioritizing authentic, respectful, and mission-centered discourse."
        ]
      },
      es: {
        title: "La influencia de los medios evangélicos y el apoyo a Israel",
        excerpt: "El papel de los medios de comunicación en la sensibilización de las comunidades cristianas sobre el vínculo con Israel.",
        body: [
          "Los medios evangélicos han dado una forma profunda a la manera en que muchas comunidades cristianas perciben a Israel y Tierra Santa.",
          "Jubileo se inscribe en esta dinámica de sensibilización, favoreciendo un discurso auténtico, respetuoso y centrado en la misión."
        ]
      },
      he: {
        title: "השפעת התקשורת האוונגליסטית והתמיכה בישראל",
        excerpt: "תפקידה של התקשורת בהעלאת המודעות בקרב קהילות נוצריות לזיקה לישראל.",
        body: [
          "התקשורת האוונגליסטית עיצבה באופן עמוק את האופן שבו קהילות נוצריות רבות תופסות את ישראל ואת הארץ הקדושה.",
          "יוּבּל משתלב בדינמיקה זו של העלאת מודעות, תוך מתן עדיפות לשיח אותנטי, מכבד וממוקד בשליחות."
        ]
      }
    }
  }
];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}
