import plugin from "../../lib/plugins/plugin.js";
import common from "../../lib/common/common.js";
export class countdown extends plugin {
    constructor() {
        super({
            name: "countdown",
            dsc: "设置倒计时",
            event: "message",
            priority: 4096,
            rule: [
                {
                    reg: "^#(.*)(小时)?(.*)(分钟)?后叫我(.*)",
                    fnc: "countdown"
                }
            ]
        })
    }
    async call(e,action){
    
        await e.reply(`时间到啦！${action}!`, true, { at: true })
    }
    async countdown(e){
    
        let minute = e.msg.match(/\d+分钟/) || 0
        minute = parseInt(minute)

        let hour = e.msg.match(/\d+小时/) || 0
        hour = parseInt(hour)

        let delay = (hour*60 + minute)*60*1000

        let action = e.msg.replace(/#(.*)(小时)?(.*)(分钟)?后叫我/,"")

        await this.e.reply(`好的，${hour}小时${minute}分钟后叫你${action}`, true, { at: true })
        setTimeout(this.call,delay,e,action)
    }
}