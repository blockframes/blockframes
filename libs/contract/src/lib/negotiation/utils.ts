import { LanguageRecord } from "@blockframes/movie/+state/movie.firestore";
import { Language, Media, Territory } from "@blockframes/utils/static-model";
import { BucketTerm, Duration } from "../term/+state";
import { Negotiation, NegotiationStatus } from "./+state/negotiation.firestore";

interface ArrayDifferences<T = string> {
  added: T[];
  removed: T[];
}

interface Difference<T> {
  before: T,
  after: T,
  delta?: number;
}

interface TermDifference {
  territories: ArrayDifferences<Territory>,
  media: ArrayDifferences<Media>,
  exclusivity: Difference<boolean>,
  duration: DurationDiff,
  languages: ArrayDifferences<LanguageRecord>,
}

interface NegotiationDifferences {
  buyerId: Difference<string>,
  price: Difference<number>,
  createdByOrg: Difference<string>,
  orgId: Difference<string>,
  parentTermId: Difference<string>,
  sellerId: Difference<string>,
  specificity: Difference<string>,
  stakeholders: ArrayDifferences<string>,
  status: Difference<NegotiationStatus>,
  titleId: Difference<string>,
  terms: TermDifference,
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

function stringArrayDiff(before: string[], after: string[]): ArrayDifferences {
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
  const addedLanguages = Object.keys(after).filter(key => !Object.keys(before).includes(key)) as Language[];
  const removedLanguages = Object.keys(before).filter(key => !Object.keys(after).includes(key)) as Language[];
  const added = addedLanguages.map(language => ({ [language]: before[language] }));
  const removed = removedLanguages.map(language => ({ [language]: after[language] }));
  return { added, removed };
}

function negotiationDiff(before: Negotiation, after: Negotiation): NegotiationDifferences;
function negotiationDiff(before: BucketTerm, after: BucketTerm): TermDifference;
function negotiationDiff(before: BucketTerm | Negotiation, after: BucketTerm | Negotiation): TermDifference | NegotiationDifferences {
  const differences = {} as NegotiationDifferences;
  const keys = Array.from(new Set([
    ...Object.keys(before),
    ...Object.keys(after)
  ]))
    // remove unwanted keys.
    .filter(key => ['id', 'holdbacks', '_meta'].includes(key));
  const simpleTypes = ['string', 'number', 'boolean'];

  for (const key of keys) {
    if (simpleTypes.includes(typeof before[key]) || simpleTypes.includes(typeof after[key]))
      differences[key] = simpleDiff(before[key], after[key]);
    else if (['stakeholders', 'medias', 'territories'].includes(key)) {
      differences[key] = stringArrayDiff(before[key], after[key])
    } else if (key === 'terms') {
      differences[key] = negotiationDiff(before[key], after[key]) as unknown as TermDifference
    } else if (key === 'duration') {
      differences[key] = durationDiff(before[key], after[key])
    } else if (key === 'languages') {
      differences[key] = languageDiff(before[key], after[key])
    }
  }

  return differences;
}
