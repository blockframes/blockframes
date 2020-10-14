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
