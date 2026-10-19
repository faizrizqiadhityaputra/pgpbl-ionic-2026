import { Component, OnInit, inject } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { DataService } from '../data.service';
import * as L from 'leaflet';
import { icon, Marker } from 'leaflet';

const iconRetinaUrl = 'assets/icon/marker-icon-2x.png';
const iconUrl = 'assets/icon/marker-icon.png';
const shadowUrl = 'assets/icon/marker-shadow.png';
const iconDefault = icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-createpoint',
  templateUrl: './createpoint.page.html',
  styleUrls: ['./createpoint.page.scss'],
  standalone: false,
})
export class CreatepointPage implements OnInit {
  name = '';
  coordinates = '';
  map!: L.Map;

  private navCtrl = inject(NavController);
  private alertCtrl = inject(AlertController);
  private dataService = inject(DataService);

  constructor() {}

  ngOnInit() {
    setTimeout(() => {
      this.initMap();
    }, 300);
  }

  initMap() {
    this.map = L.map('mapcreate').setView([-7.7956, 110.3695], 13);

    // Basemap layers
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    });

    const esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri'
    });

    osm.addTo(this.map);

    // Layer control
    const baseMaps: Record<string, L.TileLayer> = {
      'OpenStreetMap': osm,
      'Esri World Imagery': esri
    };
    L.control.layers(baseMaps).addTo(this.map);

    // Draggable marker
    const marker = L.marker([-7.7956, 110.3695], { draggable: true }).addTo(this.map);
    marker.bindPopup('Geser marker untuk menentukan lokasi').openPopup();

    // Set initial coordinates
    this.coordinates = '-7.795600000,110.369500000';

    // Update coordinates on drag
    marker.on('dragend', () => {
      const latlng = marker.getLatLng();
      this.coordinates = latlng.lat.toFixed(9) + ',' + latlng.lng.toFixed(9);
    });
  }

  async save() {
    if (this.name && this.coordinates) {
      try {
        const pointData = {
          name: this.name,
          coordinates: this.coordinates,
        };
        await this.dataService.savePoint(pointData);
        this.navCtrl.back();
      } catch (error: any) {
        const alert = await this.alertCtrl.create({
          header: 'Save Failed',
          message: error.message,
          buttons: ['OK'],
        });
        await alert.present();
      }
    }
  }
}
