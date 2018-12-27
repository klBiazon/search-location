'use strict';

import angular from 'angular';

export default angular.module('searchLocationApp.constants', [])
  .constant('appConfig', require('../../server/config/environment/shared'))
  .constant('googleKey', {apiKey: 'AIzaSyCypTS4spJ3xv4U53sAy9KJKE9hqEcPyuw'})
  .name;
