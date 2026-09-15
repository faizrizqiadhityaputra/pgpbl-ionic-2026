import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
  }

  async login() {
    // Sementara: langsung masuk ke tab 1 tanpa perlu validasi email & password
    this.router.navigateByUrl('/tabs/tab1');

    /*
    if (!this.email || !this.password) {
      const toast = await this.toastCtrl.create({
        message: 'Silakan isi email dan password terlebih dahulu!',
        duration: 2000,
        color: 'warning',
        position: 'bottom'
      });
      await toast.present();
      return;
    }

    const toast = await this.toastCtrl.create({
      message: 'Login berhasil! Mengalihkan...',
      duration: 1500,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();

    this.router.navigateByUrl('/tabs', { replaceUrl: true });
    */
  }

  goToRegister() {
    this.router.navigateByUrl('/register');
  }

}

