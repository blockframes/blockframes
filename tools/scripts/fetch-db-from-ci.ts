import 'tsconfig-paths/register';
import { loadAdminServices, copyDbFromCi } from '@blockframes/firebase-utils';

const { storage, getCI } = loadAdminServices();
copyDbFromCi(storage, getCI()).then(() => process.exit(0));
