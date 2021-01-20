import {
  apps,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { testFixture } from './fixtures/data';
import { Firestore, initFirestoreApp } from '@blockframes/testing/firebase/functions';
import { Movie } from '@blockframes/movie/+state';
import { MovieAppAccess } from '@blockframes/utils/apps';
import { StoreStatus, StoreType } from '@blockframes/utils/static-model';

describe('Movies Rules Tests', () => {
  const projectId = `movrules-spec-${Date.now()}`;
  let db: Firestore;

  describe('With User in org', () => {
    const newMovieId = 'MI-007';
    const existMovieId = 'MI-077';
    const storeConfig = {
      status: <StoreStatus>'draft',
      storeType: <StoreType>'Library',
      appAccess: <MovieAppAccess>{ festival: true },
    };

    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    describe('Read Movie', () => {
      test('should be able to read movie', async () => {
        const movieRef = db.doc('movies/M001');
        await assertSucceeds(movieRef.get());
      });

      test('should be able to read movie distribution rights', async () => {
        const movieDRRef = db.doc('movies/M001/distributionRights/DR001');
        await assertSucceeds(movieDRRef.get());
      });
    });

    describe('Create Movie', () => {
      test('storestatus other than draft should not be able', async () => {
        const movieRef = db.doc(`movies/${newMovieId}`);
        const createdMovie: Partial<Movie> = {
          id: newMovieId,
          storeConfig,
        };
        createdMovie.storeConfig['status'] = 'accepted';
        await assertFails(movieRef.set(createdMovie));
      });

      test('without create permission for org should not be able', async () => {
        const newMovieTitleUnavailableId = 'MI-000';
        const movieRef = db.doc(`movies/${newMovieTitleUnavailableId}`);
        const createdMovie: Partial<Movie> = {
          id: newMovieTitleUnavailableId,
          storeConfig,
        };
        await assertFails(movieRef.set(createdMovie));
      });

      test('with create permission for org, invalid id should not be able', async () => {
        const newMovieTitleUnavailableId = 'MI-000';
        const movieRef = db.doc(`movies/${newMovieId}`);
        const createdMovie: Partial<Movie> = {
          id: newMovieTitleUnavailableId,
          storeConfig,
        };
        await assertFails(movieRef.set(createdMovie));
      });

      test('with create permission for org should be able', async () => {
        const createdMovie: Partial<Movie> = {
          id: newMovieId,
          storeConfig: { status: <StoreStatus>'draft' } as any,
        };
        const movieDoc = db.collection('movies').doc(newMovieId).set(createdMovie);
        await assertSucceeds(movieDoc);
      });
    });

    describe('Update Movie', () => {
      const fields: any = [
        ['id', 'MI-0xx'],
        ['_meta', { createdBy: '' }],
        ['_meta', { createdAt: '' }],
        ['_type', 'drama'],
        ['storeConfig', { appAccess: { catalog: true } }],
        ['storeConfig', { status: 'rejected' }],
        ['storeConfig', { storeType: 'blah' }],
        ['storeConfig', { appAccess: { festival: {} } }],
      ];
      test.each(fields)("updating restricted '%s' field shouldn't be able", async (key, value) => {
        const movieRef = db.doc(`movies/${existMovieId}`);
        const details = {};
        details[key] = value;
        await assertFails(movieRef.update(details));
      });

      test('user valid org, updating unrestricted field should be able', async () => {
        const movieRef = db.doc(`movies/${existMovieId}`);
        const movieDetailsOther = { notes: 'update in unit-test' };
        await assertSucceeds(movieRef.update(movieDetailsOther));
      });
    });
  });

  describe('User with admin role', () => {
    const draftMovieId = 'MI-0d7';

    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-admin' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    //TODO #4301
    test('should not be able to delete movie', async () => {
      const movieRef = db.doc(`movies/${draftMovieId}`);
      await assertFails(movieRef.delete());
    });
  }); 

  describe('With User not in org', () => {
    const newMovieId = 'MI-007';
    const draftMovieId = 'MI-0d7';
    const newMovieDetails = { id: `${newMovieId}` };

    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, {
        uid: 'uid-peeptom',
      });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test("user without valid org shouldn't be able to read movie title", async () => {
      const movieRef = db.doc('movies/M001');
      await assertFails(movieRef.get());
    });

    test("user without valid org shouldn't be able to create movie title", async () => {
      const movieRef = db.doc(`movies/${newMovieId}`);
      await assertFails(movieRef.set(newMovieDetails));
    });

    test("user without valid org shouldn't be able to delete movie title", async () => {
      const movieRef = db.doc(`movies/${draftMovieId}`);
      await assertFails(movieRef.delete());
    });
  });

  // User not owner of movie
  describe('User without rights to edit movie', () => {
    const draftMovieId = 'MI-077';
    
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, {
        uid: 'uid-user3'
      })
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test("user without rights to edit movie shouldn't be able to read movie title when in draft", async () => {
      const movieRef = db.doc(`movies/${draftMovieId}`);
      await assertFails(movieRef.get());
    });
  });
});
