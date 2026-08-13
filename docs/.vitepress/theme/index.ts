import DefaultTheme from 'vitepress/theme'
import DemoVideo from './DemoVideo.vue'
import './custom.css'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('DemoVideo', DemoVideo)
  }
}
