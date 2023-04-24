import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { SafePipeModule } from 'safe-pipe';

import { AppRoutingModule } from './app-routing.module';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { HomepageComponent } from './homepage/homepage.component';
import { SearchComponent } from './search/search.component';
import { ArtistComponent } from './details/artist/artist.component';
import { AlbumComponent } from './details/album/album.component';
import { TrackComponent } from './details/track/track.component';
import { PlaylistComponent } from './details/playlist/playlist.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { AnonProfileComponent } from './anon-profile/anon-profile.component';
import { AdminComponent } from './admin/admin.component';
import { PlaylistEditComponent } from './details/playlist/edit/edit.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomepageComponent,
    SearchComponent,
    ArtistComponent,
    AlbumComponent,
    TrackComponent,
    PlaylistComponent,
    LoginComponent,
    ProfileComponent,
    AnonProfileComponent,
    AdminComponent,
    PlaylistEditComponent
  ],
  imports: [
    BrowserModule,
    FontAwesomeModule,
    NgbModule,
    AppRoutingModule,
    HttpClientModule,
    SafePipeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { 
  constructor(library: FaIconLibrary) {
    library.addIcons(faUser);
  }
}
