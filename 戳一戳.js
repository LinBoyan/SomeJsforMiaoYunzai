export class chuochuo extends plugin {
    constructor() {
        super({
            name: "主动戳一戳",
            dsc: "主动戳一戳，供群聊使用，适配shamrock",
            event: "message",
            priority: 4096,
            rule: [
                {
                    reg: "^#?((戳一戳)|(比心)|(点赞)|(心碎)|(666)|(放大招))([1-6])?(强度)?([1-5])?$",
                    fnc: "chuochuo"
                }
            ]
        })
    }
    async chuochuo(e){
        let chuo_type = 1
        if(e.msg.match(/^#?戳一戳([1-6])/))
            chuo_type = e.msg.replace(/(强度)([1-5])/,"").replace(/#?戳一戳/,"")
        else if(e.msg.match(/比心/))
            chuo_type = 2
        else if(e.msg.match(/点赞/))
            chuo_type = 3
        else if(e.msg.match(/心碎/))
            chuo_type = 4
        else if(e.msg.match(/666/))
            chuo_type = 5
        else if(e.msg.match(/放大招/))
            chuo_type = 6

        let chuo_strength = 3
        if(e.msg.match(/强度/))
            chuo_strength = e.msg.replace(/^#?((戳一戳)|(比心)|(点赞)|(心碎)|(666)|(放大招))([1-6])?(强度)/,"")
        await this.reply({type: "poke", id: chuo_type, strength: chuo_strength}) || this.reply(segment.poke(chuo_type))
        return;
    }
}