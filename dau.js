import fs from 'fs'
import yaml from 'yaml'

const groupPath = './plugins/example/group_id.yaml'
const userPath = './plugins/example/user_id.yaml'
const days = 7

let data = ''
if (fs.existsSync(userPath))
    data = fs.readFileSync(userPath, 'utf8');
else{
    fs.writeFileSync(userPath, data, 'utf8');
}
let user_list = yaml.parse(data) || {};
if (fs.existsSync(groupPath))
    data = fs.readFileSync(groupPath, 'utf8');
else{
    fs.writeFileSync(groupPath, data, 'utf8');
}
let group_list = yaml.parse(data) || {};

export class dau extends plugin {
    constructor() {
        super({
            name: "dau",
            dsc: "dau",
            event: "message",
            priority: -1000005,
            rule: [
                {
                    reg: "^#?(qqbot)?dau$",
                    fnc: "dau_read",
                },
                {
                    reg: "",
                    fnc: "dau_write",
                    log: false
                },
                {
                    reg: "^#?清理(过期)?(qqbot)?dau$",
                    fnc: "dau_cleanup",
                },
                {
                    reg: "^#?(查看)?主用户$",
                    fnc: "mainUserId",
                },
            ]
        })
        this.task = [
            {
                name: '清理过期dau',
                fnc: 'dau_cleanup',
                cron: `0 0 3 * * ?`
            }
        ]
    }
    async dau_cleanup() {
        const today = new Date().getTime()
        const xDaysAgo = []
        const user_list_temp = {}
        const group_list_temp = {}
        for(let i = days; i >= 0; i--) 
            xDaysAgo.push(new Date(today - i * 24 * 60 * 60 * 1000).toLocaleDateString())
        for (const date of xDaysAgo) {
            if (user_list[date]){
                if(date != xDaysAgo[days]){
                    user_list_temp[date] = user_list[date].length || user_list[date]
                    group_list_temp[date] = group_list[date].length || group_list[date]
                }else{
                    user_list_temp[date] = user_list[date]
                    group_list_temp[date] = group_list[date]
                }
            }
        }
        user_list = user_list_temp
        group_list = group_list_temp
        fs.writeFileSync(userPath, yaml.stringify(user_list), 'utf8')
        fs.writeFileSync(groupPath, yaml.stringify(group_list), 'utf8')
        try {
            await this.reply('清理完成')
        }catch(error){}
        return
    }

    async dau_write (e){
      if(e.adapter != 'QQBot' && e.adapter != 'QQGuild')
        return false
      else {
        const today = new Date().toLocaleDateString(); // 获取今天的日期

        if (!user_list[today]) {
            user_list[today] = [];
        }
        if (!group_list[today]) {
            group_list[today] = [];
        }

        let yamlString
        if (!user_list[today].includes(e.user_id)) {
            user_list[today].push(e.user_id);
            yamlString = yaml.stringify(user_list);
            fs.writeFileSync(userPath, yamlString, 'utf8');
        }
        let group_id
        group_id = e.guild_id || e.group_id
        console.log(group_id)
        if (!group_list[today].includes(group_id)) {
            group_list[today].push(group_id);
            yamlString = yaml.stringify(group_list);
            fs.writeFileSync(groupPath, yamlString, 'utf8');
        }
        
        return false
      }
    }

    async dau_read (e){
        let user_sum = 0;
        let group_sum = 0;
        let day = 0;
        const today = new Date().getTime()
        const xDaysAgo = []
        for(let i = days; i >= 0; i--) 
            xDaysAgo.push(new Date(today - i * 24 * 60 * 60 * 1000).toLocaleDateString())
        let userCounts = {};
        for (const date of xDaysAgo) {
            if (user_list[date]){
                userCounts[date] = `${user_list[date].length || user_list[date]}人 ${group_list[date].length || group_list[date]}群`;
                if(date != xDaysAgo[days]){
                    user_sum += user_list[date].length || user_list[date]
                    group_sum += group_list[date].length || group_list[date]
                    day++
                }
            }
        }
        e.reply(`${yaml.stringify(userCounts)}\n${day}日平均：${Math.floor(user_sum/day) || 0}人 ${Math.floor(group_sum/day) || 0}群`)
        this.dau_write(e)
    }

    mainUserId (e){
        if(e.mainUserId === undefined)
            this.reply(`尚未绑定到主用户或已是主用户。\n\n如需开始绑定流程，请向 已经绑定您的ck等信息的机器人 或使用 已经绑定您的ck等信息的QQ 发送 #绑定用户\n如需绑定uid等信息，请直接发送 #扫码登录 或 #原神绑定123456789`)
        else
            this.reply(`主用户：${e.mainUserId}`)
    }
}
