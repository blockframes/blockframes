import { mailchimpAPIKey, mailchimpServer, mailchimpListId } from './environments/environment';
import { MailchimpTag } from '@blockframes/utils/mailchimp/mailchimp-model';
import { createHash } from 'crypto';

let _mailchimp;

async function getMailChimp() {
  if (!_mailchimp) {
    _mailchimp = await import("@mailchimp/mailchimp_marketing").then(mailchimp => mailchimp.default);
  }
  return _mailchimp
}

export const registerToNewsletters = async (data: {email: string, tags: string[]}) => {
  const {email: email_address, tags} = data;
  const mailchimp = await getMailChimp();

  mailchimp.setConfig({
    apiKey: mailchimpAPIKey,
    server: mailchimpServer,
  });

  return await mailchimp.lists.addListMember(mailchimpListId, 
    {email_address, 
    tags,
    status: "subscribed"}
  );
}

export async function updateMemberTags(email: string, tags: MailchimpTag[]): Promise<void> {
  const mailchimp = await getMailChimp();

  mailchimp.setConfig({
    apiKey: '7100ec18d222451276220ff385a8c5be-us20',
    server: 'us20'
  });

  const listID = 'efaccd1d28'; // TODO use mailchimpListId instead
  const subscriber_hash = createHash('md5').update(email).digest('hex');

  return mailchimp.lists.updateListMemberTags(listID, subscriber_hash, { tags });
}