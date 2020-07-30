import { firestore } from 'firebase-admin';
import { initFunctionsTestMock } from '../../../libs/testing/src/lib/firebase/functions';
import { runChunks } from './tools';
import { cleanMovies } from './db-cleaning';

const moviesTestSet = require('../../../libs/testing/src/lib/mocked-data-unit-tests/movies.json'); // @TODO (#3066) commit this file only when fully anonymised
let db;
jest.setTimeout(30000);

describe('Migration script', () => {
  beforeEach(async () => {
    initFunctionsTestMock();
    db = firestore();
    await runChunks(moviesTestSet, async (m) => {
      const movieRef = db.collection('movies').doc(m.id);
      await movieRef.set(m);
    }, 50);
  });
  it('should clean movies from unwanted attributes', async () => {
    const moviesAfter: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData> = await db.collection('movies').get();
    await cleanMovies(moviesAfter);
    const moviesBefore: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData> = await db.collection('movies').get();
    const cleanedMovies = moviesBefore.docs.filter(m => isMovieClean(m)).length;
    expect(moviesTestSet.length).toEqual(cleanedMovies);
  });
});

function isMovieClean(m) {
  return m.data().distributionRights === undefined
}