import { RouteDescription } from '@blockframes/model';

export const productionRoute: RouteDescription = {
  path: 'production',
  label: 'Production',
  requireKeys: [
    'stakeholders.productionCompany',
    'stakeholders.coProductionCompany',
    'stakeholders.distributor',
    'stakeholders.saleAgent',
    'producers',
    'shooting'
  ],
}