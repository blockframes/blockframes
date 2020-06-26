import { Firestore } from '../admin';
import { createStakeholder } from '@blockframes/utils/common-interfaces/identity';
import { ResourceSizesSlug, ResourceRatioSlug, LanguagesSlug, TerritoriesSlug } from '@blockframes/utils/static-model';

/**
 * Update stakeholders in movie documents.
 */
export async function updateStakeholdersMovieStructure(db: Firestore) {
  const movies = await db.collection('movies').get();

  const newMovieData = movies.docs.map(async (movieDocSnapshot: any): Promise<any> => {
    const movieData = movieDocSnapshot.data();

    const { stakeholders } = movieData.main;

    if (Array.isArray(stakeholders)) {
      const newStakeholders = {
        coProducer: [],
        lineProducer: [],
        distributor: [],
        executiveProducer: [],
        salesAgent: [],
        laboratory: [],
        financier: [],
        broadcasterCoproducer: [],
      };
      stakeholders.forEach(s => {
        const stakeHolder = createStakeholder({
          displayName: s.displayName ? s.displayName : `${s.firstName} ${s.lastName}`,
          showName: s.showName ? s.showName : false,
          orgId: s.orgId ? s.orgId : '',
          logo: s.logo
        });
        switch (s.role) {
          case 'broadcaster-coproducer':
            newStakeholders.broadcasterCoproducer.push(stakeHolder);
            break;
          case 'financier':
            newStakeholders.financier.push(stakeHolder);
            break;
          case 'laboratory':
            newStakeholders.laboratory.push(stakeHolder);
            break;
          case 'sales-agent':
            newStakeholders.salesAgent.push(stakeHolder);
            break;
          case 'distributor':
            newStakeholders.distributor.push(stakeHolder);
            break;
          case 'line-producer':
            newStakeholders.lineProducer.push(stakeHolder);
            break;
          case 'co-producer':
            newStakeholders.coProducer.push(stakeHolder);
            break;
          case 'executive-producer':
          default:
            newStakeholders.executiveProducer.push(stakeHolder);
            break;
        }
      })


      const newData = {
        ...movieData,
        main: {
          ...movieData.main,
          stakeholders: newStakeholders
        }
      };

      return movieDocSnapshot.ref.set(newData);
    }

  });
  await Promise.all(newMovieData);
  console.log('Updating stakeholders in movie documents done.');
}

/**
 * Update posters in movie documents.
 */
export async function updatePosterStructure(db: Firestore) {
  const movies = await db.collection('movies').get();

  const newMovieData = movies.docs.map(async (movieDocSnapshot: any): Promise<any> => {
    const movieData = movieDocSnapshot.data();

    if (movieData.main && movieData.main.poster) {
      const media = createImgRef(movieData.main.poster);

      const moviePoster = createPromotionalElement({
        label: 'Poster',
        media,
      });

      const newData = { ...movieData };
      delete newData.main.poster;

      if (!newData.promotionalElements.poster) {
        newData.promotionalElements.poster = [];
      }

      newData.promotionalElements.poster.push(moviePoster);
      return movieDocSnapshot.ref.set(newData);
    }

  });
  await Promise.all(newMovieData);
  console.log('Updating posters in movie documents done.');
}

export async function upgrade(db: Firestore) {
  await updateStakeholdersMovieStructure(db);
  await updatePosterStructure(db);
}

function createPromotionalElement(
  promotionalElement: Partial<PromotionalElement> = {}
): PromotionalElement {
  return {
    label: '',
    ...promotionalElement,
    media: createImgRef(promotionalElement.media)
  };
}

export function createImgRef(ref: Partial<OldImgRef> | string = {}): OldImgRef {
  const _ref = typeof ref === 'string' ? { urls: { original: ref } } : ref;
  return {
    ref: '',
    urls: {
      original: '',
      xs: '',
      md: '',
      lg: '',
    },
    ..._ref
  };
}

interface PromotionalElement {
  label: string,
  size?: ResourceSizesSlug,
  ratio?: ResourceRatioSlug,
  media: OldImgRef,
  language?: LanguagesSlug,
  country?: TerritoriesSlug,
}

interface OldImgRef {
  ref: string;
  urls: {
    original: string;
    fallback?: string;
    xs?: string;
    md?: string;
    lg?: string;
  };
}