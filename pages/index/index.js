//index.js
// 引入SDK核心类
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');

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

const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2

Page({
  data: {
    nowTemp: 14,
    nowWeather: '多云',
    nowWeatherBackground: '',
    hourlyWeather: [],
    todayTemp: "",
    todayDate: "",
    city: "广州市",
    locationAuthType: UNPROMPTED
  },
  onPullDownRefresh: function () {//下拉刷新的回调
    this.getNow(() => {
      wx.stopPullDownRefresh();
    });
  },
  getNow(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: this.data.city
      },
      header: {
        'content-type': 'application/json'//默认值
      },

      success: res => {
        console.log(res.data);
        let result = res.data.result;
        this.setNow(result);
        this.setHourlyWeather(result);
        //设置forecast参数
        this.setToday(result);
      },
      fail: res => {
        wx.stopPullDownRefresh();
      },
      complete: () => {
        // wx.stopPullDownRefresh();
        callback && callback();
      }
    })
  },
  onLoad() {
    this.qqmapsdk = new QQMapWX({
      key: 'BRXBZ-QRJCX-T2543-7DL7T-P72IO-5EBBF'
    });

    wx.getSetting({
      success: res => {
        let auth = res.authSetting['scope.userLocation']
        console.log(auth)
        this.setData({
          locationAuthType: auth ? AUTHORIZED : (auth === false) ? UNAUTHORIZED : UNPROMPTED,
        })
        if (auth) {
          this.getCiryAndWeather()
        } else {
          this.getNow()
        }
      },
      fail: res => {
        let auth = res.authSetting['scope.userLocation']
        this.setData({
          locationAuthType: auth ? AUTHORIZED : (auth === false) ? UNAUTHORIZED : UNPROMPTED,
        })
        if (auth) {
          this.getCiryAndWeather()
        } else {
          this.getNow()
        }
      }
    })
    this.getNow();
  },

  // 设置当前时间 
  setNow(result) {

    let temp = result.now.temp;
    let weather = result.now.weather;
    console.log(temp, weather);
    this.setData({
      nowTemp: temp + '°',
      nowWeather: weatherMap[weather],
      nowWeatherBackground: '/images/' + weather + '-bg.png'
    })
    //动态设置导航栏的颜色
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather],
      animation: {
        duration: 400,
        timingFunc: 'easeIn'
      },
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  setHourlyWeather(result) {
    let forecast = result.forecast;
    //设置时间
    let nowHour = new Date().getHours()

    let hourlyWeather = [];
    for (let i = 0; i < 8; i += 1) {
      hourlyWeather.push({
        time: (i * 3 + nowHour) % 24 + '时',
        iconPath: '/images/' + forecast[i].weather + '-icon.png',
        temp: forecast[i].temp + '°'
      });
    }
    hourlyWeather[0].time = '现在'
    this.setData({
      hourlyWeather: hourlyWeather
    })
  },

  setToday(result) {
    let date = new Date();
    this.setData({
      todayTemp: `${result.today.minTemp}° - ${result.today.maxTemp}°`,
      todayDate: `${date.getFullYear()} - ${date.getMonth() + 1} -${date.getDate()}今天`
    })
  },

  onTapDayWeather() {
    wx.navigateTo({
      url: '/pages/list/list?city=' + this.data.city,
    })
  },
  // 获取地址
  onTapLocation() {

    if (this.data.locationAuthType == UNAUTHORIZED) {
      wx.openSetting({
        success: res => {
          let auth = res.authSetting["scope.userLocation"]
          this.setData({
            locationAuthType: auth ? AUTHORIZED : (auth === false) ? UNAUTHORIZED : UNPROMPTED,
          })
          if (auth) {
            this.getCiryAndWeather()
          } else {
            this.getNow()
          }
        },
        fail: res => {
          console.log(res)
        }
      })
      this.setData({
        locationAuthType: AUTHORIZED
      })
    } else {
      this.getCiryAndWeather()
    }

  },

  getCiryAndWeather() {
    wx.getLocation({
      success: res => {
        this.setData({
          locationAuthType: AUTHORIZED
        })
        this.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: res => {
            let city = res.result.address_component.city;
            console.log(city);
            this.setData({
              city: city,
              locationTipsText: ""
            })
            this.getNow();
          }
        });
      },
      fail: res => {
        this.setData({
          locationAuthType: UNAUTHORIZED,
        })
      }
    })
  }
})





