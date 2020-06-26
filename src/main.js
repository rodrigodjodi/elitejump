import Vue from "vue";
import App from "./App.vue";
import VueYoutube from "vue-youtube";
import VueTimers from "vue-timers";
import Donut from "vue-css-donut-chart";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";
import "vue-css-donut-chart/dist/vcdonut.css";
const opts = {
  icons: {
    iconfont: "mdi"
  }
};
Vue.use(Vuetify);
Vue.use(Donut);
Vue.use(VueYoutube);
Vue.use(VueTimers);
Vue.config.productionTip = false;

new Vue({
  vuetify: new Vuetify(opts),
  render: h => h(App)
}).$mount("#app");
