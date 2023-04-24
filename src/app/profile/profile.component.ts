import { Component, OnInit } from '@angular/core';
import { Artist, SpotifyService, Track } from '../spotify.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  public user: any = undefined;
  public tracks: Track[] = [];
  public artists: Artist[] = [];

  public constructor(private spotifyService: SpotifyService) { }

  public ngOnInit(): void {
    setTimeout(() => {
      this.getUserProfile();
      this.getTopTracks();
      this.getFollowedArtists();
    }, 200);
  }

  public getUserProfile = () => {
    this.spotifyService.getCurrentUserProfile().subscribe((data: any) => {
      if (data) {
        this.user = data;
      }
    }, error => {
      window.location.href = "../home"
    });
  }

  public getTopTracks = () => {
    this.spotifyService.getCurrentUserTopTracks().subscribe((data: any) => {
      if (data) {
        this.tracks = data.items.slice(0, 5);
      }
    }, error => {
      // On failure, run it back. 
      // I'm sure there's a better solution than this.
      //this.getTopTracks();
    });
  }

  public getFollowedArtists = () => {
    this.spotifyService.getCurrentUserFollowedArtists().subscribe((data: any) => {
      if (data) {
        this.artists = data.artists.items.slice(0, 6);
      }
    }, error => {
      // On failure, run it back. 
      // I'm sure there's a better solution than this.
      //this.getTopArtists();
    });
  }

  public goToArtist(item: Artist) {
    window.location.assign("/../details/artist/" + item.id);
  }

  public goToTrack(item: Track) {
    window.location.assign("/../details/track/" + item.id);
  }

  public goToAlbum(item: Track) {
    window.location.assign("/../details/album/" + item.album.id);
  }

  // Truncates track info (artist - album) based on screen size (not perfect)
  public calculateArtists = (track: Track) => {
    return track.artists.map(a => a.name).join(", ");
  }


  // Truncates track name based on screen size (not perfect)
  public calculateTrackName = (name: string) => {
    let ret = name;
    ret = name.substring(0, (window.innerWidth / 32));
    if (name.length > ret.length) ret += "...";
    return ret;
  }
}


