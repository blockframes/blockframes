import { Firestore } from '@blockframes/firebase-utils';


/**
 * Update the producer role, the crew role and director's category with the new value from the static constant
*/
export async function upgrade(db: Firestore) {
  const movies = await db.collection('movies').get();
  const batch = db.batch();

  movies.docs.map(movieDoc => {
    const data = movieDoc.data();

    const newCrew = data.crew.map(person => {
      if (!!person.role) {
        person.role = updateCrewRole(person.role)
      }
      return person;
    });

    const newProducers = data.producers.map(person => {
      if (!!person.role) {
        person.role = updateProducerRole(person.role)
      }
      return person;
    });

    const newDirectors = data.directors.map(person => {
      if (!!person.category) {
        person.category = updateDirectorCategory(person.category)
      }
      return person;
    });


    const newMovie = {
      ...data,
      crew: newCrew,
      directors: newDirectors,
      producers: newProducers
    };

    return batch.set(movieDoc.ref, newMovie);
  });

  console.log('Producers and Crew updated');
  await batch.commit();
}


function updateDirectorCategory(category: string) {
  switch(category) {
    case 'first-feature':
      return 'firstFeature';
    case 'rising-talent' :
      return 'risingTalent';
    default:
      return category;
  }
}

function updateProducerRole(role: string) {
  switch(role) {
    case 'executive-producer':
      return 'executiveProducer';
    case 'line-producer' :
      return 'lineProducer';
    case 'associate-producer':
      return 'associateProducer';
    case 'production-manager':
      return 'productionManager';
    default:
      return role;
  }
}

function updateCrewRole(role: string) {
  switch(role) {
    case 'score-composer':
      return 'scoreComposer';
    case 'dialogue-writer' :
      return 'dialogueWriter';
    case 'director-of-photography':
      return 'photographyDirector';
    case 'casting-director':
      return 'castingDirector';
    case 'artistic-director':
      return 'artisticDirector';
    case 'costume-designer':
      return 'costumeDesigner';
    case 'make-up-artist':
      return 'makeUpArtist';
    case 'production-designer':
      return 'productionDesigner';
    case 'first-assistant-director':
      return 'firstAssistantDirector';
    case 'second-assistant-director':
      return 'secondAssistantDirector';
    case 'post-production-director':
      return 'postProductionDirector';
    case 'original-author':
      return 'originalAuthor';
    default:
      return role;
  }
}
