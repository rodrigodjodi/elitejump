<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <v-row>
          <v-col :xs="12" :sm="8">
            <v-responsive :aspect-ratio="16/9">
             <youtube :player-vars="playerVars" :fitParent="true"
             resize="true" ref="youtube"></youtube>
            </v-responsive>
            <br>
            <h1>{{videos[currentVideoIndex].title}}</h1>
            <p>{{videos[currentVideoIndex].repText}}</p>
          </v-col>
          <!-- <v-btn @click="prevExercise">Anterior</v-btn>
            <v-btn @click="resumeSession">Play</v-btn>
            <v-btn @click="stopSession">Stop</v-btn>
          <v-btn @click="nextExercise">Próximo</v-btn>-->
          <v-col :xs="12" :sm="4">
            <vc-donut class="ma-4" v-if="isIdle" ref="idle" :total="1" :sections="[{value: 0}]">
              <v-btn small icon @click="prevExercise">
                <v-icon>mdi-rewind</v-icon>
              </v-btn>
              <v-btn x-large icon @click="resumeSession" color="primary" class="mx-8">
                <v-icon>mdi-play</v-icon>
              </v-btn>
              <v-btn small icon @click="nextExercise">
                <v-icon>mdi-fast-forward</v-icon>
              </v-btn>
            </vc-donut>

            <vc-donut
              v-if="timers.countdown.isRunning"
              ref="countdown"
              :total="videos[currentVideoIndex].timer.seconds"
              :sections="[{value: exerciseCountdown}]"
            >
              {{exerciseCountdown.toString()}}
              <br>
              <v-btn small icon @click="prevExercise">
                <v-icon>mdi-rewind</v-icon>
              </v-btn>
              <v-btn
                v-show="!timers.countdown.isRunning"
                x-large
                icon
                @click="resumeSession"
                color="primary"
                class="mx-8"
              >
                <v-icon>mdi-play</v-icon>
              </v-btn>
              <v-btn
                v-show="timers.countdown.isRunning"
                x-large
                icon
                @click="stopSession"
                color="primary"
                class="mx-8"
              >
                <v-icon>mdi-stop</v-icon>
              </v-btn>
              <v-btn small icon @click="nextExercise">
                <v-icon>mdi-fast-forward</v-icon>
              </v-btn>
            </vc-donut>

            <vc-donut
              v-if="timers.rest.isRunning"
              ref="rest"
              :total="videos[currentVideoIndex].rest"
              :sections="[{value: restCountdown}]"
            >
              Descanso: {{restCountdown.toString()}}
              <br>
              <v-btn small icon @click="prevExercise">
                <v-icon>mdi-rewind</v-icon>
              </v-btn>
              <v-btn
                v-show="!timers.rest.isRunning"
                x-large
                icon
                @click="resumeSession"
                color="primary"
                class="mx-8"
              >
                <v-icon>mdi-play</v-icon>
              </v-btn>
              <v-btn
                v-show="timers.rest.isRunning"
                x-large
                icon
                @click="stopSession"
                color="primary"
                class="mx-8"
              >
                <v-icon>mdi-stop</v-icon>
              </v-btn>
              <v-btn small icon @click="nextExercise">
                <v-icon>mdi-fast-forward</v-icon>
              </v-btn>
            </vc-donut>

            <vc-donut
              v-if="timers.getInPosition.isRunning"
              ref="getInPosition"
              :total="videos[currentVideoIndex].timer.prep || DEFAULT_PREP_TIME"
              :sections="[{value: getInPositionCountdown}]"
              text
            >Prepare-se
              <br>
              <v-btn small icon @click="prevExercise">
                <v-icon>mdi-rewind</v-icon>
              </v-btn>
              <v-btn
                v-show="!timers.getInPosition.isRunning"
                x-large
                icon
                @click="resumeSession"
                color="primary"
                class="mx-8"
              >
                <v-icon>mdi-play</v-icon>
              </v-btn>
              <v-btn
                v-show="timers.getInPosition.isRunning"
                x-large
                icon
                @click="stopSession"
                color="primary"
                class="mx-8"
              >
                <v-icon>mdi-stop</v-icon>
              </v-btn>
              <v-btn small icon @click="nextExercise">
                <v-icon>mdi-fast-forward</v-icon>
              </v-btn>
            </vc-donut>

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
            >
              <span style="font-size:xxx-large">{{exerciseRepCount.toString()}}</span>
              /{{videos[currentVideoIndex].timer.repetitionCount}}
              <br>
              <v-btn small icon @click="prevExercise">
                <v-icon>mdi-rewind</v-icon>
              </v-btn>
              <v-btn
                v-show="!timers.repCount.isRunning"
                x-large
                icon
                @click="resumeSession"
                color="primary"
                class="mx-8"
              >
                <v-icon>mdi-play</v-icon>
              </v-btn>
              <v-btn
                v-show="timers.repCount.isRunning"
                x-large
                icon
                @click="stopSession"
                color="primary"
                class="mx-8"
              >
                <v-icon>mdi-stop</v-icon>
              </v-btn>
              <v-btn small icon @click="nextExercise">
                <v-icon>mdi-fast-forward</v-icon>
              </v-btn>
            </vc-donut>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
//import { fase1_sqs } from "@/assets/fase1-sqs";
import { fase1_tq } from "@/assets/fase1-tq";
import bBeep from "browser-beep";
const beep = bBeep({ frequency: 800 });
const beep2 = bBeep({ frequency: 5000 });
export default {
  name: "App",
  /* components: { 'timer-component': timer }, */

  data() {
    return {
      restCountdown: 0,
      doneSide1: false,
      voices: [],
      DEFAULT_PREP_TIME: 5,
      CHANGE_SIDE_INTERVAL: 4,
      synth: null,
      loopDuration: 10000,
      videoStart: 0,
      currentVideoIndex: 0,
      getInPositionCountdown: 0,
      changeSideCountdown: 4,
      exerciseCountdown: 0,
      exerciseRepCount: 0,
      videos: fase1_tq,
      playerVars: {
        controls: 0
      }
    };
  },
  computed: {
    player() {
      return this.$refs.youtube.player;
    },
    isIdle() {
      return !(
        this.timers.countdown.isRunning ||
        this.timers.getInPosition.isRunning ||
        this.timers.changeSide.isRunning ||
        this.timers.repCount.isRunning ||
        this.timers.rest.isRunning 
      );
    }
  },
  timers: {
    seek: { time: 1000, autostart: false, repeat: true },
    getInPosition: { time: 1000, autostart: false, repeat: true },
    countdown: { time: 1000, autostart: false, repeat: true },
    repCount: { time: 1000, autostart: false, repeat: true },
    changeSide: { time: 1000, autostart: false, repeat: true },
    rest: { time: 1000, autostart: false, repeat: true }
  },
  methods: {
    // **** TIMERS ******
    seek() {
      this.player.seekTo(this.videoStart, true);
    },
    getInPosition() {
      if (this.getInPositionCountdown > 0) {
        this.getInPositionCountdown--;
        beep(1);
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
          //agora veja se tem descanso
          if(this.videos[this.currentVideoIndex].rest === 0) {
            this.nextExercise();
          } else {
            this.restCountdown = this.videos[this.currentVideoIndex].rest
            this.$timer.start("rest");
          }
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
          //agora veja se tem descanso
          if(this.videos[this.currentVideoIndex].rest === 0) {
            this.nextExercise();
          } else {
            this.restCountdown = this.videos[this.currentVideoIndex].rest
            this.$timer.start("rest");
          }
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
    rest() {
      if (this.restCountdown > 0) {
        this.restCountdown--;
    } else {
        this.$timer.stop("rest")
        this.nextExercise()
    }
    },
    // ***** FIM TIMERS *****
    startExercise() {
      beep2(2);
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
      this.getInPositionCountdown =
        this.videos[this.currentVideoIndex].timer.prep ||
        this.DEFAULT_PREP_TIME;
      this.$timer.start("getInPosition");
    },
    stopSession() {
      this.$timer.stop("getInPosition");
      this.$timer.stop("seek");
      this.$timer.stop("changeSide");
      this.$timer.stop(this.videos[this.currentVideoIndex].timer.type);
      this.$timer.stop("rest");
      this.player.stopVideo();
      this.doneSide1 = false;
      this.exerciseRepCount = 0
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
        console.error("SpeechSynthesisUtterance.onerror " + event);
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
</style>
