import { GetKeys, Scope } from './static-model';

export interface StaticGroup<S extends Scope = any> {
  label: string;
  items: Extract<GetKeys<S>, string>[];
}

export type StaticGroupMap = Partial<{
  [key in Scope]: StaticGroup<key>[]
}>;

export const mediaGroup: StaticGroup<'medias'>[] = [{
  label: 'TV',
  items: ['payTv', 'freeTv', 'payPerView'],
}, {
  label: 'VOD',
  items: ['est', 'nVod', 'aVod', 'fVod', 'sVod']
}, {
  label: 'Ancillary Rights',
  items: ['theatrical', 'video', 'planes', 'hotels', 'educational']
}, {
  label: 'DVD',
  items: ['rental', 'through']
}];


export const staticGroups: StaticGroupMap = {
  medias: mediaGroup,
}
