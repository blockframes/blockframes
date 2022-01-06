
import { Firestore } from '../types';
import { runChunks } from '../firebase-utils';
import { createBucket } from '@blockframes/contract/bucket/+state/bucket.model';
import { createUser } from '@blockframes/auth/+state';
import { createOrganization } from '@blockframes/organization/+state';

/**
 * Update all events with the right accessibility property (instead of isPrivate property)
 * @param db
 * @returns
 */
export async function upgrade(db: Firestore) {

  const removed = [
    'antarctica',
    'bonaire',
    'christmas-island',
    'cocos-islands',
    'french-guiana',
    'gibraltar',
    'guadeloupe',
    'mayotte',
    'reunion',
    'sint-eustatius-and-saba',
    'svalbard-and-jan-mayen',
    'tokelau',
    'tuvalu',
    'united-states-minor-outlying-islands'
  ];

  const [buckets, movies, users, orgs] = await Promise.all([
    db.collection('buckets').get(),
    db.collection('movies').get(),
    db.collection('users').get(),
    db.collection('orgs').get()
  ]);
  
  await runChunks(buckets.docs, async (doc) => {
    const bucket = createBucket(doc.data());
    const original = JSON.stringify(bucket);

    bucket.contracts = bucket.contracts.map(contract => {
      contract.holdbacks = contract.holdbacks.map(holdback => {
        holdback.territories = holdback.territories.filter(territory => !removed.includes(territory))
        return holdback;
      }).filter(holdback => holdback.territories.length);

      contract.terms = contract.terms.map(term => {
        term.territories = term.territories.filter(territory => !removed.includes(territory));
        return term;
      }).filter(term => term.territories.length);

      return contract;
    });

    if (original !== JSON.stringify(bucket)) {
      await doc.ref.set(bucket);
    }
  }).catch(err => console.error(err));

  await runChunks(movies.docs, async (doc) => {
    const movie = doc.data();
    const original = JSON.stringify(movie);
    movie.originCountries = movie.originCountries.filter(territory => !removed.includes(territory));
    
    // country is mandatory for box office
    movie.boxOffice = movie.boxOffice?.filter(box => !removed.includes(box.territory));

    // country not mandatory for original release
    movie.originalRelease = movie.originalRelease?.map(release => {
      release.country = removed.includes(release.country) ? null : release.country;
      return release;
    });

    // country not mandatory for rating
    movie.rating = movie.rating?.map(rate => {
      rate.country = removed.includes(rate.country) ? null : rate.country;
      return rate;
    })

    if (movie.shooting?.locations?.length) {
      // country is mandatory for location
      movie.shooting.locations = movie.shooting.locations.filter(location => !removed.includes(location.country));
    }

    // country is mandatory for stakeholder
    for (const key in movie.stakeholders) {
      movie.stakeholders[key] = movie.stakeholders[key].map(stakeholder => {
        stakeholder.countries = stakeholder.countries.filter(country => !removed.includes(country));
        return stakeholder;
      }).filter(stakeholder => stakeholder.countries?.length);
    }

    if (original !== JSON.stringify(movie)) {
      await doc.ref.set(movie);
    }
  }).catch(err => console.error(err));

  await runChunks(users.docs, async (doc) => {
    const user = createUser(doc.data());
    const original = JSON.stringify(user);

    if (user.preferences?.territories?.length) {
      user.preferences.territories = user.preferences.territories.filter(territory => !removed.includes(territory));
    }
  
    if (original !== JSON.stringify(user)) {
      await doc.ref.set(user);
    }
  }).catch(err => console.error(err));

  await runChunks(orgs.docs, async (doc) => {
    const org = createOrganization(doc.data());
    const original = JSON.stringify(org);

    for (const address in org.addresses) {
      org.addresses[address].country = removed.includes(org.addresses[address].country) ? '' : org.addresses[address].country;
    }

    if (original !== JSON.stringify(org)) {
      await doc.ref.set(org);
    }
  }).catch(err => console.error(err));
}
