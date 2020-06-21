<template>
  <div id="app">
    <h1>{{videos[currentVideoIndex].title}}</h1>
    <youtube :player-vars="playerVars" ref="youtube"></youtube>
    <button @click="startSession">Play</button>
    <p>Timer inicia em {{getInPositionCountdown}} segundos</p>
    <p>Exercício termina em {{exerciseCoundown}} segundos</p>
    <!-- <timer-component @timer-stop:getInPosition="startExercise" @timer-stop:exercise="nextExercise"/> -->
    <p>Timer preparo: {{timers.getInPosition.isRunning}}</p>
    <p>Timer exercício: {{timers.exercise.isRunning}}</p>
  </div>
</template>

<script>
/* import { timer } from "vue-timers"; */
export default {
  name: "App",
  /* components: { 'timer-component': timer }, */
  data() {
    return {
      loopDuration: 10000,
      videoStart: 0,
      currentVideoIndex: 0,
      getInPositionCountdown: 0,
      exerciseCoundown: 0,
      videos: [
        {
          title: "Foca",
          repText: "5x cada lado",
          duration: 30,
          videoId: "3nhQfUGjRCA",
          start: 3,
          end: 15
        },
        {
          title: "Pretzel",
          repText: "30s cada lado",
          duration: 80,
          videoId: "3nhQfUGjRCA",
          start: 32,
          end: 42
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
    exercise: { time: 1000, autostart: false, repeat: true }
  },
  methods: {
    nextExercise() {
      this.$timer.stop("seek");
      this.player.stopVideo();
      this.currentVideoIndex++;
      this.play(this.videos[this.currentVideoIndex]);
      this.getInPositionCountdown = 10;
      this.$timer.start("getInPosition");
    },
    startExercise() {
      console.log('here')
      this.$timer.start("exercise");
    },
    exercise() {
      if (this.exerciseCoundown > 0) {
        this.exerciseCoundown--;
      } else {
        this.$timer.stop("exercise");
        this.nextExercise()
      }
    },
    getInPosition() {
      if (this.getInPositionCountdown > 0) {
        this.getInPositionCountdown--;
      } else {
        this.exerciseCoundown = this.videos[this.currentVideoIndex].duration;
        this.$timer.stop("getInPosition");
        this.$timer.start("exercise");
      }
    },
    seek() {
      this.player.seekTo(this.videoStart, true);
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
    }
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
