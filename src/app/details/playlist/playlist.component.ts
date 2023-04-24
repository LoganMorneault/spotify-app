import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Playlist, SpotifyService, Track } from 'src/app/spotify.service';
import { UserRolesService } from 'src/app/userroles.service';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.css']
})
export class PlaylistComponent implements OnInit {
  public id: string = "";
  public isFollowed: boolean = false;
  public currentUser: any = undefined;
  public userroles: any = undefined;
  public playlist: Playlist = undefined!;
  public tracks: Track[] = [];

  public constructor(private activatedRoute: ActivatedRoute, private urService: UserRolesService, private spotifyService: SpotifyService) { }

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.paramMap.get('id')!;
    setTimeout(() => {
      this.currentUser = this.spotifyService.currentUser;

      if (this.currentUser) {
        this.urService.getUserRolesByID(this.currentUser.id).subscribe(data => {
          this.userroles = data;
        });
      } else {
        this.userroles = undefined;
      }

      this.getPlaylistData();
    }, 200);
  }

  public doesUserFollowPlaylist() {
    this.spotifyService.doesUserFollowPlaylist(this.id).subscribe(data => {
      this.isFollowed = data[0];
    });
  }

  public getPlaylistData = () => this.spotifyService.getPlaylist(this.id).subscribe(data => {
    console.log(data);
    if (data) {
      this.playlist = data;
      this.tracks = data.tracks.items.map((t: { track: Track; }) => t.track);
    }
  }, error => {
    this.getPlaylistData();
  });

  public goToArtist(item: Track) {
    window.location.assign("/../details/artist/" + item.artists[0].id);
  }

  public goToTrack(item: Track) {
    window.location.assign("/../details/track/" + item.id);
  }

  public goToAlbum(item: Track) {
    window.location.assign("/../details/album/" + item.album.id);
  }

  public goToUser() {
    window.location.assign("../profile/" + this.playlist.owner.id);
  }

  public goToEditPlaylist() {
    window.location.assign(`../details/playlist/${this.id}/edit`)
  }

  // Truncates track info (artist - album) based on screen size (not perfect)
  public calculateArtistInfo = (track: Track) => {
    return track.artists.map(a => a.name).join(", ");
  }

  public decodeHtml(html: string) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }


  public onSaveButtonClick() {
    if (this.isFollowed) {
      this.spotifyService.unfollowPlaylist(this.playlist).subscribe(data => {
        this.doesUserFollowPlaylist();
      });
    }
    else {
      this.spotifyService.followPlaylist(this.playlist).subscribe(data => {
        this.doesUserFollowPlaylist();
      });
    }
  }
}
