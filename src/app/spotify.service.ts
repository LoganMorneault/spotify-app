import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  public client_id: string = "04b0a7139be648e0bc68f30e60810ac5";
  private client_secret: string = "0920b2d76151481687d383cbb642e3b3";
  private market: string = "US";

  public access_token: string = "";
  public refresh_token: string = "";
  public token_type: string = "";
  public expires_in: number = 0;

  public currentUser: any = undefined;

  constructor(private http: HttpClient, private router: Router) {
    //localStorage.clear();

    const token_time = localStorage.getItem('token_time')!;
    const time_since_last_token = Date.now() - Number(token_time);

    // If previous token is < 1hr old, reuse it.
    if (time_since_last_token < 3600 * 1000) {
      console.log("REUSING TOKEN!");
      this.access_token = localStorage.getItem('access_token')!;
      this.refresh_token = localStorage.getItem('refresh_token')!;
      this.token_type = localStorage.getItem('token_type')!;
      this.currentUser = JSON.parse(localStorage.getItem('user')!)
      setInterval(this.refreshUserAccessToken, 3600 * 1000 - time_since_last_token);
    }
    else {
      this.resetApiToken();
    }
  }


  // Gets a new API token
  // Sets a timeout to generate a new token once the first expires.
  private resetApiToken = (): void => {
    console.log("RESET API TOKEN")

    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
    const body = `grant_type=client_credentials&client_id=${this.client_id}&client_secret=${this.client_secret}`

    this.http.post("https://accounts.spotify.com/api/token", body, { "headers": headers })
      .subscribe((data: any) => {
        if (data) {
          this.access_token = data["access_token"];
          this.token_type = data["token_type"];
          this.expires_in = data["expires_in"]; // Time until token expires, in seconds.
          this.refresh_token = (data["refresh_token"]);

          localStorage.setItem('token_time', Date.now().toString());
          localStorage.setItem('access_token', this.access_token);
          localStorage.setItem('token_type', this.token_type);
          localStorage.setItem('refresh_token', this.refresh_token);
          localStorage.setItem('user', JSON.stringify(null));

          setTimeout(this.resetApiToken, this.expires_in * 1000);
        }
      });
  }

  // Gets a new API token with credentials for the current user.
  public generateUserAccessToken = (code: string, verifier: string) => {
    let redirect_url = 'http://localhost:4200/login';

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded');

    const params = `client_id=${this.client_id}&grant_type=authorization_code&code=${code}&redirect_uri=${redirect_url}&code_verifier=${verifier}`;


    this.http.post("https://accounts.spotify.com/api/token", params, { "headers": headers })
      .subscribe((data: any) => {
        if (data) {
          console.log(data);
          this.access_token = data["access_token"];
          this.token_type = data["token_type"];
          this.refresh_token = data["refresh_token"] ?? this.refresh_token;
          this.expires_in = data["expires_in"]; // Time until token expires, in seconds.

          localStorage.setItem('token_time', Date.now().toString());
          localStorage.setItem('access_token', this.access_token);
          localStorage.setItem('token_type', this.token_type);
          localStorage.setItem('refresh_token', this.refresh_token);

          console.log("authenticated token", this.access_token);

          setTimeout(this.resetApiToken, this.expires_in * 1000);

          this.getCurrentUserProfile().subscribe(data => {
            if (data) {
              console.log(data);
              this.currentUser = data;
              localStorage.setItem('user', JSON.stringify(this.currentUser));

              this.router.navigate(['/home']);
            }
          })
        }
      });
  }

  public refreshUserAccessToken() {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded')

    const body = `grant_type=refresh_token&client_id=${this.client_id}&refresh_token=${this.refresh_token}`

    this.http.post("https://accounts.spotify.com/api/token", body, { "headers": headers })
      .subscribe((data: any) => {
        if (data) {
          this.access_token = data["access_token"];
          this.refresh_token = data["refresh_token"] ?? this.refresh_token;
          this.token_type = data["token_type"];
          this.expires_in = data["expires_in"]; // Time until token expires, in seconds.

          localStorage.setItem('token_time', Date.now().toString());
          localStorage.setItem('access_token', this.access_token);
          localStorage.setItem('token_type', this.token_type);
          localStorage.setItem('user', JSON.stringify(null));

          setTimeout(this.resetApiToken, this.expires_in * 1000);
        }
      });
  }

  // Logs out the current user.
  public logOut() {
    this.resetApiToken();
  }

  // Gets default track recommendations
  public getDefaultRecommendations = (): Observable<Object> => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);
    const params = `limit=10&market=${this.market}&seed_genres=${['pop', 'rap', 'rock', 'alternative'].join("%2C")}`;

    return this.http.get("https://api.spotify.com/v1/recommendations?" + params, { "headers": headers });
  }

  public getRecommendationsWithSeed = (seedStr: string): any => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);
    const params = `limit=10&market=${this.market}&seed_tracks=${seedStr}`

    return this.http.get("https://api.spotify.com/v1/recommendations?" + params, { "headers": headers });
  }

  // Gets all featured playlists
  public getFeaturedPlaylists = (): Observable<Object> => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);
    const params = `country=${this.market}`

    return this.http.get("https://api.spotify.com/v1/browse/featured-playlists?" + params, { "headers": headers });
  }

  public getCurrentUserPlaylists = () => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);
    return this.http.get("https://api.spotify.com/v1/me/playlists", { "headers": headers });
  }

  // Executes a search
  public getSearchResults = (query: string): Observable<Object> => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);
    const params = `query=${encodeURIComponent(query)}&type=${["album", "playlist", "track", "artist"].join()}&market=US`

    return this.http.get("https://api.spotify.com/v1/search?" + params, { "headers": headers });
  }

  public getArtist = (artistId: string): Observable<Artist> => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);
    return this.http.get<Artist>("https://api.spotify.com/v1/artists/" + artistId, { "headers": headers });
  }

  public getAlbum = (albumId: string): Observable<Album> => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);
    return this.http.get<Album>("https://api.spotify.com/v1/albums/" + albumId, { "headers": headers });
  }

  public getPlaylist = (playlistId: string): Observable<Playlist> => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);
    return this.http.get<Playlist>("https://api.spotify.com/v1/playlists/" + playlistId, { "headers": headers });
  }

  public getTrack = (trackId: string): Observable<Track> => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);
    return this.http.get<Track>("https://api.spotify.com/v1/tracks/" + trackId, { "headers": headers });
  }

  public getTopTracks = (artistId: string): Observable<any> => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);
    const params = `country=${this.market}`;

    return this.http.get<any>(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?` + params, { "headers": headers });
  }

  public getArtistAlbums = (artistId: string): Observable<any> => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);
    const params = `country=${this.market}`;

    return this.http.get<any>(`https://api.spotify.com/v1/artists/${artistId}/albums?` + params, { "headers": headers });
  }

  public getUserProfile = (user_id: string): Observable<any> => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);
    return this.http.get<any>(`https://api.spotify.com/v1/users/${user_id}`, { 'headers': headers });
  }

  public getUserPlaylists = (user_id: string): Observable<any> => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);
    return this.http.get<any>(`https://api.spotify.com/v1/users/${user_id}/playlists`, { 'headers': headers });
  }

  public getCurrentUserProfile = (): Observable<any> => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);

    return this.http.get<any>(`https://api.spotify.com/v1/me`, { 'headers': headers });
  }

  public getCurrentUserTopTracks = (time_range = 'medium_term'): Observable<any> => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);
    const params = `time_range=${time_range}`;
    return this.http.get<any>(`https://api.spotify.com/v1/me/top/tracks?` + params, { 'headers': headers });
  }

  public getCurrentUserTopArtists = (): Observable<any> => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);
    return this.http.get<any>(`https://api.spotify.com/v1/me/top/artists`, { 'headers': headers });
  }

  public getCurrentUserFollowedArtists = (): Observable<any> => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);
    return this.http.get<any>(`https://api.spotify.com/v1/me/following?type=artist`, { 'headers': headers });
  }

  public doesUserLikeTrack = (id: string): Observable<any> => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);
    return this.http.get<any>(`https://api.spotify.com/v1/me/tracks/contains?ids=${id}`, { 'headers': headers });
  }

  public doesUserLikeAlbum = (id: string): Observable<any> => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);
    return this.http.get<any>(`https://api.spotify.com/v1/me/albums/contains?ids=${id}`, { 'headers': headers });
  }

  public saveTrack = (track: Track): Observable<any> => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);
    return this.http.put<any>(`https://api.spotify.com/v1/me/tracks?ids=${track.id}`, "", { 'headers': headers });
  }

  public unsaveTrack = (track: Track): Observable<any> => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);
    return this.http.delete<any>(`https://api.spotify.com/v1/me/tracks?ids=${track.id}`, { 'headers': headers });
  }

  public saveAlbum = (album: Album): Observable<any> => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);
    return this.http.put<any>(`https://api.spotify.com/v1/me/albums?ids=${album.id}`, "", { 'headers': headers });
  }

  public unsaveAlbum = (album: Album): Observable<any> => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);
    return this.http.delete<any>(`https://api.spotify.com/v1/me/albums?ids=${album.id}`, { 'headers': headers });
  }

  public doesUserFollowArtist = (id: string): Observable<any> => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);
    return this.http.get<any>(`https://api.spotify.com/v1/me/following/contains?type=artist&ids=${id}`, { 'headers': headers });
  }

  public doesUserFollowUser = (user_id: string): Observable<any> => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);
    return this.http.get<any>(`https://api.spotify.com/v1/me/following/contains?type=user&ids=${user_id}`, { 'headers': headers });
  }

  public followArtist = (artist: Artist) => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);
    return this.http.put<any>(`https://api.spotify.com/v1/me/following?type=artist&ids=${artist.id}`, "", { 'headers': headers });
  }

  public unfollowArtist = (artist: Artist) => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);
    return this.http.delete<any>(`https://api.spotify.com/v1/me/following?type=artist&ids=${artist.id}`, { 'headers': headers });
  }

  public followUser = (user: any) => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);
    return this.http.put<any>(`https://api.spotify.com/v1/me/following?type=user&ids=${user.id}`, "", { 'headers': headers });
  }

  public unfollowUser = (user: any) => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);
    return this.http.delete<any>(`https://api.spotify.com/v1/me/following?type=user&ids=${user.id}`, { 'headers': headers });
  }

  public doesUserFollowPlaylist = (playlist_id: string) => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`).set('accept', '*/*');
    return this.http.get<any>(`https://api.spotify.com/v1/playlists/${playlist_id}/followers/contains?ids=${this.currentUser.id}`, { 'headers': headers });
  }

  public followPlaylist = (playlist: Playlist) => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);
    return this.http.put<any>(`https://api.spotify.com/v1/playlists/${playlist.id}/followers`, "", { 'headers': headers });
  }

  public unfollowPlaylist = (playlist: Playlist) => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);
    return this.http.delete<any>(`https://api.spotify.com/v1/playlists/${playlist.id}/followers`, { 'headers': headers });
  }

  public updatePlaylistDetails = (id: string, obj: Object) => {
    const headers = new HttpHeaders().set('authorization', `${this.token_type} ${this.access_token}`);

    return this.http.put<any>(`https://api.spotify.com/v1/playlists/${id}`, obj, { 'headers': headers });
  }

}


export class Track {
  public album: any = undefined;
  public artists: Artist[] = [];
  public disc_number: number;
  public duration_ms: number;
  public explicit: boolean;
  public external_ids: any;
  public external_urls: any;
  public href: string;
  public id: string;
  public is_local: boolean;
  public is_playable: boolean;
  public name: string;
  public popularity: number;
  public preview_url: string;
  public track_number: number;
  public type: string;
  public uri: string;

  constructor(album: any, artists: Artist[], disc_number: number, duration_ms: number, explicit: boolean, external_ids: any, external_urls: any, href: string, id: string, is_local: boolean, is_playable: boolean, name: string, popularity: number, preview_url: string, track_number: number, type: string, uri: string) {
    this.album = album;
    this.artists = artists;
    this.disc_number = disc_number;
    this.duration_ms = duration_ms;
    this.explicit = explicit;
    this.external_ids = external_ids;
    this.external_urls = external_urls;
    this.href = href;
    this.id = id;
    this.is_local = is_local;
    this.is_playable = is_playable;
    this.name = name;
    this.popularity = popularity;
    this.preview_url = preview_url;
    this.track_number = track_number;
    this.type = type;
    this.uri = uri;
  }
}

export class Artist {
  public external_urls: any;
  public followers: any;
  public genres: any;
  public href: string;
  public id: string;
  public images: SpotifyImage[];
  public name: string;
  public popularity: number;
  public type: string;
  public uri: string;

  public constructor(external_urls: any, href: string, id: string, name: string, type: string, uri: string, followers: any, genres: any, images: SpotifyImage[], popularity: number) {
    this.external_urls = external_urls;
    this.href = href;
    this.id = id;
    this.name = name;
    this.type = type;
    this.uri = uri;
    this.followers = followers;
    this.genres = genres;
    this.images = images;
    this.popularity = popularity;
  }
}

export class Album {
  public album_group: string;
  public album_type: string;
  public artists: Artist[];
  public external_urls: any;
  public href: string;
  public id: string;
  public images: SpotifyImage[];
  public is_playable: boolean;
  public name: string;
  public release_date: string;
  public release_date_precision: string;
  public total_tracks: number;
  public type: string;
  public uri: string;

  public constructor(album_group: string, album_type: string, artists: Artist[], external_urls: any, href: string, id: string, images: SpotifyImage[], is_playable: boolean, name: string, release_date: string, release_date_precision: string, total_tracks: number, type: string, uri: string) {
    this.album_group = album_group;
    this.album_type = album_type;
    this.artists = artists;
    this.external_urls = external_urls;
    this.href = href;
    this.id = id;
    this.images = images;
    this.is_playable = is_playable;
    this.name = name;
    this.release_date = release_date;
    this.release_date_precision = release_date_precision;
    this.total_tracks = total_tracks;
    this.type = type;
    this.uri = uri;
  }
}

export class SpotifyImage {
  public url: string;
  public height: number;
  public width: number;

  public constructor(url: string, height: number, width: number) {
    this.url = url;
    this.height = height;
    this.width = width;
  }
}

export class Playlist {
  public collaborative: boolean;
  public description: string;
  public external_urls: any;
  public href: string;
  public id: string;
  public images: SpotifyImage[];
  public name: string;
  public owner: any;
  public isPublic: boolean;
  public snapshot_id: string;
  public tracks: any;
  public type: string;
  public uri: string;

  public constructor(collaborative: boolean, description: string, external_urls: any, href: string, id: string, images: SpotifyImage[], name: string, owner: any, isPublic: boolean, snapshot_id: string, tracks: any, type: string, uri: string) {
    this.collaborative = collaborative;
    this.description = description;
    this.external_urls = external_urls;
    this.href = href;
    this.id = id;
    this.images = images;
    this.name = name;
    this.owner = owner;
    this.isPublic = isPublic;
    this.snapshot_id = snapshot_id;
    this.tracks = tracks;
    this.type = type;
    this.uri = uri;
  }


}

export function getRandomSubarray(arr: any[], size: number) {
  var shuffled = arr.slice(0), i = arr.length, temp, index;
  while (i--) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(0, size);
}