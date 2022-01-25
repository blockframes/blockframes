import { MovieLanguageSpecificationContainer } from "@blockframes/movie/+state/movie.firestore";
import { Timestamp } from "@blockframes/utils/common-interfaces/timestamp";
import { toLabel } from "@blockframes/utils/pipes/to-label.pipe";
import { staticModel } from "@blockframes/utils/static-model/static-model";
import { centralOrgId } from "@env";
import { Negotiation } from "./+state/negotiation.firestore";

export function isInitial(negotiation: Partial<Negotiation>) {
  if (!negotiation?._meta) return true;
  const initial = negotiation.initial
  const createdAt = negotiation._meta?.createdAt
  initial?.setSeconds(0, 0);
  createdAt?.setSeconds(0, 0);

  return initial?.getTime() === createdAt?.getTime();
}

export function getReviewer(negotiation: Negotiation<Timestamp | Date>) {
  return negotiation.stakeholders.find(id => id !== negotiation.createdByOrg && id !== centralOrgId.catalog);
}

export function hydrateLanguageForEmail(data: Partial<MovieLanguageSpecificationContainer> = {}) {
  return Object.keys(data)
    .map(lang => {
      const prefix: string[] = [];
      if (data[lang].dubbed) prefix.push(staticModel['movieLanguageTypes'].dubbed);
      if (data[lang].subtitle) prefix.push(staticModel['movieLanguageTypes'].subtitle);
      if (data[lang].caption) prefix.push(staticModel['movieLanguageTypes'].caption);
      if (prefix.length) return `${toLabel(lang, 'languages')} (${prefix.join(', ')})`;
      return toLabel(lang, 'languages');
    })
    .join(', ');
}
