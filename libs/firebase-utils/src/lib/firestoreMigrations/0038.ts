import { Firestore } from '@blockframes/firebase-utils';
import { createHostedVideo, Credit } from '@blockframes/movie/+state/movie.model';
import { MovieDocument } from 'apps/backend-functions/src/data/types';


/**
 * Replace the old value for unitBox in box office
 * Update the status for cast, crew and director
 * Update the screener with video uploaded
*/
export async function upgrade(db: Firestore) {
  const movies = await db.collection('movies').get();
  const batch = db.batch();

  const updates = movies.docs.map(movieDoc => {
    const data = movieDoc.data();

    const jwPlayerId = data.hostedVideo;
    delete data.hostedVideo;

    const newCast = data.cast.map(person => {
      delete person.role;
      person.status = !!person.status ? updateMemberStatus(person.status) : '';
      return person;
    })

    const newData = {
      ...data,
      boxOffice: data.boxOffice.map(box => {
        if (box.unit === 'boxoffice_dollar') {
          return {
            ...box,
            unit: 'usd'
          }
        } else if (box.unit === 'boxoffice_euro') {
          return {
            ...box,
            unit: 'eur'
          }
        } else {
          return { ...box }
        }
      }),
      cast: data.cast.length ? newCast : data.cast,
      crew: updateMember(data.crew),
      directors: updateMember(data.directors),
    } as MovieDocument;

    if (jwPlayerId) {
      newData.promotional.videos = {
        ...newData.promotional.videos,
        screener: createHostedVideo({ jwPlayerId })
      }
    }

    return batch.set(movieDoc.ref, newData);
  })

  console.log('Movie updated.')
  await Promise.all(updates);
  await batch.commit();
}



// Update the status of directors and crew
function updateMember(member: Credit[]) {
  if (member.length) {
    member.forEach(person => {
      person.status = !!person.status ? updateMemberStatus(person.status) : '';
    })
  }
  return member;
}

// Correct typo from the old static model
function updateMemberStatus(status: string) {
  if (status === 'loosely-attached') {
    return 'looselyAttached';
  }
  else {
    return status
  };
}
