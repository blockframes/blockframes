// TODO #4368 still used by avails
const models = {};

type Scope = keyof typeof models;

/**
 * Checks if given code (or slug) exists in above static models
 * @dev If it exists, return code else false
 * @param scope
 * @param str Either label or slug from scope
 */

export type ExtractSlug<S extends Scope> = typeof models[S][number]['slug']

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

export default models;
