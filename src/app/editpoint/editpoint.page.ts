import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  selector: 'app-editpoint',
  templateUrl: './editpoint.page.html',
  styleUrls: ['./editpoint.page.scss'],
  standalone: false,
})
export class EditpointPage implements OnInit, OnDestroy {
  map!: L.Map;
  marker?: L.Marker;
  key = '';
  name = '';
  coordinates = '';

  private route = inject(ActivatedRoute);
  private navCtrl = inject(NavController);
  private alertCtrl = inject(AlertController);
  private dataService = inject(DataService);

  constructor() { }

  ngOnInit() {
    this.key = this.route.snapshot.paramMap.get('key') || '';
  }

  ionViewDidEnter() {
    this.loadPointData();
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  async loadPointData() {
    if (!this.key) {
      return;
    }

    try {
      const point: any = await this.dataService.getPoint(this.key);

      if (point && point.coordinates) {
        this.name = point.name || '';
        this.coordinates = point.coordinates;

        const parts = this.coordinates.split(',');
        if (parts.length === 2) {
          const lat = parseFloat(parts[0].trim());
          const lng = parseFloat(parts[1].trim());

          if (!isNaN(lat) && !isNaN(lng)) {
            this.initOrUpdateMap(lat, lng);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching point data:', error);
    }
  }

  initOrUpdateMap(lat: number, lng: number) {
    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('mapedit').setView([lat, lng], 13);

    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    const esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri'
    });

    osm.addTo(this.map);

    const baseMaps: Record<string, L.TileLayer> = {
      'OpenStreetMap': osm,
      'Esri World Imagery': esri
    };
    L.control.layers(baseMaps).addTo(this.map);

    const tooltip = 'Drag the marker or move the map<br>to change the coordinates<br>of the location';
    this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.map);
    this.marker.bindPopup(tooltip).openPopup();

    this.marker.on('dragend', () => {
      if (this.marker) {
        const latlng = this.marker.getLatLng();
        const newLat = latlng.lat.toFixed(9);
        const newLng = latlng.lng.toFixed(9);
        this.coordinates = `${newLat},${newLng}`;
      }
    });

    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 200);
  }

  // Save the edited point
  async save() {
    if (this.name && this.coordinates) {
      try {
        await this.dataService.updatePoint(this.key, {
          name: this.name,
          coordinates: this.coordinates
        });
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