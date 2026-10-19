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
              marker.bindPopup(point.name);
              this.markersLayer.addLayer(marker);
            }
          }
        }
      });
    } catch (error) {
      console.error('Error loading points:', error);
    }
  }

  clearAndLoadPoints() {
    this.markersLayer.clearLayers();
    this.loadPoints();
  }
}
