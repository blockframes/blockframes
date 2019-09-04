export interface OmdbMovie {
    Title: string;
    Year: string;
    Rated: string;
    Released: string;
    Runtime: string;
    Genre: string;
    Director: string;
    Writer: string;
    Actors: string;
    Plot: string;
    Language: string;
    Country: string;
    Awards: string;
    Poster: string;
    Metascore: string;
    imdbRating: string;
    imdbVotes: string;
    imdbID: string;
    Type: string;
    Response: string;
}

export interface OmdbSearchResult {
    Title: string;
    Year: string;
    imdbID: string;
    Type: string;
    Poster: string;
}

export interface OmdbSearch {
    Search: OmdbSearchResult[];
    totalResults: string;
    Response: string;
}

export interface OmdbError {
    Response: string;
    Error: string;
}

export function isError(response: OmdbSearch | OmdbMovie | OmdbError): response is OmdbError {
    return response.Response === "False";
}

export function isMovie(response: OmdbMovie ): response is OmdbMovie {
    return response.Type === "movie";
}
