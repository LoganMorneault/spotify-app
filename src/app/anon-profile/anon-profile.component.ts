import { Component } from '@angular/core';
import { Track, Artist, SpotifyService, Playlist } from '../spotify.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-anon-profile',
  templateUrl: './anon-profile.component.html',
  styleUrls: ['./anon-profile.component.css']
})
export class AnonProfileComponent {
  public id: string = "";
  public isFollowed: boolean = false;
  public currentUser: any = undefined;
  public user: any = undefined;
  public tracks: Track[] = [];
  public playlists: Playlist[] = [];

  public constructor(private activatedRoute: ActivatedRoute, private spotifyService: SpotifyService) { }

  public ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.paramMap.get('id')!;

    setTimeout(() => {
      this.currentUser = this.spotifyService.currentUser;
      this.getAnonymousUser();
      this.getAnonymousUserPlaylists();
    }, 200);
  }

  public doesUserFollowUser() {
    this.spotifyService.doesUserFollowUser(this.id).subscribe(data => {
      this.isFollowed = data[0];
      console.log(this.isFollowed);
    });
  }

  public getAnonymousUser = () => {
    this.spotifyService.getUserProfile(this.id).subscribe((data: any) => {
      if (data) {
        console.log("loaded profile", data);
        this.user = data;
      }
    }, error => {
      // On failure, run it back. 
      // I'm sure there's a better solution than this.
      this.getAnonymousUser();
    });
  }

  public getAnonymousUserPlaylists = () => {
    this.spotifyService.getUserPlaylists(this.id).subscribe((data: any) => {
      if (data) {
        console.log("loaded playlists", data);
        this.playlists = data.items;
      }
    }, error => {
      // On failure, run it back. 
      // I'm sure there's a better solution than this.
      this.getAnonymousUser();
    });
  }

  public goToPlaylist = (item: Playlist) => {
    window.location.assign("../details/playlist/" + item.id);
  }

  // Truncates track name based on screen size (not perfect)
  public calculateTrackName = (name: string) => {
    let ret = name;
    ret = name.substring(0, (window.innerWidth / 32));
    if (name.length > ret.length) ret += "...";
    return ret;
  }

  public onSaveButtonClick(item: Artist) {
    if (this.isFollowed) {
      this.spotifyService.unfollowUser(this.user).subscribe(data => {
        this.doesUserFollowUser();
      });
    }
    else {
      this.spotifyService.followUser(this.user).subscribe(data => {
        this.doesUserFollowUser();
      });
    }
  }

  public decodeHtml(html: string) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }
}
