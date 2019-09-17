/**
 * This is a very simple client to query unofficial IMDB API: https://www.omdbapi.com/
 * 
 * There isn't an official API to imdb but
 * imdb DOES release all of their data in text files nightly, 
 * so unofficial sites have popped up providing RESTful APIs against that data
 * 
 * Based on the work of WORR:
 * NodeJS npm package: https://www.npmjs.com/package/imdb-api
 * Github: https://github.com/worr/node-imdb-api
 *  
 * To get a omdbapi key (1000 daily limit):
 * http://www.omdbapi.com/apikey.aspx 
 * 
 * 
 * EXAMPLE USAGE:
 * 
 * import { ImdbService } from '@blockframes/utils';
 * 
 * constructor(private imdbService: ImdbService) {}
 * 
 * const apiKey = '4d1be897';
 * this.imdbService.setApiKey(apiKey)
 * 
 * // Get movie by name
 * this.imdbService.get({name: 'Parasite'}).then(console.log).catch(console.log);
 * 
 * // Get movie by name and year
 * this.imdbService.get({name: 'The Toxic Avenger', year: 1984}).then(console.log).catch(console.log);
 * 
 * // Get movie by id
 * this.imdbService.get({id: 'tt0120338'}).then(console.log).catch(console.log);
 * 
 * // Search by title
 * this.imdbService.search({name: 'titanic' }).then(console.log).catch(console.log);
 * 
 *  // Search by title and year
 * this.imdbService.search({name: 'titanic', year: 1997}).then(console.log).catch(console.log);
*/

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  isError,
  isMovie,
  OmdbError,
  OmdbMovie,
  OmdbSearch,
  OmdbSearchResult,
} from "./interfaces";


/**
 * An explicit request for a movie. Does not do searching, this is meant
 * to specify *one* movie.
 *
 * One of {@link name} or {@link id} *MUST* be requested. {@link year} can be used to ensure
 * that the movie you're looking for is selected in the case that there exists
 * more than one movie with the same name.
 */
export interface MovieRequest {
  /**
   * Name of the movie
   *
   * Unfortunately, only English names are supported
   * by omdb at the moment.
   */
  name?: string;

  /**
   * imdb id of the movie
   */
  id?: string;

  /**
   * Year that the movie was released
   */
  year?: number;
}

/**
 * A search for a movie. This will fetch multiple results based on fuzzy matches
 * for a particular piece of media.
 */
export interface SearchRequest {
  /**
   * Title of the movie that we're looking for. Unfortunately, only English
   * names are supported by omdb at the moment.
   */
  name: string;

  /**
   * Year that the movie was released
   */
  year?: number;
}

export class ImdbError {
  public name = "imdb api error";

  constructor(public message: string) { }
}

/**
 * @hidden
 */
const transTable = {
  Genre: "genres",
  Language: "languages",
  imdbRating: "rating",
  imdbVotes: "votes",
};

/**
 * A single search result from either {@link search} or {@link Client.search}.
 * This is not intended to be directly created by api consumers.
 */
export class SearchResult {
  /** name of the movie */
  public title: string;
  /** name of the movie */
  public name: string;
  /** year the movie was released */
  public year: number;
  /** imdb id of the movie */
  public imdbid: string;
  /** type of media we found */
  public type: string;
  /** link to the poster for this movie */
  public poster: string;

  constructor(obj: OmdbSearchResult) {
    for (const attr of Object.getOwnPropertyNames(obj)) {
      if (attr === "Year") {
        this[attr.toLowerCase()] = parseInt(obj[attr], 10);
      } else {
        this[attr.toLowerCase()] = obj[attr];
      }
    }

    this.name = this.title;
  }
}

/**
 * A single page of {@link SearchResult}s. You can call {@link SearchResults.next} to fetch
 * the next page of results. This is not intended to be created by an API consumer, but instead
 * to be returned by {@link search} or {@link Client.search}.
 */
export class SearchResults {
  public results: SearchResult[] = [];
  public totalresults: number;
  public page: number;

  /**
   * Builds a new {@link SearchResults}. Not intended to be called directly by
   * API consumers, as it only creates the object from omdb results.
   *
   * @param obj Search results from omdb
   * @param page Page number we're fetching
   */
  constructor(obj: OmdbSearch, page: number) {
    this.page = page;

    for (const attr of Object.getOwnPropertyNames(obj)) {
      if (attr === "Search") {
        for (const result of obj.Search) {
          this.results.push(new SearchResult(result));
        }
      } else if (attr === "totalResults") {
        this[attr.toLowerCase()] = parseInt(obj[attr], 10);
      } else {
        this[attr.toLowerCase()] = obj[attr];
      }
    }
  }

}

/**
 * A movie as returned by {@link get}, {@link search}, or any of the methods
 * from {@link Client}. This is not meant to be created directly by consumers of
 * this lib, but instead through querying omdb.
 */
export class ImdbMovie {
  /** id of the movie on imdb */
  public imdbid: string;
  /** direct URL to the movie on imdb */
  public imdburl: string;
  /** the genres that this movie belongs to */
  public genres: string;
  /** languages this movie was released in */
  public languages: string;
  /** countries this movie was released in */
  public country: string;
  /** votes received on imdb */
  public votes: string;
  /** whether or not this is a TV series */
  public series: boolean;
  /** the rating as it appears on imdb */
  public rating: number;
  /** the runtime of the movie */
  public runtime: string;
  /** the title of the movie in English */
  public title: string;
  /** year the movie was released */
  public year: number;

  /** type of media */
  public type: string;
  /** link to the poster for this movie */
  public poster: string;
  /** score from a bunch of different review sites */
  public metascore: string;
  /** the plot (can either be long or short as specified in {@link MovieRequest}) */
  public plot: string;
  /** what the movie was rated in its country of release */
  public rated: string;
  /** the directors of the movie */
  public director: string;
  /** writers of the movie */
  public writer: string;
  /** leading actors that starred in the movie */
  public actors: string;
  /** date that the movie was originally released */
  public released?: Date;
  /** title of the movie */
  public name: string;
  /** production company of the movie */
  public production: string;

  /**
   * @hidden
   */
  protected _yearData: string;

  /**
   * This takes a result from omdb, and transforms it into an
   * object consumable by customers of imdb-api.
   *
   * This isn't meant for direct consumption by API consumers,
   * and consumers should look at {@link get}, {@link search} or
   * any of the methods on {@link Client} to get a movie instead.
   *
   * @param obj Results from omdb
   */
  constructor(obj: OmdbMovie) {
    for (const attr of Object.getOwnPropertyNames(obj)) {
      if (attr === "Year") {
        this._yearData = obj[attr];
        // check for emdash (ie: - or –) possibly comming from omdb
        if (!obj[attr].match(/\d{4}[\-–](?:\d{4})?/)) {
          const val = parseInt(obj[attr], 10);
          if (isNaN(val)) {
            throw new TypeError("invalid year");
          }
          this[attr.toLowerCase()] = val;
        }
      } else if (attr === "Released") {
        const val = new Date(obj[attr]);
        if (isNaN(val.getTime())) {
          this.released = undefined;
        } else {
          this.released = val;
        }
      } else if (attr === "imdbRating") {
        const key = transTable[attr];
        const val = parseFloat(obj[attr]);
        this[key] = isNaN(val) ? 0 : val;
      } else if (transTable[attr] !== undefined) {
        this[transTable[attr]] = obj[attr];
      } else {
        this[attr.toLowerCase()] = obj[attr];
      }
    }

    this.name = this.title;
    this.series = this.type === "movie" ? false : true;
    this.imdburl = "https://www.imdb.com/title/" + this.imdbid;
  }
}

@Injectable({ providedIn: 'root' })
export class ImdbService {

  /**
   * API key for omdbapi. Needed to make any API calls.
   *
   * Get one [here](https://www.patreon.com/posts/api-is-going-10743518)
   */
  private apiKey: string;

  private omdbapi = "https://www.omdbapi.com/";

  constructor(private http: HttpClient) {}

  public setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Fetches a single movie by arbitrary criteria
   *
   * @param req set of requirements to search for
   *
   * @return a promise yielding a movie
   */
  public get(req: MovieRequest): Promise<ImdbMovie> {

    const params = {
      apikey: this.apiKey,
      i: undefined, // imdb id if any
      plot: 'full', // we want to retreive full movie plot
      r: 'json', // expected response type
      t: undefined, // movie title if any
      y: req.year ? req.year.toString() : undefined // movie year
    };

    if (req.name) {
      params.t = req.name.trim();
      delete params.i;
    } else if (req.id) {
      params.i = req.id;
      delete params.t;
    } else {
      return Promise.reject(new ImdbError("Missing one of req.id or req.name"));
    }

    return this.http.get(this.omdbapi, { params })
      .toPromise()
      .then((data: OmdbMovie | OmdbError) => {
        let ret: ImdbMovie;
        if (isError(data)) {
          throw new ImdbError(`${data.Error}: ${(req.name ? req.name : req.id)}`);
        }

        if (isMovie(data)) {
          ret = new ImdbMovie(data);
        } else {
          throw new ImdbError('fetched data is not a movie');
        }

        return Promise.resolve(ret);
      });
  }

  /**
   * Searches for a movie by arbitrary criteria
   *
   * @param req set of requirements to search for
   * @param page page number to return
   *
   * @return a promise yielding search results
   */
  public search(req: SearchRequest, page: number = 1): Promise<SearchResults> {

    const params = {
      apikey: this.apiKey,
      page: page.toString(), // page number
      r: "json", // expected response type
      s: req.name.trim(), // our search string
      type: "movie", // exptected item type since api can retreive series, movies, episodes ..
      y: req.year ? req.year.toString() : undefined // movie year
    };

    return this.http.get(this.omdbapi, { params })
      .toPromise()
      .then((data: OmdbSearch | OmdbError) => {
        if (isError(data)) {
          throw new ImdbError(`${data.Error}: ${req.name}`);
        }

        return Promise.resolve(new SearchResults(data, page));
      });
  }

}
