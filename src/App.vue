<template>
  <div id="app">
    <youtube :player-vars="playerVars" ref="youtube"></youtube>
    <h1>{{videos[currentVideoIndex].title}}</h1>
    
    <button @click="prevExercise">Anterior</button>
    <button @click="resumeSession">Play</button>
    <button @click="stopSession">Stop</button>
    <button @click="nextExercise">Próximo</button>

    <vc-donut
      v-if="timers.countdown.isRunning"
      ref="countdown"
      :total="videos[currentVideoIndex].timer.seconds"
      :sections="[{value: exerciseCountdown}]"
      :text="exerciseCountdown.toString()"
    />
    <vc-donut
      v-if="timers.getInPosition.isRunning"
      ref="getInPosition"
      :total="TIME_TO_POSITION"
      :sections="[{value: getInPositionCountdown}]"
      text="Prepare-se"
    />
    <vc-donut
      v-if="timers.changeSide.isRunning"
      ref="changeSide"
      :total="CHANGE_SIDE_INTERVAL"
      :sections="[{value: changeSideCountdown}]"
      text="Mudança de lado"
    />
    <vc-donut
      v-if="timers.repCount.isRunning"
      ref="repCount"
      :total="videos[currentVideoIndex].timer.repetitionCount"
      :sections="[{value: exerciseRepCount}]"
      :text="`<strong>${exerciseRepCount.toString()}</strong>/${videos[currentVideoIndex].timer.repetitionCount}`"
    >
      <span style="font-size:xxx-large">{{exerciseRepCount.toString()}}</span>
      /{{videos[currentVideoIndex].timer.repetitionCount}}
    </vc-donut>

    <!-- <timer-component @timer-stop:getInPosition="startExercise" @timer-stop:exercise="nextExercise"/> -->
    <p>Timer preparo: {{timers.getInPosition.isRunning}}</p>
    <p>Timer exercício: {{timers.countdown.isRunning}}</p>
    <p>contagem exercício: {{timers.repCount.isRunning}}</p>
  </div>
</template>

<script>
import  bBeep  from "browser-beep"
const beep = bBeep({ frequency: 500 })
export default {
  name: "App",
  /* components: { 'timer-component': timer }, */
  data() {
    return {
      doneSide1: false,
      voices: [],
      TIME_TO_POSITION: 5,
      CHANGE_SIDE_INTERVAL: 4,
      synth: null,
      loopDuration: 10000,
      videoStart: 0,
      currentVideoIndex: 0,
      getInPositionCountdown: 0,
      changeSideCountdown: 4,
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
            repetitionTime: 6000,
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
          timer: { type: "countdown", seconds: 10, bothSides: true },
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
    repCount: { time: 1000, autostart: false, repeat: true },
    changeSide: { time: 1000, autostart: false, repeat: true }
  },
  methods: {
    // **** TIMERS ******
    seek() {
      this.player.seekTo(this.videoStart, true);
    },
    getInPosition() {
      if (this.getInPositionCountdown > 0) {
        this.getInPositionCountdown--;
        beep(1)
      } else {
        this.$timer.stop("getInPosition");
        this.startExercise();
      }
    },
    countdown() {
      if (this.exerciseCountdown > 0) {
        this.exerciseCountdown--;
      } else {
        // chegou no fim do tempo, zera o timer. Tem que fazer outro lado?
        this.$timer.stop("countdown");
        if (
          this.videos[this.currentVideoIndex].timer.bothSides &&
          !this.doneSide1
        ) {
          //chama o timer de virada
          this.doneSide1 = true;
          this.speak("Mudança de lado...");
          this.$timer.start("changeSide");
        } else {
          this.nextExercise();
        }
      }
    },
    repCount() {
      this.exerciseRepCount++;
      if (
        this.exerciseRepCount <
        this.videos[this.currentVideoIndex].timer.repetitionCount
      ) {
        this.speak(this.exerciseRepCount);
      } else {
        this.speak(this.exerciseRepCount);
        this.$timer.stop("repCount");
        this.exerciseRepCount = 0;
        if (
          this.videos[this.currentVideoIndex].timer.bothSides &&
          !this.doneSide1
        ) {
          //chama o timer de virada
          this.doneSide1 = true;
          this.speak("Mudança de lado...");
          this.$timer.start("changeSide");
        } else {
          this.nextExercise();
        }
      }
    },
    changeSide() {
      if (this.changeSideCountdown > 0) {
        this.changeSideCountdown--;
      } else {
        this.$timer.stop("changeSide");
        this.changeSideCountdown = this.CHANGE_SIDE_INTERVAL;
        this.startExercise();
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
    },
    nextExercise() {
      this.stopSession();
      this.currentVideoIndex++;
      this.currentVideoIndex < this.videos.length
        ? this.resumeSession()
        : (this.currentVideoIndex = 0);
    },
    prevExercise() {
      this.stopSession();
      this.currentVideoIndex--;
      this.currentVideoIndex >= 0
        ? this.resumeSession()
        : (this.currentVideoIndex = 0);
    },
    resumeSession() {
      this.speak(this.videos[this.currentVideoIndex].title);
      this.play(this.videos[this.currentVideoIndex]);
      this.getInPositionCountdown = this.TIME_TO_POSITION;
      this.$timer.start("getInPosition");
    },
    stopSession() {
      this.$timer.stop("seek");
      this.$timer.stop("changeSide");
      this.$timer.stop(this.videos[this.currentVideoIndex].timer.type);
      this.player.stopVideo();
      this.doneSide1 = false;
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
        console.error("speechSynthesis.speaking");
        return;
      }
      if (!text) return;

      var utterThis = new SpeechSynthesisUtterance(text);
      utterThis.voice = this.voices[0];
      utterThis.onerror = function(event) {
        console.error("SpeechSynthesisUtterance.onerror");
      };
      this.synth.speak(utterThis);
    }
  },
  mounted() {
    if (window.speechSynthesis) {
      this.synth = window.speechSynthesis;
      this.voices = this.synth.getVoices();
    }
  }
};
</script>

<style>
#app {

}
</style>
