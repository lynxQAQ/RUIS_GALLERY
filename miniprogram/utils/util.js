const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//节流函数 1.5s
function throttle(fn,gapTime){
  if(gapTime == null || gapTime == undefined){
    gapTime =1500
  }
  let _lastTime = null
  return function(){
    let _nowTime = + new Date()
    if(_nowTime - _lastTime > gapTime || !_lastTime){
      fn.apply(this,arguments) //将this和参数传给原函数
      _lastTime = _nowTime
    }
  }
}
//

module.exports = {
  formatTime: formatTime,

  //节流函数输出
  throttle:throttle

}
