import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage implements OnInit {
  fullName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(
    private router: Router,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
  }

  async register() {
    if (!this.fullName || !this.email || !this.password || !this.confirmPassword) {
      const toast = await this.toastCtrl.create({
        message: 'Silakan lengkapi semua data formulir!',
        duration: 2000,
        color: 'warning',
        position: 'bottom'
      });
      await toast.present();
      return;
    }

    if (this.password !== this.confirmPassword) {
      const toast = await this.toastCtrl.create({
        message: 'Password dan Konfirmasi Password tidak cocok!',
        duration: 2000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
      return;
    }

    const toast = await this.toastCtrl.create({
      message: 'Pendaftaran berhasil! Silakan login.',
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();

    this.router.navigateByUrl('/login');
  }

  goToLogin() {
    this.router.navigateByUrl('/login');
  }

}
