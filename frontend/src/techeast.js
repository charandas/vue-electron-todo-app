import Vue from 'vue';
import VueRouter from 'vue-router';
import VTooltip from 'v-tooltip';
import VueButton from 'vue-button';
import { VueSelect } from 'vue-select';

import 'mdi/css/materialdesignicons.css!css';

import techeastTpl from './techeast.html!vtc';

import './components/tooltip.css!css';
import MyDashboard from './components/dashboard';
import MySettings from './components/settings';

Vue.use(VueRouter);
Vue.use(VTooltip);
Vue.component('v-button', VueButton);
Vue.component('v-select', VueSelect);

const routes = [
  {
    path: '/',
    component: MyDashboard,
    props: (route) => ({ visibility: route.query.visibility || 'all' })
  },
  {
    path: '/settings',
    component: MySettings
  }
];

const router = new VueRouter({
  routes
});

const app = new Vue({
  render: techeastTpl.render,
  staticRenderFns: techeastTpl.staticRenderFns,
  router
});

app.$mount('#app-container');
