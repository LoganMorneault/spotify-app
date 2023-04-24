import { AfterViewInit, Component } from '@angular/core';
import { Artist, Playlist, SpotifyService, Track, getRandomSubarray } from '../spotify.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements AfterViewInit {
  public recommendations: Track[] = [];
  public playlists: any[] = [];
  public currentUser: any = undefined;

  public constructor(private spotifyService: SpotifyService) {
    this.currentUser = this.spotifyService.currentUser;
  }

  public ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.spotifyService.currentUser) {
        this.getUserPlaylists();
        this.getUserRecommendations();
      }
      else {
        this.getDefaultRecommendations();
        this.getFeaturedPlaylists();
      }
    }, 200);
  }

  // Gets default recommendations from Spotify.
  public getDefaultRecommendations = () => {
    this.spotifyService.getDefaultRecommendations().subscribe((data: any) => {
      if (data) {
        this.recommendations = data["tracks"];
      }
    }, error => {
      // On failure, run it back. 
      // I'm sure there's a better solution than this.
      this.getDefaultRecommendations();
    });
  }

  // Gets user recommendations from Spotify.
  public getUserRecommendations = () => {
    // Pull top tracks over long_time, then randomly select 5 and pull recommendations.
    this.spotifyService.getCurrentUserTopTracks().subscribe(data => {
      if (data) {
        let seeds = getRandomSubarray(data.items, 5);
        const seedStr = seeds.map(s => s.id).join("%2C");

        this.spotifyService.getRecommendationsWithSeed(seedStr).subscribe(
          (data: any) => {
            console.log("Personalized recommendations:", data);
            this.recommendations = data.tracks;
          }
        );
      }
    });
  }

  // Gets featured playlists from Spotify
  public getFeaturedPlaylists = () => {
    this.spotifyService.getFeaturedPlaylists().subscribe((data: any) => {
      if (data) {
        this.playlists = data["playlists"]["items"];
      }
    }, error => {
      // On failure, run it back. 
      // I'm sure there's a better solution than this.
      this.getFeaturedPlaylists();
    });
  }

  public getUserPlaylists = () => {
    this.spotifyService.getCurrentUserPlaylists().subscribe((data: any) => {
      if (data) {
        this.playlists = data["items"];
      }
    });
  }


  // Truncates track info (artist - album) based on screen size (not perfect)
  public calculateArtists = (track: Track) => {
    return track.artists.map(a => a.name).join(", ");
    // return `${artistStr} - ${track.album.name}`;
  }


  // Truncates track name based on screen size (not perfect)
  public calculateTrackName = (name: string) => {
    let ret = name;
    ret = name.substring(0, (window.innerWidth / 32));
    if (name.length > ret.length) ret += "...";
    return ret;
  }

  public goToArtist = (item: Track) => {
    window.location.assign("../details/artist/" + item.artists[0].id);
  }

  public goToAlbum = (item: Track) => {
    window.location.assign("../details/album/" + item.album.id);
  }

  public goToTrack = (item: Track) => {
    window.location.assign("../details/track/" + item.id);
  }

  public goToPlaylist = (item: Playlist) => {
    window.location.assign("../details/playlist/" + item.id);
  }

  public decodeHtml(html: string) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }
}
