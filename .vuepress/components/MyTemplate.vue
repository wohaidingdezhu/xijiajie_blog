
 <template>
  <div id="heros" :style="{ 'background-image': `url(${bgImagePath})` }">
  </div>
</template>
 <script>
import { homeHeaderImages } from "./../util";
export default {
  components: {},
  data() {
    return {
      currentPage: 1,
      tags: [],
      bgImageID: 0,
      bgImagePath: "",
      headerOpacity: 1,
    };
  },
  mounted() {
    // header image
    const heros = document.querySelector('#heros');
    this.insertEle(heros);
    homeHeaderImages &&
      (this.bgImageID = Math.floor(
        Math.random() * homeHeaderImages.local.length
      ));
     this.setImagePathByID();  
     console.log('[  this.bgImagePath  ] >',  this.bgImagePath )
     this.setHeroBgc();
  },
  methods: {
    setImagePathByID() {
      this.bgImagePath = this.$withBase(
       homeHeaderImages.local[this.bgImageID].path
      );
    },
     insertEle(ele){
     return document.getElementsByClassName('home-blog')[0].append(ele);
    },
    setHeroBgc(){
     const hero = document.getElementsByClassName('hero')[0];
     hero.style.backgroundImage = `url(${this.bgImagePath})`;
    //  hero.style=`background-image:${this.bgImagePath}`
     console.log('[ hero 111] >', hero.style);
    }
  },
};
</script>
 <style>
 .heros{
   text-align: center;
   overflow: hidden;
   position: relative;
 }
</style>