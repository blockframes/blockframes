import { createMailTerm, MailTerm } from './terms';
import { User } from './user';
import { Offer } from './offer';
import { Negotiation } from './negociation';
import { Movie } from './movie';
import { Organization } from './organisation';
import { toLabel } from './utils';
import { movieCurrenciesSymbols, staticModel } from './static/static-model';
import { Bucket, MailBucket } from './bucket';
import { createMailContract } from './contract';

export interface OrgEmailData {
  name: string;
  email: string;
  id: string;
  country?: string;
}

export interface EmailData {
  to: string;
  subject: string;
}

export type EmailRequest = EmailData & ({ text: string } | { html: string });

/**
 * This interface is used mainly for the users who will receive this email.
 * @dev In the backend-function/templates/mail.ts, it will refer to the `user` variable.
 * @dev An other variable `userSubject` can be used also but it will be a subject of the email
 * @example An email is sent to admins of org to let them know a new member has joined :
 * `hi user.firstName, we let you know that userSubject.firstName has joined your org today`
 */
export interface UserEmailData {
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
  isRegistered?: boolean;
}

export interface OfferEmailData {
  id: string;
}

export interface MovieEmailData {
  id: string;
  title: {
    international: string;
  };
}

export interface NegotiationEmailData {
  price: string;
  currency: string;
  terms: MailTerm[];
}

export function createEmailRequest(params: Partial<EmailRequest> = {}): EmailRequest {
  return {
    to: 'foo@bar.com',
    subject: 'Default email subject',
    text: "This is not spam, I'm just a lazy developer testing emails and forgot to change default message.",
    ...params,
  };
}

export function getUserEmailData(user: Partial<User>, password?: string): UserEmailData {
  return {
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    password,
    isRegistered: !!user.orgId,
  };
}

export function getOfferEmailData(offer: Partial<Offer>): OfferEmailData {
  return {
    id: offer.id,
  };
}

export function getOrgEmailData(org: Partial<Organization>): OrgEmailData {
  return {
    id: org.id,
    name: org.name,
    email: org.email || '',
    country: toLabel(org.addresses?.main?.country, 'territories')
  }
}

export function getMovieEmailData(movie: Partial<Movie>): MovieEmailData {
  return {
    id: movie.id,
    title: {
      international: movie.title.international,
    }
  }
}

export function getNegotiationEmailData(negotiation: Partial<Negotiation>): NegotiationEmailData {
  const currency = staticModel.movieCurrenciesSymbols[negotiation.currency];
  const formatter = new Intl.NumberFormat('en-US');
  const price = negotiation.price ? formatter.format(negotiation.price) : '';
  const terms = createMailTerm(negotiation.terms);

  return {
    price,
    currency,
    terms
  };
}

export function getBucketEmailData(bucket: Bucket): MailBucket {
  const contracts = bucket.contracts.map(contract => createMailContract(contract));

  return {
    ...bucket,
    contracts,
    currency: movieCurrenciesSymbols[bucket.currency]
  };
}