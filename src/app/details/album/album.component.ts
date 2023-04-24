import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Album, SpotifyService, Track } from 'src/app/spotify.service';

@Component({
  selector: 'app-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.css']
})
export class AlbumComponent implements OnInit {
  public id: string = "";
  public isLiked: boolean = false;
  public album: Album = undefined!;
  public tracks: Track[] = [];
  public currentUser: any = undefined!;

  public constructor(private activatedRoute: ActivatedRoute, private spotifyService: SpotifyService) { }

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.paramMap.get('id')!;
    this.currentUser = this.spotifyService.currentUser;

    if (!this.id) return;

    setTimeout(() => {
      this.getAlbumData();
      this.doesUserLikeAlbum();
    }, 200);
  }
   
  public doesUserLikeAlbum() {
    this.spotifyService.doesUserLikeAlbum(this.id).subscribe(data => {
      this.isLiked = data[0];
    });
  }

  public getAlbumData = () => {
    this.spotifyService.getAlbum(this.id).subscribe(
      (data: any) => {
        if (data) {
          this.album = data;
          this.tracks = data.tracks.items;
        }
      }, error => {
        this.getAlbumData();
      });
  }

  public onSaveButtonClick(item: Album) {
    if (this.isLiked) {
      this.spotifyService.unsaveAlbum(this.album).subscribe(data => {
        this.doesUserLikeAlbum();
      });
    }
    else {
      this.spotifyService.saveAlbum(this.album).subscribe(data => {
        this.doesUserLikeAlbum();
      });
    }
  }

  // Truncates track info (artist - album) based on screen size (not perfect)
  public calculateTrackInfo = (track: Track) => {
    return track.artists.map(a => a.name).join(", ");
  }

  // Truncates track info (artist - album) based on screen size (not perfect)
  public calculateArtists = () => {
    return this.album.artists.map(a => a.name).join(", ");
  }


  // Truncates track name based on screen size (not perfect)
  public calculateTrackName = (name: string) => {
    let ret = name;
    ret = name.substring(0, (window.innerWidth / 32));
    if (name.length > ret.length) ret += "...";
    return ret;
  }

  public calculateReleaseDate = () => {
    let dateParts = this.album.release_date.split('-');
    if (dateParts.length == 1) return this.album.release_date;

    let date: Date = new Date(Number(dateParts[0]), Number(dateParts[1]), Number(dateParts[2]));
    return date.toLocaleDateString('en-US');
  }

  public goToArtist() {
    window.location.assign("/../details/artist/" + this.album.artists[0].id);
  }

  public goToTrack(item: Track) {
    window.location.assign("/../details/track/" + item.id);
  }


  public calculatePlayerSrc = () => {
    let ret = `https://open.spotify.com/embed/album/${this.id}?utm_source=generator`;
    return ret;
  }
}
