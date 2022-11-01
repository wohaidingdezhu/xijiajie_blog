---
home: true
heroText: null
tagline: null
heroImageStyle:
  {
    maxWidth: "600px",
    width: "100%",
    display: block,
    margin: "9rem auto 2rem",
    background: "#fff",
    borderRadius: "1rem",
  }
# bgImage: bg1.jpg
bgImage: null
bgImageStyle: {}
# height: '30vh'

isShowTitleInHome: false
features:
  - title: Yesterday
    details: 昨天在写博客
  - title: Today
    details: 今天也在写博客
  - title: Tomorrow
    details: 明天还得写博客
---

<!-- <canvas id="cvs" style="background-color: #000"></canvas> -->
<!-- <MyTemplate></MyTemplate> -->

#### 项目简介

一个基于[VuePress](https://vuepress.vuejs.org/zh/)实现的个人博客，简单记录自己的生活和代码。

<style>
body{
  background-image: url('https://blog.wangscaler.com/Ufb771a7d36b046f88b69aff276f000857.gif');
  }
.anchor-down {
  display: block;
  margin: 12rem auto 0;
  bottom: 45px;
  width: 20px;
  height: 20px;
  font-size: 34px;
  text-align: center;
  animation: bounce-in 5s 3s infinite;
  position: absolute;
  left: 50%;
  bottom: 30%;
  margin-left: -10px;
  cursor: pointer;
}
@-webkit-keyframes bounce-in{
  0%{transform:translateY(0)}
  20%{transform:translateY(0)}
  50%{transform:translateY(-20px)}
  80%{transform:translateY(0)}
  to{transform:translateY(0)}
}
.anchor-down::before {
  content: "";
  width: 20px;
  height: 20px;
  display: block;
  border-right: 3px solid #fff;
  border-top: 3px solid #fff;
  transform: rotate(135deg);
  position: absolute;
  bottom: 10px;
}
.anchor-down::after {
  content: "";
  width: 20px;
  height: 20px;
  display: block;
  border-right: 3px solid #fff;
  border-top: 3px solid #fff;
  transform: rotate(135deg);
}
</style>
<script>
export default {
  mounted () {
    const ifJanchor = document.getElementById("JanchorDown"); 
    const bgCanvas = document.querySelector("#bgCanvas");
    ifJanchor && ifJanchor.parentNode.removeChild(ifJanchor);
    const aDown = this.createEle('a',null,'JanchorDown','anchor-down');
    this.insertEle(aDown,'hero');
    aDown.addEventListener('click', e => { // 添加点击事件
      this.scrollFn();
    })
    // this.renderSnow();
},

  methods: {
    scrollFn() {
      const windowH = document.getElementsByClassName('hero')[0].clientHeight; // 获取窗口高度
      document.documentElement.scrollTop = windowH; // 滚动条滚动到指定位置
    },
    createEle(type,style,id,className){
      const elem=document.createElement(type);
      // 将style对象的所有属性复制到elem.style对象上，IE8以上
      Object.assign(elem.style,style);
      elem.id = id;
      elem.className = className;
      return elem;
    },
    insertEle(ele,into){
     return document.getElementsByClassName(`${into}`)[0].append(ele);
    },
    renderSnow(){
      if(!bgCanvas) return;
      const ctx = bgCanvas.getContext("2d");
      const { clientWidth: width, clientHeight: height } =
        document.documentElement;
      bgCanvas.width = width;
      bgCanvas.height = height;
      ctx.fillStyle = "#ffffff";
      console.log(ctx, "ctx");
      const bgColors = Array.from(new Array(400)).map((v) => {
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          step: Math.random() * 2.5 + 0.5,
        };
      });
      const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      bgColors.forEach((v) => {
        v.y = v.y > height ? 0 : v.y + v.step;
        ctx.rect(v.x, v.y, 3, 4);
      });
      ctx.fill();
      window.requestAnimationFrame(render);
     };
     render();
    }
  }
}
</script>
