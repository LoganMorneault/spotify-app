import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Playlist, SpotifyService } from 'src/app/spotify.service';
import { UserRolesService } from 'src/app/userroles.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class PlaylistEditComponent implements OnInit {
  @ViewChild('nameInput') nameInputElement: ElementRef;
  @ViewChild('descInput') descInputElement: ElementRef;
  @ViewChild('isPublicInput') isPublicInputElement: ElementRef;

  public id: string = "";
  public currentUser: any = undefined;
  public userroles: any = undefined;
  public playlist: Playlist = undefined!;

  public constructor(private activatedRoute: ActivatedRoute, private urService: UserRolesService, private spotifyService: SpotifyService, nameInputElement: ElementRef, descInputElement: ElementRef, isPublicInputElement: ElementRef) {
    this.nameInputElement = nameInputElement;
    this.descInputElement = descInputElement;
    this.isPublicInputElement = isPublicInputElement;
  }

  public ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.paramMap.get('id')!;
    setTimeout(() => {
      this.currentUser = this.spotifyService.currentUser;
      if (this.currentUser) {
        this.urService.getUserRolesByID(this.currentUser.id).subscribe(data => {
          this.userroles = data;
          if (!this.userroles.isAdmin)
            window.location.href = './details/playlist/' + this.id;

        });
      } else {
        window.location.href = './details/playlist/' + this.id;
        this.userroles = undefined;
      }
      this.getPlaylistData();
    }, 200);
  }

  public getPlaylistData = () => this.spotifyService.getPlaylist(this.id).subscribe((data: any) => {
    if (data) {
      console.log(data);
      this.playlist = data;
      this.playlist.isPublic = data['public'];
      if (this.currentUser.id != this.playlist.owner.id)
        window.location.href = './details/playlist/' + this.id;
    }
  }, error => {
    this.getPlaylistData();
  });

  public decodeHtml(html: string) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }

  public updatePlaylist() {
    let name = this.nameInputElement.nativeElement.value.trim() || this.playlist.name;
    let description = this.descInputElement.nativeElement.value.trim() || this.playlist.description;
    let isPublic = (this.isPublicInputElement.nativeElement.value == 'on') || this.playlist.isPublic;

    let obj = {
      "name": name,
      "description": description,
      "public": isPublic
    }

    this.spotifyService.updatePlaylistDetails(this.playlist.id, obj).subscribe(data => this.getPlaylistData());
  }
}
