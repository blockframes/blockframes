import { Action, action } from '@blockframes/model';

export const actions: Action[] = [
  action('append', { id: 'first-parent', orgId: 'org-0', percent: 0.5, previous: ['horizontal-group'] }),
  action('appendHorizontal', {
    id: 'horizontal-group', blameId: 'evil-production', previous: ['child'], percent: 0.8, children: [
      { type: 'right', id: 'node-1', orgId: 'org-1', percent: 0.50 },
      { type: 'right', id: 'node-2', orgId: 'org-2', percent: 0.55 },
    ]
  }),
  action('append', { id: 'child', orgId: 'evil-production', percent: 0.5, previous: ['horizontal-group-2'] }),
  action('appendHorizontal', {
    id: 'horizontal-group-2', blameId: 'evil-production', previous: ['end'], percent: 0.5, children: [
      { type: 'right', id: 'node-3', orgId: 'org-1', percent: 0.70 },
      { type: 'right', id: 'node-4', orgId: 'org-2', percent: 0.80 },
    ]
  }),
  action('append', { id: 'end', orgId: 'evil-production', percent: 0.5, previous: [] }),
  action('income', { id: 'income-1', amount: 100_000, from: 'row_all', to: 'first-parent', territories: [], medias: [] }),
]
