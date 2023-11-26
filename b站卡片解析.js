import fetch from "node-fetch"
const card = true //是否解析卡片
const base_duration = 60 //单位s，视频分辨率分级的基准。-1代表交给土块解析。0代表不分级，永远最高画质。默认值60s时，1分钟以内视频最高4K，3分钟以内1080p，5分钟以内720p，13分钟以上不解析
const cookie = "" //b站cookie，留空则最高360p，推荐via浏览器无痕模式获取
export class Bili_Down extends plugin {
    constructor() {
        super({
            //后端信息
            name: 'b站卡片解析',//插件名字，可以随便写
            dsc: '解析b站卡片信息',//插件介绍，可以随便写
            event: 'message',//这个直接复制即可，别乱改
            priority: 1144,//执行优先级：数值越低越6
            rule: [
                {
                    //正则表达式
                    reg: 'https://b23.tv/',
                    //函数
                    fnc: 'get_share_url',
                },
                {
                    reg: 'https://www.bilibili.com/video/BV',
                    fnc: 'get_bv',
                }
            ]
        })
    };

    //函数
    async get_share_url(e) {
        if (e.message[0].type == 'json' && card == true) {
            let obj = JSON.parse(e.message[0].data); // 解析JSON字符串
            // 提取jumpUrl内容
            let jumpUrl = obj.meta.news.jumpUrl;
            e.msg = jumpUrl
        }
        if(base_duration == -1)
            return false;   //交给土块
        else 
            this.get_bv(e)
    }
    async get_bv(e){
        if(base_duration == -1)
            return false;   //交给土块
        let bv = e.msg
        .match(/https:\/\/(\S+)/)
        bv = bv[0]
        if (bv.match((/https:\/\/b23\.tv\//))){
            bv = await fetch(bv)
            bv = bv.url
        }
        bv = bv.indexOf('?') !== -1 ? bv.substring(0, bv.indexOf('?')) : bv;
        bv = bv
        .replace(/https:\/\/www\.bilibili\.com\/video\/BV/,"")
        .replace(/\//, "")
        this.get_info(bv)
    }
    async get_info(bv){
        const response = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bv}`, {
            method: 'get',
            headers: {
              'Cookie': cookie,
              'Referer': 'https://www.bilibili.com/'
            }
          });
        const obj = await response.json();
        let cid = obj.data.cid
        let duration = obj.data.pages[0].duration
        this.get_video_url(bv, cid, duration)
    }
    async get_video_url(bv, cid, duration){
        duration = Math.floor(duration / base_duration)
        if(base_duration == 0) duration = 0
        this.reply(duration);
        let qn
        switch(duration){
        case 0: qn = 120; break;
        case 1: qn = 116; break;
        case 2: qn = 80; break;
        case 3: qn = 74; break;
        case 4: qn = 64; break;
        case 5:
        case 6: qn = 32; break;
        case 7: 
        case 8:
        case 9: qn = 16; break; 
        case 10:
        case 11:
        case 12: qn = 6; break;
        default: this.reply("太长了，去b站看吧"); return;
        }
        const response = await fetch(`https://api.bilibili.com/x/player/playurl?bvid=BV${bv}&cid=${cid}&qn=${qn}&fnval=129&fourk=1&type=mp4&platform=html5&high_quality=1`, {
            method: 'get',
            headers: {
              'Cookie': cookie,
              'Referer': 'https://www.bilibili.com/',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36'
            }
          });
        const obj = await response.json();
        let video_url = obj.data.durl[0].url
        this.reply(segment.video(video_url))
        return;
    }
}
