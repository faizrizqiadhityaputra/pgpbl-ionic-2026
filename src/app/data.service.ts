import { Injectable } from '@angular/core';
import { ref, push, onValue, remove, get, update } from 'firebase/database';
import { database } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  // Save a new point
  savePoint(point: { name: string; coordinates: string }) {
    const pointsRef = ref(database, 'points');
    return push(pointsRef, point);
  }

  // Update an existing point
  updatePoint(key: string, point: { name: string; coordinates: string }) {
    const pointRef = ref(database, `points/${key}`);
    return update(pointRef, point);
  }

  // Get all points using onValue (returns Promise)
  getPoints(): Promise<any> {
    return new Promise((resolve, reject) => {
      const pointsRef = ref(database, 'points');
      onValue(pointsRef, (snapshot) => {
        resolve(snapshot.val());
      }, (error) => {
        reject(error);
      }, { onlyOnce: true });
    });
  }

  getPoint(key: string) {
    const pointRef = ref(database, `points/${key}`);
    return new Promise((resolve, reject) => {
      get(pointRef).then((snapshot) => {
        const data = snapshot.val();
        resolve(data);
      }).catch((error) => {
        reject(error);
      });
    });
  }



  // Delete a point
  deletePoint(key: string) {
    const pointRef = ref(database, `points/${key}`);
    return remove(pointRef);
  }
}
