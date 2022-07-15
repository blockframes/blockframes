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
  'War': 'drama'
};

export type ImdbImportLogs = { error: string[], succes: string[] };

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
      if (error.error?.error) {
        this.logs.error.push(`Error while importing movie: ${imdbId}: ${error.error.error}`);
      } else {
        this.logs.error.push(`Error while importing movie: ${imdbId}`);
        console.log(error);
      }
    }
  }

  private async genres(imdbId: string): Promise<Genre[]> {
    try {
      const { data } = await this.query<{ data: { genre: string }[], code: number }>(`/v1/movie/${imdbId}/genres`);
      return data.map(d => {
        if (genreMap[d.genre]) return genreMap[d.genre];
        else this.logs.error.push(`Unknown genre ${d.genre}`);
      }).filter(d => !!d);
    } catch (error) {
      if (error.error?.error) {
        this.logs.error.push(`Error while importing genres: ${imdbId}: ${error.error.error}`);
      } else {
        this.logs.error.push(`Error while importing genres: ${imdbId}`);
        console.log(error);
      }

      return [];
    }
  }

  private async keywords(imdbId: string) {
    try {
      const { data } = await this.query<{ data: { keywords: string }[], code: number }>(`/v1/movie/${imdbId}/keywords`);
      return data;
    } catch (error) {
      if (error.error?.error) {
        this.logs.error.push(`Error while importing keywords: ${imdbId}: ${error.error.error}`);
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

  private async crew(imdbId: string): Promise<{ type: 'DIRECTOR', credit: Credit }[]> {
    try {
      const { data } = await this.query<{ data: { type: 'DIRECTOR', name: { name: string, imdbId: string } }[], code: number }>(`/v1/movie/${imdbId}/crew`);
      return data.map(d => {
        const firstName = d.name.name.split(' ')[0];
        const lastName = d.name.name.split(' ')[1];
        const credit = createCredit({ firstName, lastName });

        return { type: d.type, credit };
      });
    } catch (error) {
      if (error.error?.error) {
        this.logs.error.push(`Error while importing crew: ${imdbId}: ${error.error.error}`);
      } else {
        this.logs.error.push(`Error while importing crew: ${imdbId}`);
        console.log(error);
      }

      return [];
    }
  }

  private async countries(imdbId: string): Promise<Territory[]> {
    try {
      const { data } = await this.query<{ data: { country: string }[], code: number }>(`/v1/movie/${imdbId}/countries`);
      return data.map(d => {
        if (d.country === 'UK') d.country = 'GBR';

        const country = getKeyIfExists('territories', d.country) || getKeyIfExists('territoriesISOA3', d.country);
        if (!country) this.logs.error.push(`Unknown territory ${d.country}`);
        else return country;
      }).filter(d => !!d);
    } catch (error) {
      if (error.error?.error) {
        this.logs.error.push(`Error while importing countries: ${imdbId}: ${error.error.error}`);
      } else {
        this.logs.error.push(`Error while importing countries: ${imdbId}`);
        console.log(error);
      }

      return [];
    }

  }

  private async languages(imdbId: string): Promise<Language[]> {
    try {
      const { data } = await this.query<{ data: { language: string }[], code: number }>(`/v1/movie/${imdbId}/languages`);
      return data.map(d => {
        if (d.language === 'Mandarin') d.language = 'mandarin-chinese';

        const language = getKeyIfExists('languages', d.language);
        if (!language) this.logs.error.push(`Unknown language ${d.language}`);
        else return language;
      }).filter(d => !!d);
    } catch (error) {
      if (error.error?.error) {
        this.logs.error.push(`Error while importing languages: ${imdbId}: ${error.error.error}`);
      } else {
        this.logs.error.push(`Error while importing languages: ${imdbId}`);
        console.log(error);
      }

      return [];
    }

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

  private async query<T>(path: string) {
    try {
      return firstValueFrom(this.http.get<T>(`${this.api}${path}?token=${this.token}`));
    } catch (e) {
      throw new Error(`Error while fetching ${this.api}${path}: ${e}`);
    }
  }


  public async createTitle(imdbId: string, orgId: string) {

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
      const newMovie = await this.titleService.create(movie);
      this.logs.succes.push(`movie "${movie.title.original}" created, id ${newMovie.id}`);
    } else if (title.type === 'S') {
      const seasons = await this.seasons(imdbId);
      seasons.forEach(async s => {
        const season = await this.season(imdbId, s.numSeason);
        this.createSerie(title, { ...season, episodes: season.episodes.length });
      });
    }
  }

  private async createMovie(title: MyapimoviesMovie) {

    const [genres, keywords, crew, countries, languages] = await Promise.all([
      this.genres(title.imdbId),
      this.keywords(title.imdbId),
      this.crew(title.imdbId),
      this.countries(title.imdbId),
      this.languages(title.imdbId),
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

    movie.directors = crew.filter(c => c.type === 'DIRECTOR').map(c => c.credit);

    movie.runningTime.status = 'confirmed';
    movie.runningTime.time = +title.runtime.replace('min', '').trim();

    console.log(movie);
    return movie;
  }

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