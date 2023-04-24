import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Album, Artist, SpotifyService, Track } from 'src/app/spotify.service';

@Component({
  selector: 'app-artist',
  templateUrl: './artist.component.html',
  styleUrls: ['./artist.component.css']
})
export class ArtistComponent implements OnInit {
  public id: string = "";
  public isFollowed: boolean = false;
  public currentUser: any = undefined;
  public artist: Artist = undefined!;
  public tracks: Track[] = [];
  public albums: Album[] = [];

  public constructor(private activatedRoute: ActivatedRoute, private spotifyService: SpotifyService) { }

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.paramMap.get('id')!;
    console.log(this.id);

    if (!this.id) return;

    setTimeout(() => {
      this.currentUser = this.spotifyService.currentUser;
      this.getArtistData();
      this.getTopTracks();
      this.getArtistAlbums();
      this.doesUserFollowArtist();
    }, 200);
  }

  public doesUserFollowArtist() {
    this.spotifyService.doesUserFollowArtist(this.id).subscribe(data => {
      this.isFollowed = data[0];
    });
  }

  public getArtistData = () => {
    this.spotifyService.getArtist(this.id).subscribe(
      (data: Artist) => {
        console.log(data);
        if (data) this.artist = data;

      }, error => {
        this.getArtistData();
      });
  }


  public getTopTracks = () => {
    this.spotifyService.getTopTracks(this.id).subscribe(
      (data: any) => {
        console.log(data);
        if (data) this.tracks = data["tracks"].slice(0, 5);

      }, error => {
        this.getTopTracks();
      });
  }


  public getArtistAlbums = () => {
    this.spotifyService.getArtistAlbums(this.id).subscribe(
      (data: any) => {
        console.log(data);
        let albums = data["items"];
        let seenTitles = new Set();

        for (let album of albums) {
          if (!seenTitles.has(album.name)) this.albums.push(album);
          seenTitles.add(album.name);
        }
      }, error => {
        this.getArtistAlbums();
      });
  }


  public onSaveButtonClick(item: Artist) {
    if (this.isFollowed) {
      this.spotifyService.unfollowArtist(this.artist).subscribe(data => {
        this.doesUserFollowArtist();
      });
    }
    else {
      this.spotifyService.followArtist(this.artist).subscribe(data => {
        this.doesUserFollowArtist();
      });
    }
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

  public goToAlbum = (album: Album) => {
    window.location.assign("../details/album/" + album.id);
  }

  public goToTrack = (item: Track) => {
    window.location.assign("../details/track/" + item.id);
  }
}
