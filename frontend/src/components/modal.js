import Vue from 'vue';

import modalTpl from './modal.html!vtc';
import './modal.css!css';

const MyModal = Vue.component('my-modal', {
  props: ['result'],
  render: modalTpl.render,
  staticRenderFns: modalTpl.staticRenderFns
});

export default MyModal;
