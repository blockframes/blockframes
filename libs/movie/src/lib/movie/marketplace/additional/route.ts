import { RouteDescription } from "@blockframes/utils/common-interfaces";

export const additionalRoute: RouteDescription = {
  path: 'additional',
  label: 'Additional Information',
  requireKeys: [
    'estimatedBudget', 'originalRelease', 'boxOffice', 'rating',
    'format', 'formatQuality', 'color', 'soundFormat',
    'certifications'
  ],
}