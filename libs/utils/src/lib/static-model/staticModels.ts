import { IsoTerritoriesToSlugAndLabel } from "./territories-ISO-3166";

const models = {
  'GENRES': [
    { 'slug': 'comedy', 'label': 'Comedy' },
    { 'slug': 'drama', 'label': 'Drama' },
    { 'slug': 'action', 'label': 'Action' },
    { 'slug': 'horror', 'label': 'Horror' },
    { 'slug': 'science-fiction', 'label': 'Science Fiction' },
    { 'slug': 'thriller', 'label': 'Thriller' },
    { 'slug': 'coming-of-age', 'label': 'Coming of Age' },
    { 'slug': 'fantasy', 'label': 'Fantasy' },
    { 'slug': 'romance', 'label': 'Romance' },
    { 'slug': 'western', 'label': 'Western' },
    { 'slug': 'period-piece', 'label': 'Period Piece' },
    { 'slug': 'adventure', 'label': 'Adventure' },
    { 'slug': 'biography', 'label': 'Biography' },
    { 'slug': 'war', 'label': 'War' },
    { 'slug': 'police', 'label': 'Police' },
    { 'slug': 'animation', 'label': 'Animation' },
    { 'slug': 'documentary', 'label': 'Documentary' },
    { 'slug': 'erotic', 'label': 'Erotic' },
    { 'slug': 'tv-show', 'label': 'TV Show' },
    { 'slug': 'web-series', 'label': 'Web Series' },
    { 'slug': 'virtual-reality', 'label': 'Virtual Reality' },
    { 'slug': 'family', 'label': 'Family' },
    { 'slug': 'other', 'label': 'Other' }
  ] as const,
  'PROMOTIONAL_ELEMENT_TYPES': [
    { 'slug': 'trailer', 'label': 'Trailer' },
    { 'slug': 'poster', 'label': 'Poster' },
    { 'slug': 'banner', 'label': 'Banner' },
    { 'slug': 'still_photo', 'label': 'Stills' },
    { 'slug': 'presentation_deck', 'label': 'Presentation deck' },
    { 'slug': 'scenario', 'label': 'Scenario' },
    { 'slug': 'promo_reel_link', 'label': 'Promo reel link' },
    { 'slug': 'screener_link', 'label': 'Screener link' },
    { 'slug': 'trailer_link', 'label': 'Trailer link' },
    { 'slug': 'teaser_link', 'label': 'Teaser link' },
  ] as const,
  'LEGAL_DOCUMENT_TYPES': [
    { 'slug': 'chain_of_titles', 'label': 'Chain of titles' },
    { 'slug': 'invoices', 'label': 'Invoices' },
    { 'slug': 'bill', 'label': 'Bill' },
  ] as const,
  'RESOURCE_SIZES': [
    { 'slug': 'medium', 'label': 'Medium' },
    { 'slug': 'small', 'label': 'Small' },
    { 'slug': 'large', 'label': 'Large' },
    { 'slug': 'thumbnail', 'label': 'Thumbnail' },
  ] as const,
  'RESOURCE_RATIOS': [
    { 'slug': '16/9', 'label': '16:9' },
    { 'slug': '4/3', 'label': '4:3' },
    { 'slug': 'round', 'label': 'Round' },
    { 'slug': 'square', 'label': 'Square' },
    { 'slug': 'rectangle', 'label': 'Rectangle' },
  ] as const,
  'STAKEHOLDER_ROLES': [
    {
      'slug': 'executive-producer',
      'label': 'Executive Producer'
    },
    {
      'slug': 'co-producer',
      'label': 'Co-Producer'
    },
    {
      'slug': 'line-producer',
      'label': 'Line Producer'
    },
    {
      'slug': 'distributor',
      'label': 'Distributor'
    },
    {
      'slug': 'sales-agent',
      'label': 'Sales Agent'
    },
    {
      'slug': 'laboratory',
      'label': 'Laboratory'
    },
    {
      'slug': 'financier',
      'label': 'Financier'
    },
    {
      'slug': 'broadcaster-coproducer',
      'label': 'Broadcaster coproducer'
    }
  ] as const,
  'STAKEHOLDER_DELIVERY_AUTHORIZATIONS': [
    {
      'slug': 'canValidateDelivery',
      'label': 'Can validate delivery'
    },
    {
      'slug': 'canModifyDelivery',
      'label': 'Can add, remove and edit materials'
    },
    {
      'slug': 'canDeliverMaterial',
      'label': 'Can deliver materials'
    },
    {
      'slug': 'canAcceptMaterial',
      'label': 'Can accept materials'
    },
    {
      'slug': 'canRefuseMaterial',
      'label': 'Can refuse materials'
    }
  ],
  'PRODUCER_ROLES': [
    {
      'slug': 'exectuive-producer',
      'label': 'Executive Producer'
    },
    {
      'slug': 'line-producer',
      'label': 'Line Producer'
    },
    {
      'slug': 'associate-producer',
      'label': 'Associate Producer'
    },
    {
      'slug': 'production-manager',
      'label': 'Production Manager'
    },
  ],
  'CAST_ROLES': [
    {
      'slug': 'lead-role',
      'label': 'Lead Role'
    },
    {
      'slug': 'secondary-role',
      'label': 'Secondary Role'
    }
  ],
  'CREW_ROLES': [
    {
      'slug': 'writer',
      'label': 'Writer'
    }, {
      'slug': 'score-composer',
      'label': 'Score Composer'
    },
    {
      'slug': 'dialogue-writer',
      'label': 'Dialogue Writer'
    },
    {
      'slug': 'director-of-photography',
      'label': 'Director of Photography'
    },
    {
      'slug': 'editor',
      'label': 'Editor'
    },
    {
      'slug': 'casting-director',
      'label': 'Casting Director'
    },
    {
      'slug': 'artistic-director',
      'label': 'Artistic Director'
    },
    {
      'slug': 'costume-designer',
      'label': 'Costume Designer'
    },
    {
      'slug': 'make-up-artist',
      'label': 'Make-Up Artist'
    },
    {
      'slug': 'production-designer',
      'label': 'Production Designer'
    },
    {
      'slug': 'first-assistant-director',
      'label': '1st Assistant Director'
    },
    {
      'slug': 'second-assistant-director',
      'label': '2nd Assistant Director'
    },
    {
      'slug': 'post-production-director',
      'label': 'Post-Production Director'
    },
    {
      'slug': 'original-author',
      'label': 'Original Author'
    }
  ],
  'MOVIE_STATUS': [
    {
      'slug': 'financing',
      'label': 'Pre-production'
    },
    {
      'slug': 'shooting',
      'label': 'In Production'
    },
    {
      'slug': 'post-production',
      'label': 'Post-production'
    },
    {
      'slug': 'finished',
      'label': 'Completed'
    }
  ] as const,
  'LANGUAGES': [ // @TODO (#1388) transform to RFC-5646
    { 'slug': 'albanian', 'label': 'Albanian' },
    { 'slug': 'arabic', 'label': 'Arabic' },
    { 'slug': 'armenian', 'label': 'Armenian' },
    { 'slug': 'azerbaijani', 'label': 'Azerbaijani' },
    { 'slug': 'bambara', 'label': 'Bambara' },
    { 'slug': 'basque', 'label': 'Basque' },
    { 'slug': 'belarussian', 'label': 'Belarussian' },
    { 'slug': 'bengali', 'label': 'Bengali' },
    { 'slug': 'bosnian', 'label': 'Bosnian' },
    { 'slug': 'bulgarian', 'label': 'Bulgarian' },
    { 'slug': 'burmese', 'label': 'Burmese' },
    { 'slug': 'cantonese', 'label': 'Cantonese' },
    { 'slug': 'catalan', 'label': 'Catalan' },
    { 'slug': 'croatian', 'label': 'Croatian' },
    { 'slug': 'czech', 'label': 'Czech' },
    { 'slug': 'danish', 'label': 'Danish' },
    { 'slug': 'dutch', 'label': 'Dutch' },
    { 'slug': 'english', 'label': 'English' },
    { 'slug': 'estonian', 'label': 'Estonian' },
    { 'slug': 'filipino', 'label': 'Filipino' },
    { 'slug': 'finnish', 'label': 'Finnish' },
    { 'slug': 'flemish', 'label': 'Flemish' },
    { 'slug': 'french', 'label': 'French' },
    { 'slug': 'gaelic', 'label': 'Gaelic' },
    { 'slug': 'galician', 'label': 'Galician' },
    { 'slug': 'georgian', 'label': 'Georgian' },
    { 'slug': 'german', 'label': 'German' },
    { 'slug': 'greek', 'label': 'Greek' },
    { 'slug': 'gujarati', 'label': 'Gujarati' },
    { 'slug': 'hebrew', 'label': 'Hebrew' },
    { 'slug': 'hindi', 'label': 'Hindi' },
    { 'slug': 'hungarian', 'label': 'Hungarian' },
    { 'slug': 'icelandic', 'label': 'Icelandic' },
    { 'slug': 'indonesian', 'label': 'Indonesian' },
    { 'slug': 'italian', 'label': 'Italian' },
    { 'slug': 'japanese', 'label': 'Japanese' },
    { 'slug': 'javanese', 'label': 'Javanese' },
    { 'slug': 'kannada', 'label': 'Kannada' },
    { 'slug': 'kazakh', 'label': 'Kazakh' },
    { 'slug': 'khmer', 'label': 'Khmer' },
    { 'slug': 'korean', 'label': 'Korean' },
    { 'slug': 'kosovan', 'label': 'Kosovan' },
    { 'slug': 'kurdish', 'label': 'Kurdish' },
    { 'slug': 'kyrgyz', 'label': 'Kyrgyz' },
    { 'slug': 'laotian', 'label': 'Laotian' },
    { 'slug': 'latvian', 'label': 'Latvian' },
    { 'slug': 'lingala', 'label': 'Lingala' },
    { 'slug': 'lithuanian', 'label': 'Lithuanian' },
    { 'slug': 'macedonian', 'label': 'Macedonian' },
    { 'slug': 'malayalam', 'label': 'Malayalam' },
    { 'slug': 'maltese', 'label': 'Maltese' },
    { 'slug': 'mandarin-chinese', 'label': 'Mandarin Chinese' },
    { 'slug': 'marathi', 'label': 'Marathi' },
    { 'slug': 'moldavian', 'label': 'Moldavian' },
    { 'slug': 'montenegrin', 'label': 'Montenegrin' },
    { 'slug': 'norwegian', 'label': 'Norwegian' },
    { 'slug': 'oriya', 'label': 'Oriya' },
    { 'slug': 'panjabi', 'label': 'Panjabi' },
    { 'slug': 'persian', 'label': 'Persian' },
    { 'slug': 'polish', 'label': 'Polish' },
    { 'slug': 'portuguese', 'label': 'Portuguese' },
    { 'slug': 'romanian', 'label': 'Romanian' },
    { 'slug': 'russian', 'label': 'Russian' },
    { 'slug': 'serbian', 'label': 'Serbian' },
    { 'slug': 'slovak', 'label': 'Slovak' },
    { 'slug': 'slovene', 'label': 'Slovene' },
    { 'slug': 'spanish', 'label': 'Spanish' },
    { 'slug': 'swahili', 'label': 'Swahili' },
    { 'slug': 'swedish', 'label': 'Swedish' },
    { 'slug': 'tajiki', 'label': 'Tajiki' },
    { 'slug': 'tamil', 'label': 'Tamil' },
    { 'slug': 'telugu', 'label': 'Telugu' },
    { 'slug': 'tetum', 'label': 'Tetum' },
    { 'slug': 'thai', 'label': 'Thai' },
    { 'slug': 'turkish', 'label': 'Turkish' },
    { 'slug': 'turkmen', 'label': 'Turkmen' },
    { 'slug': 'ukrainian', 'label': 'Ukrainian' },
    { 'slug': 'urdu', 'label': 'Urdu' },
    { 'slug': 'uzbek', 'label': 'Uzbek' },
    { 'slug': 'valencian', 'label': 'Valencian' },
    { 'slug': 'vietnamese', 'label': 'Vietnamese' },
    { 'slug': 'welsh', 'label': 'Welsh' },
  ] as const,
  'MOVIE_CURRENCIES': [
    {
      'slug': 'us-dollar',
      'label': 'US dollar',
      'code': 'USD'
    },
    {
      'slug': 'euro',
      'label': 'Euro',
      'code': 'EUR'
    },
    {
      'slug': 'japanese-yen',
      'label': 'Japanese yen',
      'code': 'JPY'
    },
    {
      'slug': 'pound-sterling',
      'label': 'Pound sterling',
      'code': 'GBP'
    },
    {
      'slug': 'australian-dollar',
      'label': 'Australian Dollar',
      'code': 'AUD'
    },
    {
      'slug': 'canadian-dollar',
      'label': 'Canadian Dollar',
      'code': 'CAD'
    },
    {
      'slug': 'swiss-franc',
      'label': 'Swiss Franc',
      'code': 'CHF'
    },
    {
      'slug': 'chinese-renminbi',
      'label': 'Chinese Renminbi',
      'code': 'CNY'
    },
    {
      'slug': 'swedish-krona',
      'label': 'Swedish krona',
      'code': 'SEK'
    },
    {
      'slug': 'new-zealand-dollar',
      'label': 'New Zealand dollar',
      'code': 'NZD'
    }
  ] as const,
  'SELECTION_CATEGORIES': [
    {
      'slug': 'prestige-directors',
      'label': 'Prestige Directors'
    },
    {
      'slug': 'producers-network',
      'label': 'Producers Network'
    },
    {
      'slug': 'festival-approved',
      'label': 'Festival Approved'
    },
    {
      'slug': 'our-critics-choice',
      'label': 'Our Critics Choice'
    },
    {
      'slug': 'logical-presents',
      'label': 'Logical Presents'
    },
    {
      'slug': 'vip-access',
      'label': 'VIP Access'
    }
  ] as const,
  'SCORING': [
    {
      'slug': 'a',
      'label': 'A'
    },
    {
      'slug': 'b',
      'label': 'B'
    },
    {
      'slug': 'c',
      'label': 'C'
    },
    {
      'slug': 'd',
      'label': 'D'
    },
  ] as const,
  'RATING': [
    {
      'slug': 'pegi',
      'label': 'PEGI'
    },
    {
      'slug': 'csa',
      'label': 'CSA'
    },
    {
      'slug': 'cnc',
      'label': 'CNC'
    },
  ] as const,
  'COLORS': [
    {
      'slug': 'c',
      'label': 'Color'
    },
    {
      'slug': 'b',
      'label': 'Black & white'
    }
  ] as const,
  'CERTIFICATIONS': [
    {
      'slug': 'art-essai',
      'label': 'Art & Essai'
    },
    {
      'slug': 'eof',
      'label': 'EOF'
    },
    {
      'slug': 'media',
      'label': 'Media'
    },
    {
      'slug': 'awarded-film',
      'label': 'Awarded Film'
    },
    {
      'slug': 'a-list-cast',
      'label': 'A-list Cast'
    },
    {
      'slug': 'europeanQualification',
      'label': 'European Qualification'
    }
  ] as const,
  'TERRITORIES': IsoTerritoriesToSlugAndLabel(),
  'MEDIAS': [
    { 'slug': 'pay-tv', 'label': 'Pay TV' },
    { 'slug': 'pay-per-view', 'label': 'Pay Per View' },
    { 'slug': 'free-tv', 'label': 'Free TV' },
    { 'slug': 't-vod-er-dtr-streaming', 'label': 'T-VOD, ER, DTR, Streaming' },
    { 'slug': 'est-dto-download', 'label': 'EST, DTO, Download' },
    { 'slug': 'n-vod', 'label': 'N-VOD' },
    { 'slug': 'a-vod', 'label': 'A-VOD' },
    { 'slug': 'f-vod', 'label': 'F-VOD' },
    { 'slug': 's-vod', 'label': 'S-VOD' },
    { 'slug': 'all-rights', 'label': 'All rights' },
    { 'slug': 'theatrical', 'label': 'Theatrical' },
    { 'slug': 'video', 'label': 'Video' },
    { 'slug': 'planes', 'label': 'Planes' },
    { 'slug': 'boats', 'label': 'Boats' },
    { 'slug': 'hotels', 'label': 'Hotels' },
    { 'slug': 'trains', 'label': 'Trains' },
    { 'slug': 'remake', 'label': 'Remake' },
    { 'slug': 'book-adaptation', 'label': 'Book Adaptation' },
    { 'slug': 'music-publishing', 'label': 'Music Publishing' },
    { 'slug': 'merchandising', 'label': 'Merchandising' },
  ] as const,
  'LEGAL_ROLES': [
    { 'slug': 'undefined', 'label': 'Undefined role' },
    { 'slug': 'service-provider', 'label': 'Service provider' },
    { 'slug': 'licensor', 'label': 'Licensor' },
    { 'slug': 'sub-licensor', 'label': 'Sub Licensor' },
    { 'slug': 'licensee', 'label': 'Licensee' },
    { 'slug': 'seller', 'label': 'Seller' },
    { 'slug': 'lender', 'label': 'Lender' },
    { 'slug': 'signatory', 'label': 'Signatory' },
    { 'slug': 'observator', 'label': 'Observator' },
    { 'slug': 'promisor', 'label': 'Promisor' },
    { 'slug': 'promisee', 'label': 'Promisee' },
    { 'slug': 'beneficiary', 'label': 'Beneficiary' },
    { 'slug': 'third-party', 'label': 'Third party' },
    { 'slug': 'purchaser', 'label': 'Purchaser' },
  ] as const,
  'MOVIE_FORMAT': [
    { 'slug': '1_33', 'label': '1.33' },
    { 'slug': '1_37', 'label': '1.37' },
    { 'slug': '1_66', 'label': '1.66' },
    { 'slug': '1_77', 'label': '1.77' },
    { 'slug': '1_85', 'label': '1.85' },
    { 'slug': 'scope', 'label': 'SCOPE' },
    { 'slug': '4/3', 'label': '4/3' },
    { 'slug': '16/9', 'label': '16/9' },
  ] as const,
  'MOVIE_FORMAT_QUALITY': [
    { 'slug': 'sd', 'label': 'SD' },
    { 'slug': 'hd', 'label': 'HD' },
    { 'slug': '2k', 'label': '2K' },
    { 'slug': '4k', 'label': '4K' },
    { 'slug': 'UHD', 'label': 'UHD' },
    { 'slug': '3D', 'label': '3D' },
    { 'slug': '3DSD', 'label': '3DSD' },
    { 'slug': '3DHD', 'label': '3DHD' },
    { 'slug': '3DUHD', 'label': '3DUHD' },
  ] as const,
  'SOUND_FORMAT': [
    { 'slug': 'mono', 'label': 'Mono' },
    { 'slug': 'stereo', 'label': 'Stereo' },
    { 'slug': 'dolby-sr', 'label': 'Dolby SR' },
    { 'slug': 'dts', 'label': 'DTS' },
    { 'slug': 'dolby-5.1', 'label': 'Dolby 5.1' },
    { 'slug': 'dolby-7.1', 'label': 'Dolby 7.1' },
    { 'slug': 'thx', 'label': 'THX' },
  ],
  'VERSION_INFO': [
    { 'slug': 'original', 'label': 'Original' },
    { 'slug': 'dubbed', 'label': 'Dubbed' },
    { 'slug': 'subtitle', 'label': 'Subtitled' },
    { 'slug': 'caption', 'label': 'Closed-Captions' }
  ]
};

export type Scope = keyof typeof models;
export type Model = typeof models;

/**
 * Checks if given code (or slug) exists in above static models
 * @dev If it exists, return code else false
 * @param scope
 * @param str Either label or slug from scope
 */

export type ExtractSlug<S extends Scope> = typeof models[S][number]['slug']
export type ExtractLabel<S extends Scope> = typeof models[S][number]['label']
export type ExtractCode<S extends Scope> = ExtractSlug<S> | ExtractLabel<S>
export type GetCodeOrNull<S extends Scope, Code> = Code extends ExtractCode<S> ? ExtractSlug<S> : null;
export const getCodeIfExists = <S extends Scope, code extends ExtractCode<S>>(
  scope: S,
  str: code
): GetCodeOrNull<S, code> => {
  let item = (models[scope] as any[]).find(i => i.slug.trim().toLowerCase() === str.trim().toLowerCase());
  if (item) { return item.slug }

  item = (models[scope] as any[]).find(i => i.label.trim().toLowerCase() === str.trim().toLowerCase());
  if (item) { return item.slug }

  return null as any;
};


/**
 * Returns the label corresponding to a slug (ie:code).
 * @dev Codes are used to store sanitized data in database
 * @param scope
 * @param slug
 */
export const getLabelByCode = (scope: Scope, slug: string) => {
  const item = (models[scope] as any[]).find(i => i.slug === slug);
  return item ? item.label : '';
};

/** Check if the key is a slug of a scope */
export const isInSlug = (scope: Scope, key: string) => {
  return (models[scope] as any[]).map(({ slug }) => slug).includes(key);
}

export default models;

export interface SlugAndLabel {
  label: string;
  slug: string;
}

export interface CurrencyWithLabel {
  label: string;
  slug: string;
  code: string;
}

/** Used in notifications/invitations to define which app is concerned. */
export const enum App {
  main = 'main',
  delivery = 'delivery',
  catalog = 'catalog'
}

/**
 * Check if data passed into array have at lease one item belonging to scope
 * @param array
 * @param scope
 * @param key
 */
export function hasSlug<S extends Scope, code extends ExtractSlug<S>>(array: string[], scope: Scope, key: code): boolean {
  return array.includes(getCodeIfExists(scope, key));
}
