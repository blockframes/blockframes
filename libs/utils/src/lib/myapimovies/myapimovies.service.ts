import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { createCredit, createMovie, Credit, Genre, Language, Territory } from '@blockframes/model';
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
  Comedy: 'comedy'
};

@Injectable({ providedIn: 'root' })
export class MyapimoviesService {

  /**
   * Swagger documentation
   * https://www.myapimovies.com/api/swagger-ui.html
   */
  private api = 'https://www.myapimovies.com/api';

  constructor(private http: HttpClient) { }

  private token = '';

  public async health() {
    const { status } = await this.query<{ status: string }>(`/v1/health`);
    return status;
  }

  private async movie(imdbId: string): Promise<MyapimoviesMovie | MyapimoviesSerie> {
    const { data } = await this.query<{ data: MyapimoviesMovie | MyapimoviesSerie, code: number }>(`/v1/movie/${imdbId}`);
    switch (data.type) {
      case 'M':
        return data as MyapimoviesMovie;
      case 'S':
        return data as MyapimoviesSerie;
      default:
        throw new Error('Unhandled content type');
    }
  }

  private async genres(imdbId: string): Promise<Genre[]> {
    const { data } = await this.query<{ data: { genre: string }[], code: number }>(`/v1/movie/${imdbId}/genres`);
    return data.map(d => {
      if (genreMap[d.genre]) return genreMap[d.genre];
      else console.log(`Unknown genre ${d.genre}`);
    }).filter(d => !!d);
  }

  private async keywords(imdbId: string) {
    const { data } = await this.query<{ data: { keywords: string }[], code: number }>(`/v1/movie/${imdbId}/keywords`);
    return data;
  }

  private async seasons(imdbId: string) {
    const { data } = await this.query<{ data: { numSeason: number, year: number }[], code: number }>(`/v1/movie/${imdbId}/season`);
    return data;
  }

  private async crew(imdbId: string): Promise<{ type: 'DIRECTOR', credit: Credit }[]> {
    const { data } = await this.query<{ data: { type: 'DIRECTOR', name: { name: string, imdbId: string } }[], code: number }>(`/v1/movie/${imdbId}/crew`);
    return data.map(d => {
      const firstName = d.name.name.split(' ')[0];
      const lastName = d.name.name.split(' ')[1];
      const credit = createCredit({ firstName, lastName });

      return { type: d.type, credit };
    });
  }

  private async countries(imdbId: string): Promise<Territory[]> {
    const { data } = await this.query<{ data: { country: string }[], code: number }>(`/v1/movie/${imdbId}/countries`);
    return data.map(d => {
      const country = getKeyIfExists('territories', d.country) || getKeyIfExists('territoriesISOA3', d.country);
      if (!country) console.log(`Unknown territory ${d.country}`);
      else return country;
    }).filter(d => !!d);
  }

  private async languages(imdbId: string): Promise<Language[]> {
    const { data } = await this.query<{ data: { language: string }[], code: number }>(`/v1/movie/${imdbId}/languages`);
    return data.map(d => {
      const language = getKeyIfExists('languages', d.language);
      if (!language) console.log(`Unknown language ${d.language}`);
      else return language;
    }).filter(d => !!d);
  }

  private async actors(imdbId: string) {
    const { data } = await this.query<{ data: { character: string, main: boolean, name: { name: string, imdbId: string } }[], code: number }>(`/v1/movie/${imdbId}/actors`);
    return data;
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


  public async createTitle(imdbId: string) {
    const title = await this.movie(imdbId);
    if (title.type === 'M') {
      const movie = await this.createMovie(title);
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
      //this.actors(title.imdbId),
    ]);

    console.log(crew)

    const movie = createMovie({});
    movie.contentType = 'movie';

    movie.title.international = title.title;
    movie.title.original = title.originalTitle;
    movie.release.year = +title.year;
    movie.synopsis = title.plot;
    movie.keywords = keywords.map(k => k.keywords);
    movie.genres = genres;
    movie.originalLanguages = languages;
    movie.originCountries = countries;

    movie.directors = crew.filter(c => c.type === 'DIRECTOR').map(c => c.credit);

    console.log(movie);

    //movie.runningTime =




  }

  private createSerie(title: MyapimoviesSerie, season: { numSeason: number, year: number, episodes: number }) {
    const serie = createMovie({});
    serie.contentType = 'tv';

    serie.title.original = title.title;
    serie.title.series = season.numSeason;
    serie.release.year = season.year;

    serie.runningTime.episodeCount = season.episodes;
    console.log(serie);
  }
}