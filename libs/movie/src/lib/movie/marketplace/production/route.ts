import { RouteDescription } from "@blockframes/utils/common-interfaces";

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