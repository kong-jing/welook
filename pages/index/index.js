//index.js
const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}

const weatherColorMap = {
  'sunny': '#cdeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}

Page({
  data:{
    nowTemp:14,
    nowWeather:'多云',
    nowWeatherBackground:''
  },
  onLoad(){
    console.log("Hello world!")

    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: '广州市' 
      },
      header: {
        'content-type': 'application/json'//默认值
      },

      success: res => {
        console.log(res.data);
        let result = res.data.result;
        let temp = result.now.temp;
        let weather = result.now.weather;
        console.log(temp, weather);
        this.setData({
          nowTemp: temp + '°',
          nowWeather: weatherMap[weather],
          nowWeatherBackground:'/images/'+weather+'-bg.png'
        })
        //动态设置导航栏的颜色
        wx.setNavigationBarColor({
          frontColor: '#000000',
          backgroundColor: weatherColorMap[weather],
          animation: {
            duration: 400,
            timingFunc: 'easeIn'
          },
          success: function(res) {},
          fail: function(res) {},
          complete: function(res) {},
        })
      },
      fail: res =>{

      }
  })
  }
})





