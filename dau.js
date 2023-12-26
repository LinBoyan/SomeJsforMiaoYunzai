import fs from 'fs'
import yaml from 'yaml'

const groupPath = './plugins/example/group_id.yaml'
const userPath = './plugins/example/user_id.yaml'
const days = 7

let data
data = fs.readFileSync(userPath, 'utf8');
let user_list = yaml.parse(data) || {};
data = fs.readFileSync(groupPath, 'utf8');
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
                    reg: "^#?dau$",
                    fnc: "dau_read",
                },
                {
                    reg: "",
                    fnc: "dau_write",
                    log: false
                },
            ]
        })
    }
    async dau_write (e){
      if(e.adapter != 'QQBot' )
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
            console.log(user_list)
            yamlString = yaml.stringify(user_list);
            fs.writeFileSync(userPath, yamlString, 'utf8');
        }
        if (!group_list[today].includes(e.group_id)) {
            group_list[today].push(e.group_id);
            console.log(group_list)
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
        const xDaysAgo = new Date(new Date().getTime() - days * 24 * 60 * 60 * 1000).toLocaleDateString();
        let userCounts = {};
        for (const date in user_list) {
            if (date >= xDaysAgo) {
                userCounts[date] = `${user_list[date].length}人 ${group_list[date].length}群`;
                user_sum += user_list[date].length
                group_sum += group_list[date].length
                day++
            }
          }
        e.reply(`${yaml.stringify(userCounts)}\n${day}日平均：${Math.floor(user_sum/day)}人 ${Math.floor(group_sum/day)}群`)
        this.dau_write(e)
    }
}
