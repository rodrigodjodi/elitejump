import Vue from "vue";
import App from "./App.vue";
import VueYoutube from "vue-youtube";
import VueTimers from "vue-timers";
Vue.use(VueYoutube);
Vue.use(VueTimers);
Vue.config.productionTip = false;

new Vue({
  render: h => h(App)
}).$mount("#app");
