import { Component, OnInit, inject } from '@angular/core';
import * as L from 'leaflet';
import { DataService } from '../data.service';

const iconRetinaUrl = 'assets/icon/marker-icon-2x.png';
const iconUrl = 'assets/icon/marker-icon.png';
const shadowUrl = 'assets/icon/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
  standalone: false,
})
export class MapsPage implements OnInit {
  map!: L.Map;
  private markersLayer = L.layerGroup();
  private dataService = inject(DataService);

  constructor() { }

  ngOnInit() { }

  ionViewDidEnter() {
    if (!this.map) {
      this.initMap();
    } else {
      this.map.invalidateSize();
      this.clearAndLoadPoints();
    }
  }

  initMap() {
    this.map = L.map('map').setView([-7.7956, 110.3695], 13);

    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
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

    this.markersLayer.addTo(this.map);

    // 1. Tambahkan event listener untuk mendeteksi saat popup dibuka
    this.map.on('popupopen', (e) => {
      const popup = e.popup;
      const deleteLink = popup.getElement()?.querySelector('.delete-link');

      if (deleteLink) {
        deleteLink.addEventListener('click', (event) => {
          event.preventDefault();
          const key = (event.target as HTMLElement).dataset['key'];
          if (key) {
            this.deletePoint(key, popup.getLatLng());
          }
        });
      }
    });

    this.loadPoints();
  }

  async loadPoints() {
    try {
      const data = await this.dataService.getPoints();
      if (!data) {
        return;
      }

      this.markersLayer.clearLayers();

      Object.keys(data).forEach((key) => {
        const point = data[key];
        if (point && point.coordinates && point.name) {
          const parts = point.coordinates.split(',');
          if (parts.length === 2) {
            const lat = parseFloat(parts[0]);
            const lng = parseFloat(parts[1]);

            if (!isNaN(lat) && !isNaN(lng)) {
              const marker = L.marker([lat, lng]);

              marker.bindPopup(`
                <b>${point.name}</b>
                <br>
                <a href="#" class="delete-link" data-key="${key}">
                  Delete
                </a> |
                <a href="/editpoint/${key}">Edit</a>
              `);
              marker.addTo(this.markersLayer);
            }
          }
        } ``
      });
    } catch (error) {
      console.error('Error loading points:', error);
    }
  }

  // 2. Perbaiki fungsi deletePoint (Hapus sintaks acak dan sederhanakan)
  async deletePoint(key: string, latLng: L.LatLng | undefined) {
    try {
      // Hapus data dari service
      await this.dataService.deletePoint(key);

      // Tutup popup jika ada yang terbuka
      this.map.closePopup();

      if (latLng) {
        // Cari layer (marker) pada markersLayer dan hapus marker tersebut dari peta
        this.markersLayer.eachLayer((layer: any) => {
          if (layer.getLatLng && layer.getLatLng().equals(latLng)) {
            this.markersLayer.removeLayer(layer);
          }
        });
      }
    } catch (error) {
      console.error('Error deleting point:', error);
    }
  }

  clearAndLoadPoints() {
    this.markersLayer.clearLayers();
    this.loadPoints();
  }
}