
import { App, getSendgridFrom, getSendgridUrl } from '@blockframes/utils/apps';
import { templateIds } from '@env';
import { generate as passwordGenerator } from 'generate-password';
import { OrganizationDocument, InvitationType } from '../data/types';
import { getDocument } from '../data/internals';
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
export const getOrCreateUserByMail = async (email: string, orgId: string, invitationType: InvitationType, slug: App = 'catalog'): Promise<UserProposal> => {

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
    const urlToUse = getSendgridUrl(slug); 
    const from = getSendgridFrom(slug);

    let templateToUse = templateIds.user.credentials.content;
    switch (invitationType) {
      case 'attendEvent':
        templateToUse = templateIds.user.credentials.event;
        break;
      case 'joinOrganization':
      default:
        templateToUse = slug === 'festival' ? templateIds.user.credentials.market : templateIds.user.credentials.content;
        break;
    }
    await sendMailFromTemplate(userInvite(email, password, org.denomination.full, urlToUse, templateToUse), from);
    return { uid: user.uid, email };
  }
};