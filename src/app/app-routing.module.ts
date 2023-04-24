import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { SearchComponent } from './search/search.component';
import { AlbumComponent } from './details/album/album.component';
import { ArtistComponent } from './details/artist/artist.component';
import { PlaylistComponent } from './details/playlist/playlist.component';
import { TrackComponent } from './details/track/track.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { AnonProfileComponent } from './anon-profile/anon-profile.component';
import { AdminComponent } from './admin/admin.component';
import { PlaylistEditComponent } from './details/playlist/edit/edit.component';

const routes: Routes = [
  { path: 'home', component: HomepageComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'login', component: LoginComponent },
  { path: 'search', component: SearchComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'profile/:id', component: AnonProfileComponent },
  { path: 'details/album/:id', component: AlbumComponent },
  { path: 'details/artist/:id', component: ArtistComponent },
  { path: 'details/playlist/:id', component: PlaylistComponent },
  { path: 'details/playlist/:id/edit', component: PlaylistEditComponent },
  { path: 'details/track/:id', component: TrackComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
