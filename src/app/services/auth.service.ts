import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UsuarioModel } from '../models/usuario.model';

import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url = 'https://identitytoolkit.googleapis.com/v1/accounts:';
  private apikey = 'AIzaSyBPWn43uXUk45eIHItSvQ6IEytgh-kUa3E';
  userToken: string;

  //CREAR NUEVOS USUARIOS
  //https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=[API_KEY]

  //AUTENTICAR USUARIOS
  //https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=[API_KEY]

  constructor(private http: HttpClient) {
    this.leerToken();
  }

  logOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('expira'); //creo by me
  }

  logIn(usuario: UsuarioModel) {
    const authData = {
      ...usuario, // cualquiera de los metodos sirven
      returnSecureToken: true
    };

    return this.http
      .post(`${this.url}signInWithPassword?key=${this.apikey}`, authData)
      .pipe(
        map(resp => {
          console.log('Entro en el mapa de RXJS');
          this.gurdarToken(resp['idToken']);
          return resp;
        })
      );
  }

  nuevoUsuario(usuario: UsuarioModel) {
    const authData = {
      email: usuario.email,
      password: usuario.password,
      returnSecureToken: true
    };

    return this.http
      .post(`${this.url}signUp?key=${this.apikey}`, authData)
      .pipe(
        map(resp => {
          console.log('Entro en el mapa de RXJS');
          this.gurdarToken(resp['idToken']);
          return resp;
        })
      );
  }

  private gurdarToken(idToken: string) {
    this.userToken = idToken;
    localStorage.setItem('token', idToken);

    let today = new Date();
    today.setSeconds(3600);

    localStorage.setItem('expira', today.getTime().toString());
  }

  leerToken() {
    if (localStorage.getItem('token')) {
      this.userToken = localStorage.getItem('token');
    } else {
      this.userToken = '';
    }

    return this.userToken;
  }

  estaAutenticado(): boolean {
    if (this.userToken.length < 2) {
      return false;
    }

    const expira = Number(localStorage.getItem('expira'));
    const expiradate = new Date();
    expiradate.setTime(expira);

    if (expiradate > new Date()) {
      return true;
    } else {
      localStorage.removeItem('expira'); //creo by me
      return false;
    }
  }
}
