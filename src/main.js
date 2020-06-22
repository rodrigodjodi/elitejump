import Vue from "vue";
import App from "./App.vue";
import VueYoutube from "vue-youtube";
import VueTimers from "vue-timers";
import Donut from "vue-css-donut-chart";
import "vue-css-donut-chart/dist/vcdonut.css";

Vue.use(Donut);
Vue.use(VueYoutube);
Vue.use(VueTimers);
Vue.config.productionTip = false;

new Vue({
  render: h => h(App)
}).$mount("#app");
