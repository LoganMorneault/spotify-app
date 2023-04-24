import { Component, ElementRef, ViewChild } from '@angular/core';
import { UserRolesService } from '../userroles.service';
import { SpotifyService } from '../spotify.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  @ViewChild('uidInput') uidInputElement: ElementRef;

  public userroles: any[] = [];
  public currentUser: any = undefined;

  public constructor(private urService: UserRolesService, private spotifyService: SpotifyService, uidInputElement: ElementRef) {
    this.uidInputElement = uidInputElement;
    this.getAllUserRoles();

    this.currentUser = this.spotifyService.currentUser;

    if (!this.currentUser) window.location.href="../home";
  }

  public getAllUserRoles() {
    this.urService.getAllUserRoles().subscribe((data:any) => {
      this.userroles = data;
      
      let matchingURs = this.userroles.filter(ur => ur.uid == this.currentUser.id());
      if (matchingURs.length == 0 || !matchingURs[0].isAdmin) window.location.href="../home";
    })
  }

  public toggleAdmin(item: any) {
    const updateObj = {"isAdmin": !item.isAdmin};
    this.urService.updateUserRoles(item.uid, updateObj).subscribe((data: any) => {
      console.log(data);
      this.getAllUserRoles();
    });

  }

  public togglePC(item: any) {
    const updateObj = {"isPlaylistCreator": !item.isPlaylistCreator};
    this.urService.updateUserRoles(item.uid, updateObj).subscribe((data: any) => {
      console.log(data);
      this.getAllUserRoles();
    });
  }

  public onAddUserClick() {
    const uid = this.uidInputElement.nativeElement.value;
    const newUr = {"uid": uid, "isAdmin": false, "isPlaylistCreator": false};
    this.urService.createUserRoles(newUr).subscribe((data: any) => {
      console.log(data);
      this.getAllUserRoles();
    })
    // const newObj = {"uid": this.input}
  }

}

