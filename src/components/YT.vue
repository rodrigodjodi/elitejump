<template>
  <div>
    <div ref="ytplayer"></div>
    <button @click="play">play</button>
  </div>
</template>

<script>
import YouTubePlayer from "youtube-player";
export default {
  name: "YT",
  props: {
    id: String
  },
  data() {
    return {
      player: null
    };
  },
  methods: {
    
  },
  mounted() {
    let player = YouTubePlayer(this.$refs.ytplayer, {
      playerVars: {
        controls: 1,
        showinfo: 0,
        rel: 0
      }
    });
    /* player.on("stateChange", event => {
      if (event.data == 0) {
        this.play();
      }
    }); */
    this.player = player;
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>
