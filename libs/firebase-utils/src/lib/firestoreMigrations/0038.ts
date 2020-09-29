import { Firestore } from '@blockframes/firebase-utils';

// Replace the old value for unitBox in box office
export async function upgrade(db: Firestore) {
  const movies = await db.collection('movies').get();
  const batch = db.batch();

  movies.docs.map(movieDoc => {
    const data = movieDoc.data();

    const newData = {
      ...data,
      boxOffice: data.boxOffice.map(box => {
        if(box.unit === 'boxoffice_dollar') {
          return {
            ...box,
            unit: 'usDollar'
          }
        } else if (box.unit === 'boxoffice_euro') {
          return {
            ...box,
            unit: 'euro'
          }
        } else {
          return {...box}
        }
      })
    };

    return batch.set(movieDoc.ref, newData);
  })

  console.log('Movie updated.')
  await batch.commit();
}
