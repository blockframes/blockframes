import { Timestamp } from "@blockframes/utils/common-interfaces/timestamp";
import { centralOrgId } from "@env";
import { LanguageRecord } from "@blockframes/movie/+state/movie.firestore";
import { Language, Media, Territory } from "@blockframes/utils/static-model";
import { Duration } from "../term/+state";
import { Negotiation } from "./+state/negotiation.firestore";

interface ArrayDifferences<T = string> {
  added: T[];
  removed: T[];
}

interface Difference<T> {
  before: T,
  after: T,
  delta?: number;
}

interface TermDifferences {
  territories: ArrayDifferences<Territory>,
  medias: ArrayDifferences<Media>,
  exclusive: Difference<boolean>,
  duration: DurationDiff,
  languages: ArrayDifferences<LanguageRecord>,
}

interface NegotiationDifferences {
  price: Difference<number>,
  terms: TermDifferences[]
}

function simpleDiff(before: string, after: string): Difference<string>;
function simpleDiff(before: boolean, after: boolean): Difference<boolean>;
function simpleDiff(before: number, after: number): Difference<number>;
function simpleDiff<T>(before: T, after: T): Difference<T> {
  const differences = {} as Difference<T>
  if (!before && !after) return differences;
  differences.after = after;
  differences.before = before;
  if (typeof before === 'number' && typeof after === 'number') differences.delta = after - before
  return differences
}

function stringArrayDiff<T>(before: T[], after: T[]): ArrayDifferences<T> {
  const added = after.filter(item => !before.includes(item))
  const removed = before.filter(item => !after.includes(item))
  return { added, removed }
}

function durationDiff(before: Duration<Date>, after: Duration<Date>) {
  const diffFrom = { before: before.from, delta: 0 } as Difference<Date>;
  const diffTo = { before: before.to, delta: 0 } as Difference<Date>;

  if (before.from.getTime() !== after.from.getTime())
    diffFrom.delta = before.from.getTime() - after.from.getTime();


  if (before.to.getTime() !== after.to.getTime())
    diffTo.delta = before.to.getTime() - after.to.getTime();

  return { from: diffFrom, to: diffTo }
}

type DurationDiff = ReturnType<typeof durationDiff>

//@TODO: Should we check for the differences between two specific Language records?
// like say when we simply change from [dubs, subs, cc] => [subs] on the same LanguageRecord
function languageDiff(before: LanguageRecord, after: LanguageRecord): ArrayDifferences<LanguageRecord> {
  const addedLanguages = Object.keys(after ?? {}).filter(key => !Object.keys(before).includes(key)) as Language[];
  const removedLanguages = Object.keys(before).filter(key => !Object.keys(after ?? {}).includes(key)) as Language[];
  const added = addedLanguages.map(language => ({ [language]: before[language] }));
  const removed = removedLanguages.map(language => ({ [language]: after[language] }));
  return { added, removed };
}

function negotiationDiff(before: Negotiation, after: Negotiation): NegotiationDifferences {
  const differences = { terms: [] } as NegotiationDifferences;
  differences.price = simpleDiff(before.price, after.price);
  differences.terms = before.terms.map((beforeTerm, idx) => {
    const termDifferences = {} as TermDifferences;
    termDifferences['medias'] = stringArrayDiff(beforeTerm['medias'], after['medias']);
    termDifferences['territorie'] = stringArrayDiff(beforeTerm['territorie'], after['territorie']);
    termDifferences['duration'] = durationDiff(beforeTerm['duration'], after.terms?.[idx]?.['duration']);
    termDifferences['languages'] = languageDiff(beforeTerm['languages'], after.terms?.[idx]?.['languages']);
    termDifferences['exclusive'] = simpleDiff(beforeTerm['exclusive'], after.terms?.[idx]?.['exclusive']);
    return termDifferences;
  })

  return differences;
}

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
