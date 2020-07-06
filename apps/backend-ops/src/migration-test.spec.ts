import { createTechnicalSection } from "./firestoreMigrations/0029";
import { Movie } from "@blockframes/movie/+state/movie.model";

// Old version of movie data model
const movie: Partial<Movie> = {
  salesInfo: {
    broadcasterCoproducers: [],
    certifications: [],
    color: 'c',
    format: '16/9',
    formatQuality: 'hd',
    originalRelease: [],
    physicalHVRelease: new Date(2020, 3, 7),
    rating: [],
    releaseYear: null,
    scoring: 'a',
    soundFormat: '',
  }
};

// New version of movie data model
const newMovie = {
  ...movie,
  salesInfo: {
    broadcasterCoproducers: [],
    certifications: [],
    originalRelease: [],
    physicalHVRelease: movie.salesInfo.physicalHVRelease || null,
    rating: [],
    releaseYear: null,
    scoring: movie.salesInfo.scoring || null,
  },
  technicalInfo: {
    color: movie.salesInfo.color || null,
    format: movie.salesInfo.format || null,
    formatQuality: movie.salesInfo.formatQuality || null,
    soundFormat: movie.salesInfo.soundFormat || null,
  }
};

describe('Migration script', () => {
  test('migrate data from schemaX to schemaY', () => {
    const schemaX = movie;
    const schemaY = createTechnicalSection(schemaX);
    expect(schemaY).toEqual(newMovie);
  });

});
