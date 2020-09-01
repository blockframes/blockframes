import 'tsconfig-paths/register';
import { loadAdminServices, copyDbFromCi } from '@blockframes/firebase-utils';

const { storage, ci } = loadAdminServices();
copyDbFromCi(storage, ci).then(() => process.exit(0));
