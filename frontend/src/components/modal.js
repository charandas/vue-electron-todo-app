import Vue from 'vue';

import modalTpl from './modal.html!vtc';
import './modal.css!css';

const MyModal = Vue.component('my-modal', {
  props: ['result', 'onOutsideClick'],
  data () {
    return {
      overModal: false,
      focused: false
    };
  },
  methods: {
    focusOn: function () {
      this.focused = true;
    },
    onEscKeyHandler: function (e) {
      if (e.keyCode === 27) {
        this.overModal = false;
        this.onOutsideClickHandler();
      }
    },
    onOutsideClickHandler: function (e) {
      if (!this.overModal && this.focused) {
        if (this.onOutsideClick) {
          this.onOutsideClick();
        } else {
          this.result('cancel');
        }
      }
    }
  },
  mounted () {
    document.addEventListener('keyup', this.onEscKeyHandler);
    document.addEventListener('click', this.onOutsideClickHandler);
  },
  beforeDestroy () {
    document.removeEventListener('keyup', this.onEscKeyHandler);
    document.removeEventListener('click', this.onOutsideClickHandler);
  },
  render: modalTpl.render,
  staticRenderFns: modalTpl.staticRenderFns
});

export default MyModal;
