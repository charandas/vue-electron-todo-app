import Vue from 'vue';

import modalTpl from './modal.html!vtc';
import './modal.css!css';

const MyModal = Vue.component('my-modal', {
  props: ['result', 'onOutsideClick'],
  data () {
    return {
      overModal: true,
      focused: false
    };
  },
  methods: {
    focusOn: function () {
      this.focused = true;
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
  created () {
    window.addEventListener('keyup', e => {
      if (e.keyCode === 27) {
        this.overModal = false;
        this.onOutsideClickHandler();
      }
    });
  },
  mounted () {
    document.addEventListener('click', this.onOutsideClickHandler);
  },
  beforeDestroy () {
    document.removeEventListener('click', this.onOutsideClickHandler);
  },
  render: modalTpl.render,
  staticRenderFns: modalTpl.staticRenderFns
});

export default MyModal;
