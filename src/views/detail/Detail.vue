<template>
    <div id="detail">
        <detail-nav-bar @titleClick="selectIndex" :current-index="currentIndex" class= "detail-nav"/>
        <scroll class="content" 
        ref="scroll"
        @scroll="contentScroll"
        :probe-type="3"
        >
        <detail-swiper :top-images= "topImages" />
        <detail-base-info :goods = "goods" />
        <detail-shop-info :shop = "shop" />
        <detail-goods-info :detail-info = "detailInfo" @imageLoad="imageLoad" />
        <detail-Param-info ref="param" :param-info = "paramInfo"/>
        <detail-comment-info ref="comment" :comment-info="commentInfo" />
        <goods-list ref="recommend" :goods="goodsList"/>
        </scroll>
        <back-top v-show="showBackTop" @click.native="backTop"/>

        <detail-bottom-bar @addToCart="addToCart" />
        <toast ref="toast"/>
       
    </div>
</template>
 
<script>
import DetailNavBar from './childComps/DetailNavBar';
import DetailSwiper from './childComps/DetailSwiper';
import DetailBaseInfo from './childComps/DetailBaseInfo';
import DetailShopInfo from './childComps/DetailShopInfo';
import DetailGoodsInfo from './childComps/DetailGoodsInfo';
import DetailParamInfo from './childComps/DetailParamInfo';
import DetailCommentInfo from './childComps/DetailCommentInfo';
import DetailBottomBar from './childComps/DetailBottomBar'

import GoodsList from 'components/content/goods/GoodsList'

import Scroll from 'components/common/scroll/Scroll'


import{getDetail,Goods,Shop,GoodsParam,getRecommend} from "network/detail"
import{backTopMixin} from "common/mixin"
import {mapActions} from 'vuex'

import Toast from 'components/common/toast/Toast'


export default {
    name:"Detail",
    components:{
        DetailNavBar,
        DetailSwiper,
        DetailBaseInfo,
        DetailShopInfo,
        DetailGoodsInfo,
        Scroll,
        DetailParamInfo,
        DetailCommentInfo,
        GoodsList,
        DetailBottomBar,
        Toast
    },
    mixins:[backTopMixin],
    data(){
        return{
            idd:null,
            topImages:[],
            goods:{},
            shop:{},
            detailInfo:{},
            paramInfo:{},
            commentInfo:{},
            goodsList:[],
            themTops:[],
            currentIndex:0
        }
    },
    created(){
        this.iid = this.$route.params.iid

        getDetail(this.iid).then(res=>{
            console.log(res)
            //1.获取顶部的图片轮播数据
            const data = res.result;
            this.topImages = data.itemInfo.topImages

            //2.获取商品信息
            this.goods = new Goods(data.itemInfo,data.columns,data.shopInfo.services)
           //console.log(this.goods)

           //3.获取店铺信息的对象
           this.shop = new Shop(data.shopInfo)
           console.log(this.shop)

           //4.保存商品详情页数据
           this.detailInfo = data.detailInfo

           //5.商品参数的信息
           this.paramInfo = new GoodsParam(data.itemParams.info,data.itemParams.rule)

            //6.商品评论信息
        if(data.rate.list){
            this.commentInfo = data.rate.list[0];
        }
        }),

        getRecommend().then(res=>{
            console.log(res)
            this.goodsList = res.data.list
        })
    },
    methods:{

        ...mapActions({
            addCart:'addToCart'
        }),

        imageLoad(){
            this.$refs.scroll.refresh()
             this.themeTops = []
        this.themeTops.push(0)
        this.themeTops.push(this.$refs.param.$el.offsetTop)
        this.themeTops.push(this.$refs.comment.$el.offsetTop)
        this.themeTops.push(this.$refs.recommend.$el.offsetTop)
        this.themeTops.push(Number.MAX_VALUE)
        },
        selectIndex(index){
              this.$refs.scroll.scrollTo(0, -this.themeTops[index], 500)
        },
        contentScroll(position){
             this._listenScrollTheme(-position.y)
             this.showBackTop = (-position.y) >= 1000
        },
          _listenScrollTheme(position) {
	      let length = this.themeTops.length;
	      for (let i = 0; i < length; i++) {
		      let iPos = this.themeTops[i];
		      /**
		       * 判断的方案:
		       *  方案一:
		       *    条件: (i < (length-1) && currentPos >= iPos && currentPos < this.themeTops[i+1]) || (i === (length-1) && currentPos >= iPos),
		       *    优点: 不需要引入其他的内容, 通过逻辑解决
		       *    缺点: 判断条件过长, 并且不容易理解
		       *  方案二:
		       *    条件: 给themeTops最后添加一个很大的值, 用于和最后一个主题的top进行比较.
		       *    优点: 简洁明了, 便于理解
		       *    缺点: 需要引入一个较大的int数字
		       * 疑惑: 在第一个判断中, 为什么不能直接判断(currentPos >= iPos)即可?
		       * 解答: 比如在某一个currentPos大于第0个时, 就会break, 不会判断后面的i了.
		       */
		      if (position >= iPos && position < this.themeTops[i+1]) {
			      if (this.currentIndex !== i) {
				      this.currentIndex = i;
			      }
			      break;
		      }
	      }
      },
      addToCart(){
          const obj={}
          obj.iid= this.iid
          obj.imageURL = this.topImages[0]
          obj.title = this.goods.title
          obj.desc = this.goods.desc
          obj.price = this.goods.realPrice

          this.addCart(obj).then(()=>{
              this.$toast({message: '加入购物车成功'})
          })
      }
    }
}
</script>

<style scoped>
     #detail {
    position: relative;
    z-index: 9;
    background-color: #fff;
    height: 100vh;
  }

    .detail-nav{
        position: relative;
        z-index: 9;
        background-color: #fff;
    } 

    .content{
     overflow: hidden;
      position: absolute;
      top: 44px;
      bottom: 58px;
      left: 0;
      right: 0;
    }
</style>

