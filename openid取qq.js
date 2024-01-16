let form = {}
import fs from 'fs'
import yaml from 'yaml'
const authors = ['岩浆']
const folderPath = './plugins/example/' //数据存放路径
const prefix = '' //野生机器人前缀
const Delay_ms = 2000 //指令延时
const group = 514170328 //触发的群聊
const QQBot_qq = 2854216359 //官方机器人qq号

import { IdtoQQ} from './绑定openid.js'

export class OpenIdtoId extends plugin {
  constructor () {
    super({
      name: '取qq号',
      dsc: '复读用户发送的内容，然后撤回',
      event: 'message',
      priority: -1000011,
      rule: [
        {
          reg: '^#?开始转换(qq|QQ)号$',
          fnc: 'sendOpenid',
          permission: "master"
        },
        {
          reg: '^#?对应关系',
          fnc: 'writeOpenid'
        },
        {
          reg: '^#?启动对应转换',
          fnc: 'startOpenid'
        },
      ]
    })
    this.task = {
      name: '控制icqq发起转换',
      fnc: () => this.startOpenid(),
      cron: `0 2 * * *`
    }
  }

  async startOpenid () {
    Bot.pickGroup(group).sendMsg([segment.at(QQBot_qq),'开始转换qq号'])
  }

  async sendOpenid (e){
    await this.reply(`${prefix}对应关系发送开始${e.self_id}`)
    await sleep(Delay_ms)
    let today = new Date().getTime()
    today = new Date(today - 1 * 24 * 60 * 60 * 1000).toLocaleDateString()
    const data = fs.readFileSync(`${folderPath}user_id.yaml`, 'utf8')
    let user_list = yaml.parse(data)
    user_list = user_list[today]
    let msg = `${prefix}对应关系`
    let i = 0
    for (const openid of user_list){
      if(openid.match(`${e.self_id}-`)){
        msg = msg + `\r${openid}<@${openid.replace(`${e.self_id}-`,'')}>`
        i++
        if(i == 50){
          this.reply(msg)
          msg = `${prefix}对应关系`
          i = 0
          await sleep(Delay_ms)
        }
      }
    }
    await this.reply(msg)
    await sleep(Delay_ms)
    await this.reply(`${prefix}对应关系发送完成${e.self_id}`)
  }

  async writeOpenid (e) {
    if (e.msg.match(/对应关系发送开始/)){
      const Botid = e.msg.replace(/对应关系发送开始/,'')
      const filePath = `${folderPath}QQBotRelation`
      if (fs.existsSync(`${filePath}/${Botid}.yaml`))
        form = yaml.parse(fs.readFileSync(`${filePath}/${Botid}.yaml`, 'utf8'))
      else 
        fs.mkdirSync(filePath, { recursive: true })
      return
    }
    if (e.msg.match(/对应关系发送完成/)){
      logger.mark(form)
      const Botid = e.msg.replace(/对应关系发送完成/,'')
      IdtoQQ[Botid] = form
      const filePath = `${folderPath}QQBotRelation/${Botid}.yaml`
      fs.writeFileSync(filePath, yaml.stringify(form), 'utf8')
      this.reply(`写入对应关系${filePath}`)
      form = {}
      return
    }
    for (let openid = 1; openid < e.message.length; openid+=2) {
      let id = e.message[openid].text
      .replace(`对应关系`, '')
      .replace(`\r`, '')
      .replace(`\n`, '')
      .replace(` `, '')
      form[id] = {}
      form[id].qq = e.message[openid + 1].qq
      form[id].nickname = e.message[openid + 1].text.replace(/\@/, '')
    }
  }
}

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
