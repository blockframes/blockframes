import { Firestore } from '@blockframes/firebase-utils';


/**
 * Update
 * - producer role
 * - the crew role
 * - director's category
 * - certifications
 * - colors
 * with the new value from the static constant
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

    const newCertifications = data.certifications.map(certification => {
      return updateCertifications(certification);
    })

    const updateColor = (color) => {
      if (color === 'color-black-white') {
        return 'colorBW'
      } else return color;
    }

    const updateSoundFormat = (soundFormat) => {
      if (soundFormat === 'dolby-sr') {
        return 'dolbySR'
      } else return soundFormat;
    }

    const newMovie = {
      ...data,
      certifications: newCertifications,
      color: updateColor(data.color),
      crew: newCrew,
      directors: newDirectors,
      producers: newProducers,
      soundFormat: updateSoundFormat(data.soundFormat)
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

function updateCertifications(certification: string) {
  switch(certification) {
    case 'art-essai':
      return 'artEssai';
    case 'awarded-film' :
      return 'awardedFilm';
    case 'a-list-cast' :
      return 'aListCast';
    case 'european-qualification' :
      return 'europeanQualification';
    default:
      return certification;
  }
}
