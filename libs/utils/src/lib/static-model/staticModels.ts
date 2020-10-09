import { IsoTerritoriesToSlugAndLabel } from "./territories-ISO-3166";

// TODO issue#2582
const models = {
  // TODO #2306 Cast_role / Producer_role / Crew_role are used now only in the import code, we need to rework the import to delete it completely
  // TODO #3816 update excel import
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
  'PRODUCER_ROLES': [
    {
      'slug': 'executiveProducer',
      'label': 'Executive Producer'
    },
    {
      'slug': 'lineProducer',
      'label': 'Line Producer'
    },
    {
      'slug': 'associateProducer',
      'label': 'Associate Producer'
    },
    {
      'slug': 'productionManager',
      'label': 'Production Manager'
    },
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
  'PROMOTIONAL_ELEMENT_TYPES': [
    { 'slug': 'trailer', 'label': 'Trailer' },
    { 'slug': 'poster', 'label': 'Poster' },
    { 'slug': 'banner', 'label': 'Banner' },
    { 'slug': 'still_photo', 'label': 'Stills' },
    { 'slug': 'presentation_deck', 'label': 'Presentation deck' },
    { 'slug': 'scenario', 'label': 'Script' },
    { 'slug': 'promo_reel_link', 'label': 'Promo reel' },
    { 'slug': 'screener_link', 'label': 'Screener' },
    { 'slug': 'trailer_link', 'label': 'Trailer' },
    { 'slug': 'teaser_link', 'label': 'Teaser' },
  ] as const,
  'LEGAL_DOCUMENT_TYPES': [
    { 'slug': 'chain_of_titles', 'label': 'Chain of titles' },
    { 'slug': 'invoices', 'label': 'Invoices' },
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
  'LANGUAGES': [ // @TODO (#1658) Update LANGUAGES static model to be RFC-5646 compliant
    { 'slug': 'all', 'label': 'All languages'},
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
  'TERRITORIES': [
    {
      'slug': 'world',
      'label': 'World',
      'iso_a3': '',
    },
    ...IsoTerritoriesToSlugAndLabel()
  ],
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
export const getLabelBySlug = (scope: Scope, slug: string) => {
  const item = (models[scope] as any[]).find(i => i.slug === slug);
  return item ? item.label : '';
};

/**
 * Returns the code corresponding to a slug (ie:code).
 * @param scope
 * @param slug
 */
export const getCodeBySlug = (scope: Scope, slug: string) => {
  const item = (models[scope] as any[]).find(i => i.slug === slug);
  return item ? item.code : '';
}

/**
 * Returns the slug corresponding to a iso_a3.
 * @param iso_a3
 */
export const getSlugByIsoA3 = (iso_a3: string) => {
  const item = (models['TERRITORIES'] as any[]).find(i => i.iso_a3 === iso_a3);
  return item ? item.slug : '';
}

/**
 * Returns the iso_a3 corresponding to a slug.
 * @param slug
 */
export const getIsoA3bySlug = (slug: string) => {
  const item = (models['TERRITORIES'] as any[]).find(i => i.slug === slug);
  return item ? item.iso_a3 : '';
}

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

/**
 * Check if data passed into array have at lease one item belonging to scope
 * @param array
 * @param scope
 * @param key
 * @deprecated unused
 */
export function hasSlug<S extends Scope, code extends ExtractSlug<S>>(array: string[], scope: Scope, key: code): boolean {
  return array.includes(getCodeIfExists(scope, key));
}
