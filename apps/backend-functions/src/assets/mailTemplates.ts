import { appUrl } from '../environments/environment';

const USER_WELCOME_PATH = '/auth/welcome';

export const userInviteTemplate = () =>
  `
  You've been invited to a project on the Blockframes Platform!\n
  \n
  Click on the following link to create your account and join the project:\n
  ${appUrl}${USER_WELCOME_PATH}
  `;
