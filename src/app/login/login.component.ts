import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../spotify.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private scopes: string[] = ["user-read-private", "user-read-email", "user-read-recently-played", "user-top-read", "user-follow-read", "user-library-modify", "user-library-read", "user-follow-modify", "playlist-modify-public", "playlist-modify-private", "playlist-read-private"];

  public constructor(private spotifyService: SpotifyService) { }

  // Code taken largely from Spotify's tutorial on logging in with PKCE.
  public ngOnInit(): void {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) this.redirectToAuthCodeFlow();
    else {
      this.spotifyService.generateUserAccessToken(code, localStorage.getItem('verifier')!);
    }
  }

  public async redirectToAuthCodeFlow() {
    const verifier = this.generateCodeVerifier(128);
    const challenge = await this.generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", this.spotifyService.client_id);
    params.append("response_type", "code");
    params.append("redirect_uri", "http://localhost:4200/login");
    params.append("scope", this.scopes.join(" "));
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  generateCodeVerifier(length: number) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  async generateCodeChallenge(codeVerifier: string) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

}
