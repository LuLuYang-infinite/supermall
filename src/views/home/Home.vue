<template>
    <div id="home" class="wrapper">
        <nav-bar class="home-nav"><div slot="center">购物街</div></nav-bar>
         <tab-control 
            :titles="['流行','新款','精选']"
            @tabClick="tabClick"
            ref = "tabControl1"
            class = "tab-control" v-show = "isTabFixed"
            />
        <scroll class="content"
        ref="scroll"
        :probe-type="3"
        @scroll="contentScroll"
        :pull-up-load="true"
        @pullingUp = "loadMore"
        >
        <home-swiper :banners="banners" @swiperimageLoad = "swiperimageLoad"/>
        <recommend-view :recommends="recommends"/>
        <feature-view/>
        <tab-control 
            :titles="['流行','新款','精选']"
            @tabClick="tabClick"
            ref = "tabControl2"
            />
            <good-list :goods="showGoods"/>
        </scroll>

        <back-top @click.native="backClick" v-show="isShowBackTop"/>
        
    </div>
</template>

<script>
import NavBar from 'components/common/navbar/NavBar';
import HomeSwiper from './childComps/HomeSwiper';
import RecommendView from './childComps/RecommendView';
import FeatureView from './childComps/FeatureView';

import TabControl from 'components/content/tabControl/TabControl';
import GoodList from 'components/content/goods/GoodsList';
import Scroll from 'components/common/scroll/Scroll';
import BackTop from 'components/content/backTop/BackTop'

import{getHomeMultidata,getHomeGoods} from "network/home";
import {debounce} from "common/utils"
export default {
    name:"Home",
    components:{
        NavBar,
        HomeSwiper,
        RecommendView,
        FeatureView,
        TabControl,
        GoodList,
        Scroll,
        BackTop
    },
    data(){
        return{
            banners:[],
            recommends:[],
            goods:{
                'pop':{page:0,list:[]},
                'new':{page:0,list:[]},
                'sell':{page:0,list:[]}
            },
            currentType:'pop',
            isShowBackTop:false,
            tabOffsetTop:0,
            isTabFixed:false,
            saveY:0
        }
    },
    computed:{
        showGoods(){
            return this.goods[this.currentType].list
        }
    },
    actived(){
        this.$refs.scrollTo(0,this.saveY,0)
           this.$refs.scroll.refresh()
        
    },
    deactived(){
        this.saveY = this.$refs.scroll.getScrollY()
    },
    created(){
        this.getHomeMultidata()

        this.getHomeGoods('pop')
        this.getHomeGoods('new')
        this.getHomeGoods('sell')
    },
    mounted(){
        const refresh = debounce(this.$refs.scroll.refresh,50)
        this.$bus.$on('imageLoad',()=>{
            refresh()
        })
    },
    methods:{
        tabClick(index){
            switch(index){
                case 0:
                    this.currentType = 'pop'
                    break

                case 1:
                    this.currentType = 'new'
                    break

                case 2:
                    this.currentType = 'sell'
                    break

            }
            this.$refs.tabControl1.currentIndex = index;
            this.$refs.tabControl2.currentIndex = index;
        },
        backClick(){
            this.$refs.scroll.scrollTo(0,0,1000)
        },
        contentScroll(position){
            this.isShowBackTop = (-position.y) > 1000

            this.isTabFixed = (-position.y) > this.tabOffsetTop
        },
        loadMore(){
                this.getHomeGoods(this.currentType)
        },
        swiperimageLoad(){
            this.tabOffsetTop = this.$refs.tabControl2.$el.offsetTop;
        },

        getHomeMultidata(){
            getHomeMultidata().then(res=>{
            this.banners = res.data.banner.list;
            this.recommends = res.data.recommend.list;
        })
    },
    getHomeGoods(type){
        const page = this.goods[type].page + 1
        getHomeGoods(type,page).then(res=>{
            this.goods[type].list.push(...res.data.list)
            this.goods[type].page+=1
            //console.log(res)

            this.$refs.scroll.finishPullUp()
        })
    }

    }
}
</script>

<style scoped>

#home{
    /*  padding: top 44px; */
     height: 100vh;
     position: relative;
}
    .home-nav{
        background-color:var(--color-tint);
        color: #fff;

    }

    

  .content{
      overflow: hidden;
      position: absolute;
      top: 44px;
      bottom: 49px;
      left: 0;
      right: 0;
  }
 /* 给设置一个相对定位，使它在图片的上方 */
  .tab-control{
      position: relative;
      z-index: 9;
  }

   /* .content {
    height: calc(100% - 93px);
    overflow: hidden;
    margin-top: 44px;
  } */

</style>