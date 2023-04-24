import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Album, Artist, Playlist, Track, SpotifyService } from '../spotify.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  public criteria: string = "";

  public albums: Album[] = [];
  public artists: Artist[] = [];
  public playlists: Playlist[] = [];
  public tracks: Track[] = [];

  constructor(private activatedRoute: ActivatedRoute, private spotifyService: SpotifyService) { }

  ngOnInit() {
    console.log("innit");

    this.activatedRoute.queryParams.subscribe((query: Params) => {
      this.criteria = query["criteria"] ?? "";

      setTimeout(() => {
        this.executeSearch();
      }, 200);
    });
  }


  /// I need to execute a search
  public executeSearch = () => {
    if (this.criteria == "") return;

    this.spotifyService.getSearchResults(this.criteria).subscribe((data: any) => {
      console.log(data);
      if (data) {
        this.tracks = data["tracks"].items.slice(0, 12);
        this.artists = data["artists"].items.slice(0, 12);
        this.albums = data["albums"].items.slice(0, 12);
        this.playlists = data["playlists"].items.slice(0, 12);
      }
    }, error => {
      this.executeSearch();
    });
  }

  // Goes to Artist page
  public onArtistClick = (artist: Artist) => {
    window.location.assign("../details/artist/" + artist.id);
  }

  public onAlbumClick = (album: Album) => {
    window.location.assign("../details/album/" + album.id);
  }

  public onPlaylistClick = (playlist: Playlist) => {
    window.location.assign("../details/playlist/" + playlist.id);
  }

  public onTrackClick = (track: Track) => {
    window.location.assign("../details/track/" + track.id);
  }

}
