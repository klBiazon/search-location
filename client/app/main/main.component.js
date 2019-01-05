/*global google */

import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';

export class MainController {

  /*@ngInject*/
  constructor($http, $scope, socket, googleKey) {
    this.$scope = $scope;
    this.$http = $http;
    this.socket = socket;
    this.googleKey = googleKey;

    $scope.$on('$destroy', () => {
      socket.unsyncUpdates('thing');
    });
  }

  $onInit() {
    this.error = {};

    let markers = {};
    let marker;
    let map;      
    let bounds  = new google.maps.LatLngBounds();

    /** Declare a `googleMapsClient` variable to be used in
        Google Map API method calling
    */
    const googleMapsClient = require('@google/maps').createClient({
      key: this.googleKey.apiKey,
      Promise
    });

    /** This function renders the map, locate its initial position */
    this.initializeMap = (pos, dest) => {
      var position = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };

      if (this.originCurrent == undefined && this.endCurrent == undefined) {
        map = new google.maps.Map(document.getElementById('googleMap'), {
          center: position,
          zoom: 12
        });
      }

      this[`${dest}Current`] = true;
      this.addMarker(position, dest);
    }

    /** This function add the marker to the map */
    this.addMarker = (pos, dest) => {
      marker = new google.maps.Marker({
        position: pos,
        map,
        animation: google.maps.Animation.DROP,
        title: 'Here we are!'
      });
      marker.addListener('click', this.toggleBounce);
      this.deleteMarker(dest);
      markers[dest] = marker;

      Object.keys(markers).forEach(marker => {
        let loc = new google.maps.LatLng(markers[marker].position.lat(), markers[marker].position.lng());
        bounds.extend(loc);
      });

      if(markers.hasOwnProperty('origin') && markers.hasOwnProperty('end')) {
        map.fitBounds(bounds);
        map.panToBounds(bounds);
        bounds = new google.maps.LatLngBounds();
      }
    }

    /** This function deletes a specific marker which is present on the map */
    this.deleteMarker = markerId => {
      if(markers.hasOwnProperty(markerId)) {
        let delMarker = markers[markerId];
        delMarker.setMap(null);
      }
    }

    /** Just an animation for the marker when clicked (TOGGLE MARKER BOUNCE ANIMATION) */
    this.toggleBounce = () => {
      if(marker.getAnimation() !== null) {
        marker.setAnimation(null);
      } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
      }
    }    

    /** Function that gets the current position of the user using 'navigator' */
    this.currentPosition = dest => {
      navigator.geolocation.getCurrentPosition(pos => {
        this.reverseGeocoding(pos, dest);
        this.initializeMap(pos, dest);
      }, error => {
        console.log(`Unable to get location: ${error.message}`);
      }, { enableHighAccuracy: true });
    }

    /** A function that convert the coordinates(latitude, longitude) to address */
    this.reverseGeocoding = (pos, dest) => {
      let query = {
        latlng: `${pos.coords.latitude},${pos.coords.longitude}`,
        result_type: 'street_address'
      };

      // reverseGeocode
      googleMapsClient.reverseGeocode(query)
        .asPromise()
        .then(response => {
          this[dest] = response.json.results[0].formatted_address;
          this.$scope.$apply();
        })
        .catch(err => {
          console.log(err);
        })
    }

    /** This function adds the event to a specific element(input[type='text']) */
    this.googleAutoComplete = elem => {
      let autocomplete = new google.maps.places.Autocomplete(elem);
      autocomplete.addListener('place_changed', () => {
        let place = autocomplete.getPlace();
        this.error[elem.id] = false;
        this.$scope.$apply();

        /** User entered the name of a Place that was not suggested and
           pressed the Enter key, or the Place Details request failed. */
        if (!place.geometry) {
          this.error[elem.id] = true;
          this.deleteMarker(elem.id);
          this.$scope.$apply();
          return;
        }

        this.addMarker(place.geometry.location, elem.id);
      });
    }

    /** Render events after the content is completely loaded */
    angular.element(document).ready(() => {
      this.currentPosition('origin');
      this.googleAutoComplete(document.getElementById('origin'));
      this.googleAutoComplete(document.getElementById('end'));
    });

  }
  
  /** A function called to call the current position in a specific destination */
  toggleCurrentLocation(dest, status) {
    if(status) {
      this.currentPosition(dest);
    } else {
      this.deleteMarker(dest);
      this[dest] = '';
    }
  }
}

export default angular.module('searchLocationApp.main', [uiRouter])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController
  })
  .name;
