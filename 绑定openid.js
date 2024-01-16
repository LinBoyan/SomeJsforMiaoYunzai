let form = {}
import fs from 'fs'
import yaml from 'yaml'
const authors = ['岩浆']
const rootPath = `./plugins/example` 
const folderPath = `${rootPath}/QQBotRelation`  //数据存放路径

export class OpenIdtoId extends plugin {
  constructor () {
    super({
      name: '绑定qq号',
      dsc: '复读用户发送的内容，然后撤回',
      event: 'message',
      priority: 11,
      rule: [
        {
          reg: '^#?(id|ID)绑定',
          fnc: 'writeOpenid'
        },
        {
          reg: '^#?身份查询',
          fnc: 'transformer'
        },
        {
          reg: '^#?用户数量',
          fnc: 'transformerCounter'
        },
      ]
    })
  }

  async transformerCounter (e) {
    const filePath = `${folderPath}/${e.self_id}.yaml`
    if (fs.existsSync(filePath))
      form = yaml.parse(fs.readFileSync(filePath, 'utf8'))
    let count = 0;
    for (var User in form)
      count++
    this.reply(`收录用户数: ${count}`)
    return
  }
  async transformer (e) {
    const filePath = `${folderPath}/${e.self_id}.yaml`
    let search_id  = e.msg.replace(/^#?身份查询/,'').replace(/ /g, '')
    if (search_id == '') 
      search_id = e.user_id
    if (fs.existsSync(filePath))
      form = yaml.parse(fs.readFileSync(filePath, 'utf8'))
    let openid
    if (search_id.match(`${e.self_id}-`)) {
      if(form[search_id]?.qq)
        openid = search_id
    }
    else {
      for (let User in form)
        if (form[User].qq == (+search_id))
          openid = User
    }
    if (openid == undefined) 
      this.reply(`暂未收录`)
    else 
      this.reply([`\r#查询结果\r\r>QQ: ${form[openid].qq}\r\r>昵称: ${form[openid].nickname}\r\rUserID: ${openid}\r头像: `,segment.image(`http://q.qlogo.cn/headimg_dl?dst_uin=${form[openid].qq}&spec=640&img_type=jpg`)])
    return
  }

  async writeOpenid (e) {
    const filePath = `${folderPath}/${e.self_id}.yaml`
    if (fs.existsSync(filePath))
      form = yaml.parse(fs.readFileSync(filePath, 'utf8'))
    else 
      fs.mkdirSync(folderPath, { recursive: true })
    let nickname = e.msg.replace(/^#?(id|ID)绑定/,'').replace(/ /,'').replace(/^\d+/,'')
    const qq = e.msg.replace(/^#?(id|ID)绑定/,'').replace(/ /,'').replace(`${nickname}`,'')
    if (qq == ''){
      this.reply(`请输入qq号和昵称`)
      return
    }
    form[e.user_id] = {}
    form[e.user_id].qq = qq
    form[e.user_id].nickname = nickname
    fs.writeFileSync(filePath, yaml.stringify(form), 'utf8')
    IdtoQQ[e.self_id] = form
    await this.reply(`绑定成功！如需更换绑定信息，重新绑定即可`)
    e.msg = `#身份查询${e.user_id}`
    this.transformer (e)
  }
}

export let IdtoQQ = {}
