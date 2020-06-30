
/**
 * 该npm包现主要实现以下的功能:
 * 1.读取angular8官方的xlf翻译文件与已经翻译完的目标语言xlf文件
 * 2.分析两文件之间的差别，找出新增的翻译部分
 * 3.将新增的差异部分提取出来
 * 
 * 后续===>
 * 1.给已翻译的部分打上标记
 */ 

const path = require('path');
const chalk = require('chalk');
const bluebird = require('bluebird');
const moment = require('moment');
const fs = bluebird.promisifyAll(require('fs'));
const log = require('./log')     
const getDif = require('./getDif')


// the command line interface
const argv = require('yargs')
  .usage(
    'Get translate added property values in an .xlf file and the target language'
  )
  .example(
    'distinTrans --in messages.xlf --target messages.th.xlf --out message.dif.json',
    'Get diffent from en to th'
  )
  .example(
    'distinTrans -i messages.xlf -t messages.th.xlf -o message.dif.json',
    'Get diffent from en to th'
  )
  .option('i',{
    alias:'in',
    demand:true,
    describe: 'The input .xlf origin file to compare',
    type: 'string'
  })
  .option('t', {
    alias: 'target',
    demand: true,
    describe: 'The input .xlf target file to compare',
    type: 'string'
  })
  .option('o', {
    alias: 'out',
    demand: true,
    describe: 'The name of the different output file',
    type: 'string'
  }).argv

  // start a timer so that we cam
  // report how long the whole process took
  const startTime = Date.now()   

  bluebird.all([fs.readFileAsync(path.resolve(argv.in)),fs.readFileAsync(path.resolve(argv.target))])
  .then(xlfArr=>{
    const originFile = xlfArr[0]
    const compareFile = xlfArr[1]
    return getDif(originFile,compareFile)
    
  })
  .then(targetStr => {
    return fs.writeFileAsync(path.resolve(argv.out), targetStr);
  })
  .then(() => {
    const endTime = Date.now();
      log(
        chalk.green('✓') +
          ' Finished analysis ' +
          (endTime - startTime) +
          'ms.'
      );
  })
  .catch(err => {
    log(
      chalk.red('X') +
      ' Something went wrong while translating ' +
      argv.in +
      '!'
    );
    log('' + err.stack);
  })

