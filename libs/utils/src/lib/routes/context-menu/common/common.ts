
import * as organization from './organization';
import * as dao from './dao';

import { ctxMenu } from '../helpers';

export const CONTEXT_MENU = ctxMenu([
  ...organization.baseMenu,
  ...dao.baseMenu,
]);
