
import { App } from '@blockframes/utils/apps';
import { templateIds } from '@env';
import { generate as passwordGenerator } from 'generate-password';
import { OrganizationDocument } from '../data/types';
import { getOrgAppName, getAppUrl, getDocument, getFromEmail } from '../data/internals';
import { userInvite } from '../templates/mail';
import { auth } from './firebase';
import { sendMailFromTemplate } from './email';


interface UserProposal {
  uid: string;
  email: string;
}


const generatePassword = () =>
  passwordGenerator({
    length: 12,
    numbers: true
  });


/** 
 * Get user by email & create one if there is no user for this email
 */
export const getOrCreateUserByMail = async (data: { email: string, orgId: string }): Promise<UserProposal> => {
  const { email, orgId } = data;

  try {
    const user = await auth.getUserByEmail(email);
    return { uid: user.uid, email };
  } catch {
    const password = generatePassword();

    // User does not exists, send them an email.
    const user = await auth.createUser({
      email,
      password,
      emailVerified: true,
      disabled: false
    });

    const org = await getDocument<OrganizationDocument>(`orgs/${orgId}`);
    const appName: App = await getOrgAppName(org);
    const urlToUse = await getAppUrl(org);
    const from = await getFromEmail(org);
    // neeed template attendEvent #2818
    const templateToUse = appName === 'festival' ? templateIds.user.credentials.market : templateIds.user.credentials.content;

    await sendMailFromTemplate(userInvite(email, password, org.denomination.full, urlToUse, templateToUse), from);

    return { uid: user.uid, email };
  }
};