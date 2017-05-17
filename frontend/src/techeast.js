import Vue from 'vue';
import VueRouter from 'vue-router';
import VTooltip from 'v-tooltip';
import VueButton from 'vue-button';

import 'mdi/css/materialdesignicons.css!css';

import techeastTpl from './techeast.html!vtc';

import MyDashboard from './components/dashboard';
import MySettings from './components/settings';

Vue.use(VueRouter);
Vue.use(VTooltip);
Vue.component('v-button', VueButton);

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
