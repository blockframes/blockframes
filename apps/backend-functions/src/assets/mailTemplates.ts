import { appUrl } from '../environments/environment';

const USER_WELCOME_PATH = '/auth/welcome';

export const userInviteTemplate = ({ email, password }: { email: string; password: string }) =>
  `
  You've been invited to a project on the Blockframes Platform!\n
  \n
  login: ${email}\n
  password: ${password}\n
  \n
  Click on the following link to login to your account and join the project:\n
  ${appUrl}${USER_WELCOME_PATH}
  `;
