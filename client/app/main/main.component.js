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

    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('thing');
    });
  }

  $onInit() {
    let marker;

    function initializeMap(pos) {
      var position = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };

      var map = new google.maps.Map(document.getElementById('googleMap'), {
        center: position,
        zoom: 15
      });

      marker = new google.maps.Marker({
        position,
        map,
        animation: google.maps.Animation.DROP,
        title: 'Here we are!'
      });
      marker.addListener('click', toggleBounce);
    }

    function toggleBounce() {
      if(marker.getAnimation() !== null) {
        marker.setAnimation(null);
      } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
      }
    }

    function currentPosition() {
      navigator.geolocation.getCurrentPosition(pos => {
        initializeMap(pos);
      }, error => {
        console.log('Unable to get location: ', error.message);
      }, {enableHighAccuracy: true});
    }

    currentPosition();
  }
}

export default angular.module('searchLocationApp.main', [uiRouter])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController
  })
  .name;
