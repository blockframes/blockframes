import { createEmail, createOrgName } from '@blockframes/e2e/utils';

export const newUserWithNewOrg = {
  email: createEmail(),
  firstName: 'Nick',
  lastName: 'Casc',
  country: 'France',
  password: 'Test01',
  company: {
    name: createOrgName(),
    activity: 'Organization',
    country: 'France',
  },
  role: 'Buyer',
};
