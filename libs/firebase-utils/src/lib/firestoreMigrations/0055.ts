import { Firestore } from '@blockframes/firebase-utils';
import { Movie } from '@blockframes/data-model';
import { Organization } from '@blockframes/organization/+state';
import { Stakeholder } from '@blockframes/utils/common-interfaces';
import { Territory } from '@blockframes/utils/static-model';
import { runChunks } from '../firebase-utils';

const replaced = {
  'christmas- island': 'christmas-island',
}

const isReplaced = (territory: Territory) => {
  return Object.keys(replaced).some(key => key === territory)
}

export async function upgrade(db: Firestore) {

  // MOVIE
  const movies = await db.collection('movies').get()
  await runChunks(movies.docs, async (movieDoc) => {
    const data = movieDoc.data() as Movie;
    let update = false;

    // boxOffice[].territory
    if (data.boxOffice) {
      data.boxOffice = data.boxOffice.map(office => {
        if (isReplaced(office.territory)) {
          office.territory = replaced[office.territory];
          update = true;
        }
        return office;
      });
    }

    // rating[].country
    if (data.rating) {
      data.rating = data.rating.map(rating => {
        if (isReplaced(rating.country)) {
          rating.country = replaced[rating.country];
          update = true;
        }
        return rating;
      });
    }

    // originCountries
    data.originCountries = data.originCountries.map(country => {
      if (isReplaced(country)) {
        update = true;
        return replaced[country];
      } else return country;
    });

    // originalRelease[].country
    if (data.originalRelease) {
      data.originalRelease = data.originalRelease.map(release => {
        if (isReplaced(release.country)) {
          release.country = replaced[release.country];
          update = true;
        }
        return release;
      });
    }

    // stakeholders => stakeholder[] => countries
    if (data.stakeholders) {
      for (const key in data.stakeholders) {
        const stakeholders = data.stakeholders[key] as Stakeholder[]
        data.stakeholders[key] = stakeholders.map(stakeholder => {
          if (stakeholder.countries) {
            stakeholder.countries = stakeholder.countries.map(country => {
              if (isReplaced(country)) {
                update = true;
                return replaced[country];
              } else return country;
            });
          }
          return stakeholder;
        });
      }
    }

    // shooting.locations[].country
    if (data.shooting) {
      for (const location of data.shooting.locations) {
        if (isReplaced(location.country)) {
          location.country = replaced[location.country];
          update = true;
        }
      }
    }

    if (update) await movieDoc.ref.set(data);
  })

  // ORG
  const orgs = await db.collection('orgs').get();
  await runChunks(orgs.docs, async (orgDoc) => {
    const data = orgDoc.data() as Organization;
    let update = false;

    // addresses.main.country
    const mainAddress = data.addresses.main;
    if (mainAddress.country) {
      if (isReplaced(mainAddress.country)) {
        mainAddress.country = replaced[mainAddress.country];
        update = true;
      }
    }

    if (update) await orgDoc.ref.set(data);
  })

}
