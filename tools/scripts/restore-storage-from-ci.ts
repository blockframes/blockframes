import 'tsconfig-paths/register';
import { loadAdminServices, restoreStorageFromCi } from '@blockframes/firebase-utils';

const { ci } = loadAdminServices();
restoreStorageFromCi(ci);
