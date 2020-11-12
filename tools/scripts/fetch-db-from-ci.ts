import 'tsconfig-paths/register';
import { loadAdminServices, copyAnonDbFromCi } from '@blockframes/firebase-utils';

const { storage, getCI } = loadAdminServices();
copyAnonDbFromCi(storage, getCI()).then(() => process.exit(0));
