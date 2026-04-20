import {
  DEFAULT_LOCALE,
  HREFLANG_BY_LOCALE,
  LOCALE_COOKIE_NAME,
  LOCALE_LABELS,
  LOCALE_PROMPT_DISMISS_KEY,
  SUPPORTED_LOCALES,
  detectPreferredLocale,
  isSupportedLocale,
  resolveLocale,
  type AppLocale,
} from "@/lib/locale-config";

export {
  DEFAULT_LOCALE,
  HREFLANG_BY_LOCALE,
  LOCALE_COOKIE_NAME,
  LOCALE_LABELS,
  LOCALE_PROMPT_DISMISS_KEY,
  SUPPORTED_LOCALES,
  detectPreferredLocale,
  isSupportedLocale,
  resolveLocale,
};
export type { AppLocale };

type Dictionary = {
  home: string;
  tools: string;
  about: string;
  contact: string;
  backToTools: string;
  heroEyebrow: string;
  heroTitle: string;
  heroBody: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  heroSearchButton: string;
  heroSearchLabel: string;
  heroFeaturedLabel: string;
  searchPlaceholder: string;
  noToolsTitle: string;
  noToolsBody: string;
  sponsored: string;
  sponsoredBody: string;
  dropFileHelp: string;
  process: string;
  processing: string;
  uploading: string;
  processingApi: string;
  downloadReady: string;
  downloadAgain: string;
  downloadFile: string;
  safeBadge: string;
  safeFooter: string;
  rateFirst: string;
  rateTenth: string;
  rateSupport: string;
  close: string;
  exitIntentTitle: string;
  exitIntentBody: string;
  exitIntentPrimary: string;
  exitIntentSecondary: string;
};

const BASE_DICTIONARY: Dictionary = {
  home: "Home",
  tools: "All Tools",
  about: "About",
  contact: "Contact",
  backToTools: "Back to tools",
  heroEyebrow: "Global utility marketplace",
  heroTitle: "Financial document tools that feel clear, fast, and safe.",
  heroBody:
    "Work through PDF conversions, account statement cleanup, and finance calculations in one focused place without dashboard clutter.",
  heroPrimaryCta: "Explore tools",
  heroSecondaryCta: "Search tools",
  heroSearchButton: "Search",
  heroSearchLabel: "Find a tool fast",
  heroFeaturedLabel: "Featured tools",
  searchPlaceholder: "Search tools like Merge PDF, OCR PDF, or Account Statement to CSV",
  noToolsTitle: "No tools matched your search.",
  noToolsBody: "Try words like PDF, merge, OCR, or account statement.",
  sponsored: "Sponsored",
  sponsoredBody:
    "Reserved in-feed ad space for global sponsorships and premium placements.",
  dropFileHelp: "Drop your file here or use the button below.",
  process: "Process",
  processing: "Processing...",
  uploading: "Securing upload",
  processingApi: "Processing securely",
  downloadReady: "Download ready",
  downloadAgain: "Download Again",
  downloadFile: "Download your file",
  safeBadge:
    "Your files never leave this computer unless a cloud tool is enabled. Privacy-first processing stays on by default.",
  safeFooter: "No account data is stored on our servers. 100% secure processing.",
  rateFirst: "First time here? Rate your experience on Trustpilot.",
  rateTenth: "You're a pro now. Help us stay free by rating Logic Vault.",
  rateSupport: "A quick public review helps us keep the free tools growing.",
  close: "Close",
  exitIntentTitle: "Before you go...",
  exitIntentBody:
    "Bookmark Logic Vault or leave a quick rating so you can find your tools again fast.",
  exitIntentPrimary: "Rate on Trustpilot",
  exitIntentSecondary: "Keep Browsing",
};

const DICTIONARY: Partial<Record<AppLocale, Partial<Dictionary>>> = {
  es: {
    home: "Inicio",
    tools: "Todas las herramientas",
    about: "Acerca de",
    contact: "Contacto",
    backToTools: "Volver a las herramientas",
    searchPlaceholder:
      "Busca herramientas como Merge PDF, OCR PDF o Account Statement to CSV",
    noToolsTitle: "No encontramos herramientas para tu búsqueda.",
    noToolsBody: "Prueba palabras como PDF, merge, OCR o account statement.",
    sponsored: "Patrocinado",
    sponsoredBody:
      "Espacio reservado para patrocinios globales y ubicaciones premium.",
    dropFileHelp: "Suelta tu archivo aquí o usa el botón de abajo.",
    process: "Procesar",
    processing: "Procesando...",
    uploading: "Protegiendo archivo",
    processingApi: "Procesando de forma segura",
    downloadReady: "Descarga lista",
    downloadAgain: "Descargar otra vez",
    downloadFile: "Descarga tu archivo",
    safeBadge:
      "Tus archivos no salen de este equipo salvo que una herramienta en la nube esté activa. La privacidad local es el modo por defecto.",
    safeFooter: "No guardamos datos de cuentas en nuestros servidores. Procesamiento seguro.",
    rateFirst: "¿Primera vez aquí? Valora tu experiencia en Trustpilot.",
    rateTenth: "Ya eres un experto. Ayúdanos a seguir gratis con una valoración.",
    rateSupport: "Una reseña rápida nos ayuda a mantener estas herramientas gratis.",
    close: "Cerrar",
    exitIntentTitle: "Antes de irte...",
    exitIntentBody:
      "Guarda Logic Vault o deja una valoración rápida para volver a tus herramientas más tarde.",
    exitIntentPrimary: "Valorar en Trustpilot",
    exitIntentSecondary: "Seguir navegando",
  },
  fr: {
    home: "Accueil",
    tools: "Tous les outils",
    about: "À propos",
    contact: "Contact",
    backToTools: "Retour aux outils",
    searchPlaceholder:
      "Recherchez Merge PDF, OCR PDF ou Account Statement to CSV",
    noToolsTitle: "Aucun outil ne correspond à votre recherche.",
    noToolsBody: "Essayez des mots comme PDF, merge, OCR ou account statement.",
    sponsored: "Sponsorisé",
    sponsoredBody:
      "Emplacement publicitaire réservé aux sponsors mondiaux et aux placements premium.",
    dropFileHelp: "Déposez votre fichier ici ou utilisez le bouton ci-dessous.",
    process: "Traiter",
    processing: "Traitement...",
    uploading: "Sécurisation du fichier",
    processingApi: "Traitement sécurisé",
    downloadReady: "Téléchargement prêt",
    downloadAgain: "Télécharger à nouveau",
    downloadFile: "Télécharger votre fichier",
    safeBadge:
      "Vos fichiers restent sur cet appareil sauf si un outil cloud est activé. Le traitement local reste le mode par défaut.",
    safeFooter: "Aucune donnée de compte n’est stockée sur nos serveurs. Traitement sécurisé.",
    rateFirst: "Première visite ? Notez votre expérience sur Trustpilot.",
    rateTenth: "Vous êtes devenu un habitué. Aidez-nous à rester gratuits avec un avis.",
    rateSupport:
      "Un avis public rapide nous aide à faire grandir les outils gratuits.",
    close: "Fermer",
    exitIntentTitle: "Avant de partir...",
    exitIntentBody:
      "Ajoutez Logic Vault à vos favoris ou laissez un avis rapide pour retrouver vos outils facilement.",
    exitIntentPrimary: "Noter sur Trustpilot",
    exitIntentSecondary: "Continuer",
  },
  pt: {
    home: "Início",
    tools: "Todas as ferramentas",
    about: "Sobre",
    contact: "Contato",
    backToTools: "Voltar às ferramentas",
    searchPlaceholder:
      "Pesquise Merge PDF, OCR PDF ou Account Statement to CSV",
    noToolsTitle: "Nenhuma ferramenta corresponde à sua busca.",
    noToolsBody: "Tente palavras como PDF, merge, OCR ou account statement.",
    sponsored: "Patrocinado",
    sponsoredBody:
      "Espaço reservado para patrocinadores globais e posições premium.",
    dropFileHelp: "Solte seu arquivo aqui ou use o botão abaixo.",
    process: "Processar",
    processing: "Processando...",
    uploading: "Protegendo arquivo",
    processingApi: "Processando com segurança",
    downloadReady: "Download pronto",
    downloadAgain: "Baixar novamente",
    downloadFile: "Baixe seu arquivo",
    safeBadge:
      "Seus arquivos não saem deste computador, a menos que uma ferramenta em nuvem esteja ativa. O padrão continua sendo local e privado.",
    safeFooter: "Nenhum dado de conta é armazenado em nossos servidores. Processamento seguro.",
    rateFirst: "Primeira vez aqui? Avalie sua experiência no Trustpilot.",
    rateTenth: "Você já é profissional. Ajude-nos a continuar grátis com uma avaliação.",
    rateSupport:
      "Uma avaliação rápida ajuda a manter estas ferramentas gratuitas.",
    close: "Fechar",
    exitIntentTitle: "Antes de sair...",
    exitIntentBody:
      "Salve o Logic Vault nos favoritos ou deixe uma avaliação rápida para encontrar suas ferramentas depois.",
    exitIntentPrimary: "Avaliar no Trustpilot",
    exitIntentSecondary: "Continuar navegando",
  },
  zh: {
    home: "首页",
    tools: "全部工具",
    about: "关于",
    contact: "联系",
    backToTools: "返回工具",
    searchPlaceholder: "搜索 Merge PDF、OCR PDF 或 Account Statement to CSV",
    noToolsTitle: "没有找到匹配的工具。",
    noToolsBody: "试试 PDF、merge、OCR 或 account statement 这些词。",
    sponsored: "赞助",
    sponsoredBody: "这里预留给全球赞助位和高级广告位。",
    dropFileHelp: "把文件拖到这里，或使用下面的按钮。",
    process: "处理",
    processing: "处理中...",
    uploading: "正在上传到云端",
    processingApi: "正在由 API 处理",
    downloadReady: "可下载",
    downloadAgain: "再次下载",
    downloadFile: "下载文件",
    safeBadge:
      "除非启用了云工具，否则文件不会离开这台电脑。默认仍然是本地隐私处理。",
    safeFooter: "我们的服务器不会存储账户数据。100% 安全处理。",
    rateFirst: "第一次使用？欢迎在 Trustpilot 为我们评分。",
    rateTenth: "你已经是老用户了，欢迎留下评价帮助我们保持免费。",
    rateSupport: "一条简短公开评价就能帮助我们继续提供免费工具。",
    close: "关闭",
    exitIntentTitle: "离开前...",
    exitIntentBody: "把 Logic Vault 加入书签，或留下一个评分，方便下次快速回来。",
    exitIntentPrimary: "去 Trustpilot 评分",
    exitIntentSecondary: "继续浏览",
  },
  ar: {
    home: "الرئيسية",
    tools: "كل الأدوات",
    about: "حول",
    contact: "اتصل بنا",
    backToTools: "العودة إلى الأدوات",
    searchPlaceholder: "ابحث عن أدوات مثل Merge PDF أو OCR PDF أو Account Statement to CSV",
    noToolsTitle: "لم نجد أدوات مطابقة لبحثك.",
    noToolsBody: "جرّب كلمات مثل PDF أو merge أو OCR أو account statement.",
    sponsored: "ممول",
    sponsoredBody: "مساحة إعلانية مخصصة للرعاة العالميين والمواضع المميزة.",
    dropFileHelp: "اسحب ملفك هنا أو استخدم الزر أدناه.",
    process: "معالجة",
    processing: "جارٍ المعالجة...",
    uploading: "جارٍ تأمين الملف",
    processingApi: "جارٍ المعالجة بأمان",
    downloadReady: "التحميل جاهز",
    downloadAgain: "تنزيل مرة أخرى",
    downloadFile: "حمّل ملفك",
    safeBadge:
      "لن تغادر ملفاتك هذا الجهاز إلا إذا كانت أداة سحابية مفعلة. الوضع الافتراضي يبقى محلياً وخاصاً.",
    safeFooter: "لا نخزن بيانات الحسابات على خوادمنا. معالجة آمنة بالكامل.",
    rateFirst: "أول زيارة؟ قيّم تجربتك على Trustpilot.",
    rateTenth: "أصبحت خبيراً الآن. ساعدنا على البقاء مجاناً بتقييم سريع.",
    rateSupport: "مراجعة عامة سريعة تساعدنا على الاستمرار في تقديم الأدوات المجانية.",
    close: "إغلاق",
    exitIntentTitle: "قبل أن تذهب...",
    exitIntentBody:
      "أضف Logic Vault إلى المفضلة أو اترك تقييماً سريعاً لتعود إلى أدواتك بسهولة.",
    exitIntentPrimary: "قيّمنا على Trustpilot",
    exitIntentSecondary: "متابعة التصفح",
  },
  de: {
    home: "Start",
    tools: "Alle Tools",
    about: "Über uns",
    contact: "Kontakt",
    backToTools: "Zurück zu den Tools",
    noToolsTitle: "Keine Tools passen zu deiner Suche.",
    noToolsBody: "Versuche Begriffe wie PDF, OCR oder Kontoauszug.",
  },
  hi: {
    home: "होम",
    tools: "सभी टूल",
    about: "परिचय",
    contact: "संपर्क",
    backToTools: "टूल्स पर वापस जाएँ",
    noToolsTitle: "आपकी खोज से कोई टूल नहीं मिला।",
    noToolsBody: "PDF, OCR या account statement जैसे शब्द आज़माएँ।",
  },
  it: {
    home: "Home",
    tools: "Tutti gli strumenti",
    about: "Chi siamo",
    contact: "Contatti",
    backToTools: "Torna agli strumenti",
    noToolsTitle: "Nessuno strumento corrisponde alla tua ricerca.",
    noToolsBody: "Prova parole come PDF, OCR o estratto conto.",
  },
  ja: {
    home: "ホーム",
    tools: "すべてのツール",
    about: "概要",
    contact: "お問い合わせ",
    backToTools: "ツールに戻る",
    noToolsTitle: "検索に一致するツールが見つかりませんでした。",
    noToolsBody: "PDF、OCR、account statement などで試してください。",
  },
  nl: {
    home: "Home",
    tools: "Alle tools",
    about: "Over",
    contact: "Contact",
    backToTools: "Terug naar tools",
    noToolsTitle: "Geen tools gevonden voor je zoekopdracht.",
    noToolsBody: "Probeer woorden als PDF, OCR of account statement.",
  },
  id: {
    home: "Beranda",
    tools: "Semua alat",
    about: "Tentang",
    contact: "Kontak",
    backToTools: "Kembali ke alat",
    noToolsTitle: "Tidak ada alat yang cocok dengan pencarian Anda.",
    noToolsBody: "Coba kata seperti PDF, OCR, atau account statement.",
  },
  ko: {
    home: "홈",
    tools: "모든 도구",
    about: "소개",
    contact: "문의",
    backToTools: "도구로 돌아가기",
    noToolsTitle: "검색과 일치하는 도구가 없습니다.",
    noToolsBody: "PDF, OCR 또는 account statement 같은 단어를 시도해 보세요.",
  },
  tr: {
    home: "Ana Sayfa",
    tools: "Tum araclar",
    about: "Hakkinda",
    contact: "Iletisim",
    backToTools: "Araclara don",
    noToolsTitle: "Aramana uygun arac bulunamadi.",
    noToolsBody: "PDF, OCR veya account statement gibi kelimeler deneyin.",
  },
};

export function getLocaleFromPathname(pathname: string) {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  return firstSegment && isSupportedLocale(firstSegment) ? firstSegment : null;
}

export function localizePath(pathname: string, activeLocale: AppLocale | null) {
  if (!activeLocale) {
    return pathname;
  }

  return `/${activeLocale}${pathname === "/" ? "" : pathname}`;
}

export function buildAlternateLocalePaths(pathname: string) {
  return Object.fromEntries(
    Object.entries(HREFLANG_BY_LOCALE).flatMap(([locale, tags]) =>
      tags.map((tag) => [tag, `/${locale}${pathname === "/" ? "" : pathname}`])
    )
  );
}

export function getDictionary(locale: AppLocale | null) {
  return {
    ...BASE_DICTIONARY,
    ...(DICTIONARY[resolveLocale(locale)] ?? {}),
  };
}

export function persistLocalePreference(locale: AppLocale) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=31536000; samesite=lax`;
}
