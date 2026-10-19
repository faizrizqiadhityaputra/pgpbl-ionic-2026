import { Injectable } from '@angular/core';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';

import { auth } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Login
  login(email: string, password: string) {
    return signInWithEmailAndPassword(
      auth,
      email,
      password
    );
  }

  // Register
  register(email: string, password: string) {
    return createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
  }

  // Logout
  logout() {
    return signOut(auth);
  }

}
