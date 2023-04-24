import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SpotifyService, Track } from 'src/app/spotify.service';

@Component({
  selector: 'app-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.css']
})
export class TrackComponent implements OnInit {
  public id: string = "";
  public isLiked: boolean = false;
  public track: Track = undefined!;
  public currentUser: any = undefined;

  public constructor(private activatedRoute: ActivatedRoute, private spotifyService: SpotifyService) { }

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.paramMap.get('id')!;
    this.currentUser = this.spotifyService.currentUser;

    setTimeout(() => {
      this.getTrackData();
      this.doesUserLikeTrack();
    }, 200);
  }

  public doesUserLikeTrack() {
    this.spotifyService.doesUserLikeTrack(this.id).subscribe(data => {
      this.isLiked = data[0];
    });
  }

  public getTrackData() {
    this.spotifyService.getTrack(this.id).subscribe(data => {
      if (data) { this.track = data; }
    }, error => {
      this.getTrackData();
    });
  }

  public onSaveButtonClick(item: Track) {
    if (this.isLiked) {
      this.spotifyService.unsaveTrack(item).subscribe(data => {
        this.doesUserLikeTrack();
      });
    }
    else {
      this.spotifyService.saveTrack(item).subscribe(data => {
        this.doesUserLikeTrack();
      });
    }
  }

  // Truncates track info (artist - album) based on screen size (not perfect)
  public calculateArtists = () => {
    return this.track.artists.map(a => a.name).join(", ");
  }

  public goToArtist() {
    window.location.assign("/../details/artist/" + this.track.artists[0].id);
  }

  public goToAlbum() {
    window.location.assign("/../details/album/" + this.track.album.id);
  }

  public getIframeSrc = () => {
    return `https://open.spotify.com/embed/track/${this.track.id}?utm_source=generator`;
  }
}
