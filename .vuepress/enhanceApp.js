import { addLinkToHead } from '@theme/helpers/utils'
export default ({ isServer }) => {
    // Vue.component('MyTemplate', MyTemplate)
    if (!isServer) {
    addLinkToHead('//at.alicdn.com/t/font_2399620_jztf98umdl.css?spm=a313x.7781069.1998910419.84&file=font_2399620_jztf98umdl.css')
  }
};
