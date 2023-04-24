import { Component, ElementRef, ViewChild } from '@angular/core';
import { SpotifyService } from '../spotify.service';
import { UserRolesService } from '../userroles.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @ViewChild('searchInput') searchInputElement: ElementRef
  public user: any = undefined;
  public userroles: any = undefined;

  constructor(private spotifyService: SpotifyService, private urService: UserRolesService, searchInputElement: ElementRef) {
    this.searchInputElement = searchInputElement;
    this.user = this.spotifyService.currentUser;

    setInterval(
      () => {
        this.user = this.spotifyService.currentUser;

        if (this.user) {
          this.urService.getUserRolesByID(this.user.id).subscribe(data => {
            this.userroles = data;
          });
        } else {
          this.userroles = undefined;
        }
      }, 1000
    )
  }

  public onSearchButtonClick = (): void => {
    console.log(this.searchInputElement.nativeElement.value);
    window.location.assign("../search?criteria=" + this.searchInputElement.nativeElement.value);
  }

  public onLoginClick = (): void => {
    window.location.assign("../login");
  }

  public onMyProfileClick = (): void => {
    window.location.assign("../profile")
  }

  public onAdminClick = (): void => {
    window.location.assign("../admin")
  }

  public onLogOutClick = (): void => {
    this.spotifyService.logOut();
    window.location.assign("../home");
    setTimeout(() => {
      this.user = this.spotifyService.currentUser;
    }, 250);
  }
}
