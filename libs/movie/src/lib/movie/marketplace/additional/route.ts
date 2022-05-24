import { RouteDescription } from '@blockframes/model';

export const additionalRoute: RouteDescription = {
  path: 'additional',
  label: 'Additional',
  requireKeys: [
    'estimatedBudget', 'originalRelease', 'boxOffice', 'rating',
    'format', 'formatQuality', 'color', 'soundFormat',
    'certifications', 'audience', 'languages'
  ],
}