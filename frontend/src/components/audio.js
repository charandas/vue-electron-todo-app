import Vue from 'vue';
import VueSpinner from 'vue-spinner';
import electron from '@node/electron';

import rpcClient from '../utils/rpc-client';
import audioTpl from './audio.html!vtc';
import './audio.css!css';

const MyAudio = Vue.component('my-audio', {
  render: audioTpl.render,
  staticRenderFns: audioTpl.staticRenderFns,
  data () {
    return {
      loading: false,
      progress: undefined,
      outputUrl: undefined
    };
  },
  components: {
    RiseLoader: VueSpinner.RiseLoader
  },
  computed: {
    progressPercent: function () {
      return this.progress ? parseInt(this.progress.percent) : 0;
    }
  },
  methods: {
    pickFile: function () {
      document.getElementById('video-file').click();
    },
    processPickedFile: function (event) {
      const form = document.getElementById('video-file-form');
      const fileInput = document.getElementById('video-file');
      console.log(event.target.files[0]);
      if (!event.target.files[0]) {
        return;
      }
      this.loading = true;

      electron.ipcRenderer.on('extractAudioProgress', (event, progress) => {
        console.log(progress.percent);
        if (progress.percent < 100) {
          this.outputUrl = progress.outputUrl;
          this.progress = progress;
        }
      });

      rpcClient
        .extractAudioAsync({
          movieUrl: event.target.files[0].path
        })
        .then(() => {
          electron.shell.showItemInFolder(this.progress.outputUrl);

          this.loading = false;
          this.progress = undefined;
          fileInput.value = null;
          form.reset();
          electron.ipcRenderer.removeAllListeners('extractAudioProgress');
        });
    }
  }
});

export default MyAudio;
