import DefaultTheme from 'vitepress/theme'
import DemoVideo from './DemoVideo.vue'
import HomeLanding from './HomeLanding.vue'
import EditorialLayout from './EditorialLayout.vue'
import './custom.css'

export default {
  ...DefaultTheme,
  Layout: EditorialLayout,
  enhanceApp({ app }) {
    app.component('DemoVideo', DemoVideo)
    app.component('HomeLanding', HomeLanding)
  }
}
