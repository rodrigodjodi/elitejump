<template>
  <div id="app">
    <h1>{{videos[currentVideoIndex].title}}</h1>
    <youtube :player-vars="playerVars" ref="youtube"></youtube>
    <button @click="startSession">Play</button>
    <p>Timer inicia em {{getInPositionCountdown}} segundos</p>
    <p>Exercício termina em {{exerciseCountdown}} segundos</p>
    <vc-donut
      ref="countdown"
      :total="videos[currentVideoIndex].timer.seconds"
      :sections="[{value: exerciseCountdown}]"
      :text="exerciseCountdown.toString()"
    />

    <p>Você fez {{exerciseRepCount}} de {{videos[currentVideoIndex].timer.repetitionCount}}</p>
    <!-- <timer-component @timer-stop:getInPosition="startExercise" @timer-stop:exercise="nextExercise"/> -->
    <p>Timer preparo: {{timers.getInPosition.isRunning}}</p>
    <p>Timer exercício: {{timers.countdown.isRunning}}</p>
    <p>contagem exercício: {{timers.repCount.isRunning}}</p>
  </div>
</template>

<script>
/* import { timer } from "vue-timers"; */
export default {
  name: "App",
  /* components: { 'timer-component': timer }, */
  data() {
    return {
      synth: null,
      loopDuration: 10000,
      videoStart: 0,
      currentVideoIndex: 0,
      getInPositionCountdown: 0,
      exerciseCountdown: 0,
      exerciseRepCount: 0,
      videos: [
        {
          title: "Foca",
          repText: "5x cada lado",
          videoId: "3nhQfUGjRCA",
          start: 3,
          end: 15,
          timer: {
            type: "repCount",
            repetitionCount: 5,
            repetitionTime: 3000,
            bothSides: true
          },
          rest: 0
        },
        {
          title: "Pretzel",
          repText: "30s cada lado",
          videoId: "3nhQfUGjRCA",
          start: 32,
          end: 42,
          timer: { type: "countdown", seconds: 30, bothSides: true },
          rest: 0
        }
      ],
      playerVars: {
        controls: 1
      }
    };
  },
  computed: {
    player() {
      return this.$refs.youtube.player;
    }
  },
  timers: {
    seek: { time: 1000, autostart: false, repeat: true },
    getInPosition: { time: 1000, autostart: false, repeat: true },
    countdown: { time: 1000, autostart: false, repeat: true },
    repCount: { time: 1000, autostart: false, repeat: true }
  },
  methods: {
    // **** TIMERS ******
    seek() {
      this.player.seekTo(this.videoStart, true);
    },
    getInPosition() {
      if (this.getInPositionCountdown > 0) {
        this.getInPositionCountdown--;
      } else {
        this.$timer.stop("getInPosition");
        this.startExercise();
      }
    },
    countdown() {
      if (this.exerciseCountdown > 0) {
        this.exerciseCountdown--;
      } else {
        this.$timer.stop("countdown");
        this.nextExercise();
      }
    },
    repCount() {
      if (
        this.exerciseRepCount <
        this.videos[this.currentVideoIndex].timer.repetitionCount
      ) {
        this.exerciseRepCount++
        this.speak(this.exerciseRepCount)
      } else {
        this.$timer.stop("repCount");
        this.exerciseRepCount = 0;
        this.nextExercise();
      }
    },
    // ***** FIM TIMERS *****
    startExercise() {
      switch (this.videos[this.currentVideoIndex].timer.type) {
        case "countdown":
          this.exerciseCountdown = this.videos[
            this.currentVideoIndex
          ].timer.seconds;
          this.$timer.start("countdown");
          break;
        case "repCount":
          this.timers.repCount.time = this.videos[
            this.currentVideoIndex
          ].timer.repetitionTime;
          this.$timer.start("repCount");
          break;

        default:
          break;
      }
      /* if (this.videos[this.currentVideoIndex].repetitionType */
    },
    nextExercise() {
      if (this.currentVideoIndex >= this.videos.length) return;
      this.$timer.stop("seek");
      this.player.stopVideo();
      this.currentVideoIndex++;
      this.play(this.videos[this.currentVideoIndex]);
      this.getInPositionCountdown = 10;
      this.$timer.start("getInPosition");
    },
    startSession() {
      this.play(this.videos[this.currentVideoIndex]);
      this.getInPositionCountdown = 10;
      this.$timer.start("getInPosition");
    },
    play(params) {
      let { videoId, start, end } = params;
      this.videoStart = start;
      this.loopDuration = (end - start) * 1000;
      this.player
        .loadVideoById({
          videoId: videoId,
          startSeconds: start,
          endSeconds: end
        })
        .then(() => this.player.mute())
        .then(() => this.player.playVideo())
        .then(() => {
          this.timers.seek.time = this.loopDuration;
          this.$timer.start("seek");
        });
    },
    speak(text) {
      if (this.synth.speaking) {
        console.error('speechSynthesis.speaking');
        return;
      }
      if (!text) return

      var utterThis = new SpeechSynthesisUtterance(text);
      utterThis.onend = function (event) {
        console.log('SpeechSynthesisUtterance.onend');
      }
      utterThis.onerror = function (event) {
        console.error('SpeechSynthesisUtterance.onerror');
      }
      this.synth.speak(utterThis);
    }
    
  },
  mounted() {
    this.synth = window.speechSynthesis || null
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
