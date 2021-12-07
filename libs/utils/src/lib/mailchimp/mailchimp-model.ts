type MailchimpTagStatus = 'active' | 'inactive'
export interface MailchimpTag {
  name: string;
  status: MailchimpTagStatus
}

export function getPreferenceTag(type: string, tags: string[] = [], status: MailchimpTagStatus): MailchimpTag[] {
  return tags.map(tag => `${type}_${tag}`).map(name => ({ name, status }));
}