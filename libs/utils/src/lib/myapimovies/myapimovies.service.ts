import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { createCredit, createMovie, createMovieAppConfig, Credit, Genre, Language, Territory } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { where } from 'firebase/firestore';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { getKeyIfExists } from '../helpers';

interface MyapimoviesMovie {
  imdbId: string,
  imdbUrl: string,
  lastUpdate: string,
  metascore: string,
  plot: string,
  posterUrl: string,
  rated: string,
  rating: string,
  releaseDate: string,
  runtime: string,
  simplePlot: string,
  title: string,
  originalTitle?: string,
  type: 'M',
  votes: string,
  year: string,
}

interface MyapimoviesSerie {
  imdbId: string,
  imdbUrl: string,
  lastUpdate: string,
  plot: string,
  posterUrl: string,
  rated: string,
  rating: string,
  releaseDate: string,
  runtime: string,
  simplePlot: string,
  title: string,
  type: 'S',
  votes: string,
  year: string,
}

const genreMap: Record<string, Genre> = {
  Adventure: 'adventure',
  'Sci-Fi': 'scienceFiction',
  Thriller: 'thriller',
  Drama: 'drama',
  Romance: 'romance',
  Comedy: 'comedy',
  Action: 'action',
  Crime: 'crime',
  Horror: 'horror',
  Mystery: 'drama',
  'Film-Noir': 'drama',
  'Fantasy': 'fantasy',
  'History': 'drama',
  'War': 'drama',
  'Documentary': 'documentary',
  'Biography': 'biography',
  'Western': 'action',
  'Sport': 'action'
};

export type ImdbImportLogs = { error: string[], succes: string[] };

const defaultLanguage: Language = 'english';
const defaultGenre: Genre = 'drama';
const defaultCountry: Territory = 'france';

@Injectable({ providedIn: 'root' })
export class MyapimoviesService {

  /**
   * Swagger documentation
   * https://www.myapimovies.com/api/swagger-ui.html
   */
  private api = 'https://www.myapimovies.com/api';

  public logs: ImdbImportLogs = {
    error: [],
    succes: []
  };

  private canSaveMovie = true;

  constructor(
    private titleService: MovieService,
    private http: HttpClient,
  ) { }

  public token = '';

  public async health() {
    const { status } = await this.query<{ status: string }>(`/v1/health`);
    return status;
  }

  private async movie(imdbId: string): Promise<MyapimoviesMovie | MyapimoviesSerie> {
    try {
      const { data } = await this.query<{ data: MyapimoviesMovie | MyapimoviesSerie, code: number }>(`/v1/movie/${imdbId}`);
      switch (data.type) {
        case 'M':
          return data as MyapimoviesMovie;
        case 'S':
          return data as MyapimoviesSerie;
        default:
          throw new Error('Unhandled content type');
      }
    } catch (error) {
      const message = error.error?.error;
      if (message) {
        this.logs.error.push(`Error while importing movie: ${imdbId}: ${message}`);
      } else {
        this.logs.error.push(`Error while importing movie: ${imdbId}`);
        console.log(error);
      }
    }
  }

  private async genres(imdbId: string): Promise<Genre[]> {
    try {
      const { data } = await this.query<{ data: { genre: string }[], code: number }>(`/v1/movie/${imdbId}/genres`);
      const genres = data.map(d => {
        if (genreMap[d.genre]) return genreMap[d.genre];
        else this.logs.error.push(`Skipped unknown genre ${d.genre}`);
      }).filter(d => !!d);

      if (genres.length === 0) {
        genres.push(defaultGenre);
        this.logs.error.push(`No genres found for ${imdbId}. Used ${defaultGenre} as default`);
      }

      return genres;
    } catch (error) {
      const message = error.error?.error;
      if (message) {
        this.logs.error.push(`Error while importing genres: ${imdbId}: ${message}`);
        if (message === 'Max requests reached') this.canSaveMovie = false;
      } else {
        this.logs.error.push(`Error while importing genres: ${imdbId}`);
        console.log(error);
      }

      this.logs.error.push(`No genres found for ${imdbId}. Used ${defaultGenre} as default`);
      return [defaultGenre];
    }
  }

  private async keywords(imdbId: string) {
    try {
      const { data } = await this.query<{ data: { keywords: string }[], code: number }>(`/v1/movie/${imdbId}/keywords`);
      return data;
    } catch (error) {
      const message = error.error?.error;
      if (message) {
        this.logs.error.push(`Error while importing keywords: ${imdbId}: ${message}`);
        if (message === 'Max requests reached') this.canSaveMovie = false;
      } else {
        this.logs.error.push(`Error while importing keywords: ${imdbId}`);
        console.log(error);
      }

      return [];
    }
  }

  private async seasons(imdbId: string) {
    const { data } = await this.query<{ data: { numSeason: number, year: number }[], code: number }>(`/v1/movie/${imdbId}/season`);
    return data;
  }

  private async directors(imdbId: string): Promise<Credit[]> {
    try {
      const { data } = await this.query<{ data: { type: 'DIRECTOR', name: { name: string, imdbId: string } }[], code: number }>(`/v1/movie/${imdbId}/crew`);
      return data.filter(c => c.type === 'DIRECTOR').map(d => this.createCredit(d.name?.name));
    } catch (error) {
      const message = error.error?.error;
      if (message) {
        this.logs.error.push(`Error while importing directors: ${imdbId}: ${message}`);
        if (message === 'Max requests reached') this.canSaveMovie = false;
      } else {
        this.logs.error.push(`Error while importing directors: ${imdbId}`);
        console.log(error);
      }

      return [];
    }
  }

  private async actors(imdbId: string): Promise<Credit[]> {
    try {
      const { data } = await this.query<{ data: { character: string, main: boolean, name: { name: string, imdbId: string } }[], code: number }>(`/v1/movie/${imdbId}/actors`);
      return data.filter(d => d.main).map(d => this.createCredit(d.name?.name));
    } catch (error) {
      const message = error.error?.error;
      if (message) {
        this.logs.error.push(`Error while importing actors: ${imdbId}: ${message}`);
        if (message === 'Max requests reached') this.canSaveMovie = false;
      } else {
        this.logs.error.push(`Error while importing actors: ${imdbId}`);
        console.log(error);
      }

      return [];
    }
  }

  private async countries(imdbId: string): Promise<Territory[]> {
    try {
      const { data } = await this.query<{ data: { country: string }[], code: number }>(`/v1/movie/${imdbId}/countries`);
      const countries = data.map(d => {
        if (d.country === 'UK') d.country = 'GBR';
        if (d.country === 'United Kingdom') d.country = 'united-kingdom';
        if (d.country === 'United States') d.country = 'united-states-of-america';

        const country = getKeyIfExists('territories', d.country) || getKeyIfExists('territoriesISOA3', d.country);
        if (!country) this.logs.error.push(`Skipped unknown territory ${d.country}`);
        else return country;
      }).filter(d => !!d);

      if (countries.length === 0) {
        countries.push(defaultCountry);
        this.logs.error.push(`No territories found for ${imdbId}. Used ${defaultCountry} as default`);
      }

      return countries;
    } catch (error) {
      const message = error.error?.error;
      if (message) {
        this.logs.error.push(`Error while importing countries: ${imdbId}: ${message}`);
        if (message === 'Max requests reached') this.canSaveMovie = false;
      } else {
        this.logs.error.push(`Error while importing countries: ${imdbId}`);
        console.log(error);
      }

      this.logs.error.push(`No territories found for ${imdbId}. Used ${defaultCountry} as default`);
      return [defaultCountry];
    }

  }

  private async languages(imdbId: string): Promise<Language[]> {
    try {
      const { data } = await this.query<{ data: { language: string }[], code: number }>(`/v1/movie/${imdbId}/languages`);
      const languages = data.map(d => {
        if (d.language === 'Mandarin') d.language = 'mandarin-chinese';
        if (d.language === 'Chinese') d.language = 'mandarin-chinese';

        const language = getKeyIfExists('languages', d.language);
        if (!language) this.logs.error.push(`Skipped unknown language ${d.language}`);
        else return language;
      }).filter(d => !!d);

      if (languages.length === 0) {
        languages.push(defaultLanguage);
        this.logs.error.push(`No languages found for ${imdbId}. Used ${defaultLanguage} as default`);
      }

      return languages;
    } catch (error) {
      const message = error.error?.error;
      if (message) {
        this.logs.error.push(`Error while importing languages: ${imdbId}: ${message}`);
        if (message === 'Max requests reached') this.canSaveMovie = false;
      } else {
        this.logs.error.push(`Error while importing languages: ${imdbId}`);
        console.log(error);
      }

      this.logs.error.push(`No languages found for ${imdbId}. Used ${defaultLanguage} as default`);
      return [defaultLanguage];
    }

  }

  private createCredit(name: string) {
    const nameParts = name.split(' ');
    const firstName = nameParts.shift();
    const lastName = nameParts.join(' ');
    return createCredit({ firstName, lastName, status: 'confirmed' });
  }

  private async season(imdbId: string, season: number) {
    const { data } = await this.query<{
      data: {
        numSeason: number,
        year: number,
        episodes: {
          date: string,
          episode: number,
          imdbId: string,
          posterUrl: string,
          title: string
        }[]
      }[]
    }>(`/v1/movie/${imdbId}/season/${season}`);
    return data[0];
  }

  private query<T>(path: string) {
    return firstValueFrom(this.http.get<T>(`${this.api}${path}?token=${this.token}`));
  }


  public async createTitle(imdbId: string, orgId: string) {
    this.canSaveMovie = true;

    const [existingTitle] = await this.titleService.getValue([where('internalRef', '==', imdbId)]);

    if (existingTitle?.id) {
      this.logs.error.push(`Title ${imdbId} already exists as ${existingTitle.id}`);
      return;
    }

    const title = await this.movie(imdbId);
    if (!title) return;

    if (title.type === 'M') {
      const movie = await this.createMovie(title);
      movie.orgIds = [orgId];
      if (!this.canSaveMovie) {
        this.logs.error.push(`Title ${imdbId} "${movie.title.original || movie.title.international}" not created. Some data could not be fetched because of Max requests reached error`);
      } else {
        const newMovie = await this.titleService.create(movie);
        this.logs.succes.push(`movie "${movie.title.original || movie.title.international}" created, id ${newMovie.id}`);
      }
    } else if (title.type === 'S') {
      const seasons = await this.seasons(imdbId);
      seasons.forEach(async s => {
        const season = await this.season(imdbId, s.numSeason);
        this.createSerie(title, { ...season, episodes: season.episodes.length });
      });
    }
  }

  private async createMovie(title: MyapimoviesMovie) {
    const [genres, keywords, directors, countries, languages, actors] = await Promise.all([
      this.genres(title.imdbId),
      this.keywords(title.imdbId),
      this.directors(title.imdbId),
      this.countries(title.imdbId),
      this.languages(title.imdbId),
      this.actors(title.imdbId)
    ]);

    const movie = createMovie({});
    movie.internalRef = title.imdbId;
    movie.contentType = 'movie';
    movie.productionStatus = 'released';
    movie.app = createMovieAppConfig();
    movie.app.catalog.access = true;

    movie.title.international = title.title;
    movie.title.original = title.originalTitle;
    movie.release.year = +title.year;
    movie.release.status = 'confirmed';
    movie.synopsis = title.plot;
    movie.keywords = keywords.map(k => k.keywords);
    movie.genres = genres;
    movie.originalLanguages = languages;
    movie.originCountries = countries;

    movie.directors = directors;
    movie.cast = actors;
    movie.runningTime.status = 'confirmed';
    movie.runningTime.time = +title.runtime.replace('min', '').trim();

    console.log(movie);
    return movie;
  }

  // TODO #1767 to finish
  private createSerie(title: MyapimoviesSerie, season: { numSeason: number, year: number, episodes: number }) {
    const serie = createMovie({});
    serie.contentType = 'tv';
    serie.internalRef = title.imdbId;

    serie.title.original = title.title;
    serie.title.series = season.numSeason;
    serie.release.year = season.year;

    serie.runningTime.episodeCount = season.episodes;
    console.log(serie);
  }
}