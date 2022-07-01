import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';

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
  type: string,
  votes: string,
  year: string,
}

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

  public async movie(imdbId: string): Promise<MyapimoviesMovie> {
    const { data } = await this.query<{ data: MyapimoviesMovie, code: number }>(`/v1/movie/${imdbId}`);
    return data;
  }


  public async genres(imdbId: string) {
    const { data } = await this.query<{ data: { genre: string }[], code: number }>(`/v1/movie/${imdbId}/genres`);
    return data;
  }

  private async query<T>(path: string) {
    try {
      return firstValueFrom(this.http.get<T>(`${this.api}${path}?token=${this.token}`));
    } catch (e) {
      throw new Error(`Error while fetching ${this.api}${path}: ${e}`);
    }
  }

}