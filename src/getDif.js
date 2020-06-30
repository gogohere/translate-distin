
const bluebird = require('bluebird');
const xml2js = bluebird.promisifyAll(require('xml2js'));
const _ = require('lodash');


function handleJson(xlfObj) {
  const JsonObj = {}
  let getSource = obj=>{
    _.forOwn(obj,(value,key) => {
      if (key.trim().toLowerCase() === 'source') {
        let text
        if(_.isString(value[0])){
          text = value[0]
        }else if(_.isObject(value[0]) && value[0]['_']){
          text = value[0]['_']
        }

        if (_.isNil(text) || /\{|\}/.test(text)) {
        }else{
          if(_.isString(text))
          text = _.trim(text)
          JsonObj[`${text}`] = "1"
        }

      }else if(_.isObject(value) || _.isArray(value)){
        getSource(value)
      }
      
    })
  }
  getSource(xlfObj)
  return JsonObj
}

/**
 * Get different part of two file
 * @param {string} origin The source of the .xlf file, as a string
 * @param {string} compare The compare of the .xlf file, as astring
 */

function getDif(origin, compare) {
  return bluebird.all([xml2js.parseStringAsync(origin),xml2js.parseStringAsync(compare)])
  .then( parsedXlfArr=> {
    const originJson = handleJson(parsedXlfArr[0]);
    const compareJson = handleJson(parsedXlfArr[1]);
    const difObj = {}
    _.forOwn(originJson,(value,key) => {
      if(!compareJson[`${key}`]){
        difObj[`${key}`] = ""
      }
    })
    return JSON.stringify(difObj)
  })
}


module.exports = getDif