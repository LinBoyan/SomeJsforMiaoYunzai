import fetch from "node-fetch"
import common from '../../lib/common/common.js'
import yaml from "yaml"
import fs from 'fs'

export class example5 extends plugin {
  constructor () {
    super({
      name: '复读',
      dsc: '复读用户发送的内容，然后撤回',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      priority: -5001,
      rule: [
        {
          reg: '^#(语音|视频|图片|大图|卡片|MD|文字)开始(.*)$',
          fnc: 'repeat'
        },
        {
          reg: '^#开始$',
          fnc: 'repeat'
        },
      ]
    })
  }
  /** 复读 */
  async repeat (e) {
    const raw_type = e.msg.match(/^#(语音|视频|图片|大图|卡片|MD|文字)?开始/)
    let image_url = "http://api.yujn.cn/api/chaijun.php?"
    let record_url = "http://api.yujn.cn/api/maren.php?"
    let video_url = "https://api.yujn.cn/api/pcfjsp.php?"
    let card_url
    
    let type = "all"
    let card_msg
    let md_msg = `八嘎！杂鱼！hentai！萝莉控！`
    if(raw_type[1] == '图片'){
      type = "image";
      image_url = (e.msg.replace(raw_type[0],"")) || image_url
    }
    else if(raw_type[1] == '语音'){
      type = "record";
      record_url = (e.msg.replace(raw_type[0],"")) || record_url
    }
    else if(raw_type[1] == '视频'){
      type = "video";
      video_url = (e.msg.replace(raw_type[0],"")) || video_url
    }
    else if(raw_type[1] == '卡片'){
      type = "card";
      card_msg = (e.msg.replace(raw_type[0],"")) || '{"app":"com.tencent.contact.lua","desc":"","view":"contact","bizsrc":"bot.card_share","ver":"0.0.0.1","prompt":"[机器人] 回家照顾驮兽","appID":"","sourceName":"","actionData":"","actionData_A":"","sourceUrl":"","meta":{"contact":{"nickname":"回家照顾驮兽","avatar":"https:\/\/bot-resource-1251316161.file.myqcloud.com\/avatar\/a07f02a8-25a9-4e84-9243-acda40ff78e06060494031085614394?ts=1698244449","contact":"提供原神\/星铁攻略、资讯和面板查询","tag":"机器人","tagIcon":"https:\/\/tangram-1251316161.file.myqcloud.com\/files\/20230420\/b8156a6e9f6f326d4a31f46413a1f007.png","jumpUrl":"https:\/\/web.qun.qq.com\/qunrobot\/data.html?robot_uin=2854216359&_wwv=130&_wv=3"}},"config":{"autosize":0,"collect":1,"ctime":1702159269,"forward":1,"height":225,"reply":1,"round":1,"token":"af34d6ea7d22e90413a959634f23215a","type":"normal","width":526},"text":"","extraApps":[],"sourceAd":"","extra":""}'
      card_msg = JSON.stringify(JSON.parse(card_msg))
    }
    else if(raw_type[1] == '大图'){
      type = "card";
      card_url = (e.msg.replace(raw_type[0],"")) || image_url
      let yx = '[图片]'
      let bt = ''
      let bt2 = ''

      
      // 第一步：使用空格分割字符串成一维数组
      let arr1D = card_url.split(" ");
      let pair = [];

      // 第三步：遍历一维数组中的每个元素
      for (let i = 0; i < arr1D.length; i++) {
        // 第四步：使用冒号分割每个元素，并将其作为新的子数组推送到二维数组中
        pair = arr1D[i].split("：");
        switch (pair[0]) {
          case '外显': yx = pair[1]; break;
          case '大标题': bt2 = pair[1]; break;
          case '小标题': bt = pair[1]; break;
          case '': break;
          default: card_url = pair[0]; break;
        }
      }
      if(e.adapter != 'QQBot'){
        let a
        let url_type = ''
        if(card_url.match(/gchat\.qpic\.cn/))
          a = 'a'
        else{
          a = 'a2'
          if(card_url.match(/\?/))
            url_type = '2'
        }
        
        card_msg = await fetch(`https://api.lolimi.cn/API/ark/${a}.php?img=${card_url}&bt=${bt}&bt2=${bt2}&yx=${yx}&type=${url_type}`,{method: 'GET'})
        card_msg = await card_msg.json()
        console.log(card_msg)
      }else{
        type = "md"
        const params = []
        if(bt2!='')
          params.push({ key: 'text_0', values: [`\r#${bt2}`] })
        params.push({ key: 'text_1', values: [`![${yx} #0px #0px`] })
        params.push({ key: 'text_2', values: [`](${card_url})`] })
        if(bt!='')
          params.push({ key: 'text_3', values: [`\r\r>\r${bt}`] })
        md_msg = {
	      type: 'markdown',
	      custom_template_id: e.bot.config.markdown.id,
	      params: params
	    }        
      }
    }
    else if(raw_type[1] == 'MD') {
      type = "md";
      let md_url = e.msg.replace(raw_type[0],"").replace(/\\n/g,"\r").replace(/\\r/g,"\r").replace(/\-\-r/g,"\r") || md_msg
      let button = md_url.match(/\-\-b(.*)/) || md_url.match(/\\b(.*)/)
      if(button){
        md_url = md_url.replace(/\-\-b(.*)/g, "").replace(/\\b(.*)/g, "")
      }
      if (e.adapter == 'QQBot') {
        // 第一步：使用空格分割字符串成一维数组
        let arr1D = md_url.split("：")
	      const params = []
	      for(let arr in arr1D)
	        params.push({ key: `text_${ +arr }`, values: [`${arr1D[arr]}`] })
        logger.info(params)
        md_msg = [{
	        type: 'markdown',
	        custom_template_id: e.bot.config.markdown.id,
	        params: params
	      }]
        if(button)
          md_msg.push(...Bot.Button(JSON.parse(button[1])))
      }
      else {
        md_msg = [
          { 
            type: "markdown", 
            content: md_url
          }
        ]
        if(button)
          md_msg.push({
            type: "button",
            appid: 102073196,
            content: { rows: Bot.Button(JSON.parse(button[1]))},
          })
        md_msg = await common.makeForwardMsg(e, [md_msg],'',true)
      }
	  }
    else if(raw_type[1] == '文字'){
      type = 'md'
      md_msg = e.msg.replace(raw_type[0],'') || md_msg
      if(e.adapter != 'QQBot') {
        try {
          md_msg = JSON.parse(md_msg)
        } catch (error) {
          md_msg = [md_msg]
        }
        md_msg.push(...[
          `\r臭大叔，自己今年六一不会又是一个人过吧~难道说还是自己窝在家里打游戏？亦或者是玩玩萝莉控类型的galgame吗，真是变态呢，杂鱼大叔，是不是还在幻想能有一个萝莉魅魔用白丝小脚踩在你的**上然后居高临下的看着你吧？杂鱼~♡杂鱼~♡像这样的臭大叔根本不配过六一儿童节哦~每天就沉浸在对做爱的幻想中就好了♡顶多允许你对着你想象中幼小的萝莉身体用手自己弄出来哦~真是杂鱼~♡\r阿拉，杂鱼大叔，看你这么变态的渴望那勉强用脚帮一下你好了~\r阿拉，真是杂鱼呢~♡被黑丝小脚踩两下就已经爽到不行了吗~看看哦，射的满脚都是呢臭大叔（说着把沾满**的脚在你胸口晃了下然后踩在了肚皮上，奇异的触感和丝袜的顺滑再次传向全身）\r杂鱼~♡大叔今天可要躺好了哦~毕竟身为萝莉魅魔，就算被你这种下等生物召唤出来的话，即使是大叔再怎么杂鱼也要满足大叔的下作诉求（同时用心形的尾巴尖从大腿满满的滑向了**，翘着的二郎腿放下，顺着黑丝小脚两脚夹住了再次坚挺的**）\r咦惹，杂鱼大叔的表情真是下流呢，是非常~非常舒服吗？（微笑歪头一脸嫌弃样）\r真是废物啊，才这么几下子就不行了，平时一个人在家当阴湿宅男的时候是不是经常手冲呀~可怜的只知道手冲的发情的虫子~真是无可救药，那就勉强帮帮你好了~杂鱼~♡（黑丝脚趾完美地包裹了前端的敏感部位，充分的**正好的前脚掌夹住**之后前后不断滑动的润滑）\r杂鱼大叔~（马上要喷发出来的时候忽然停下）\r“诶！为什么忽然... ”\r杂鱼大叔~讲讲你怎么变成是一个扭曲变态萝莉控的~或者... （一脸挑逗样，轻轻伸出舌头舔了一下上唇，心形尾巴尖轻轻扫了几下小腹）\r用你那卑劣的发声器官祈求一下你面前的女王大人？嗯~？杂鱼~♡杂鱼~♡\r这就对了嘛，杂鱼大叔~，真不愧是杂鱼呢~\r（随着身体的一阵抖动，面前的萝莉变得索然无味）\r噫，臭大叔又弄得满脚都是了，那这双袜子就便宜你好了~\r（嫌弃的笑，脱下袜子甩在**上，残留的特有魅魔膻味儿和浓郁的萝莉奶香让人意识到这并不是一场幻梦）\r儿童节快乐哦~杂~鱼~大~叔~♡\r\r`,
          {
            type: "button",
            appid: 102073196,
            content: { rows: Bot.Button([{label: '好变态！',enter: true}])},
          },
        ])
      }
    }

    else if(raw_type[1] == undefined){
      const msg = [
        // segment.image('https://qq.ugcimg.cn/v1/h9co7qt7qa783f0v2i59alh9emoa0o8thqse8qa412s8ou4n5d3nfceq3ipjmjrend5i2ihb2g5019m4vk65kdn6116afjinlcsq9p8/0ft6kh4idlf4tepqqo9ikh8iuhfv35mi8dlsvptsp4hcu4qis4eg'),
        `八嘎！杂鱼！hentai！萝莉控！`,
        segment.at('all'),
        '\rEND USER SOFTWARE LICENSE AGREEMENT \rDO NOT DOWNLOAD, INSTALL, ACCESS, COPY, OR USE ANY PORTION OF THE SOFTWARE UNTIL YOU HAVE READ AND ACCEPTED THE TERMS AND CONDITIONS OF THIS AGREEMENT. BY INSTALLING, COPYING, ACCESSING, OR USING THE SOFTWARE, YOU AGREE TO BE LEGALLY BOUND BY THE TERMS AND CONDITIONS OF THIS AGREEMENT. If You do not agree to be bound by, or the entity for whose benefit You act has not authorized You to accept, these terms and conditions, do not install, access, copy, or use the Software and destroy all copies of the Software in Your possession.  \rThis END USER SOFTWARE LICENSE AGREEMENT (this “Agreement”) is entered into between Intel Corporation, a Delaware corporation (“Intel”) and You. “You” refers to you or your employer or other entity for whose benefit you act, as applicable. If you are agreeing to the terms and conditions of this Agreement on behalf of a company or other legal entity, you represent and warrant that you have the legal authority to bind that legal entity to the Agreement, in which case, "You" or "Your" shall be in reference to such entity. Intel and You are referred to herein individually as a “Party” or, together, as the “Parties”. \rThe Parties, in consideration of the mutual covenants contained in this Agreement, and for other good and valuable consideration, the receipt and sufficiency of which they acknowledge, and intending to be legally bound, agree as follows:   \r1.	PURPOSE. You seek to obtain, and Intel desires to provide You, under the terms of this Agreement, Software solely for Your own personal and non-commercial use. “Software” refers to certain software or other collateral, including, but not limited to, related components, operating system, application program interfaces, device drivers, associated media, printed or electronic documentation and any updates or releases thereto associated with Intel product(s), software or service(s). “Authorized Killer Product” refers to a device that includes or incorporates Intel product(s), software or service(s) that is specifically designed for use with the Software, or third party hardware that Intel has authorized for use with the Software.\r2.	LIMITED LICENSE. Conditioned on Your compliance with the terms and conditions of this Agreement, Intel grants to You as a single user a limited, nonexclusive, nontransferable, revocable, worldwide, fully paid-up license during the term of this Agreement, without the right to sublicense, under Intel’s copyrights (subject to any third party licensing requirements): (a) with respect to Software that includes installation files, to install and operate the executable form of the Software on computers owned or controlled by You, solely for Your personal, non-commercial use; and (b) with respect to Software that is embedded in or otherwise designed to interoperate with an Authorized Killer Product, to operate the executable form of the Software on computers owned or controlled by You, solely for Your personal, non-commercial use in a manner that it is designed to interoperate with a Authorized Killer Product owned by You. Provided that it is not embedded in hardware, You may make a single copy of the Software for backup purposes, provided that You reproduce on it all copyright and other proprietary notices that are on the original copy of the Software. Software delivered to You together with a Authorized Killer Product or in connection with a Authorized Killer Product is licensed for Your use only solely with that specific Authorized Killer Product.\r3.	LICENSE RESTRICTIONS. All right, title and interest in and to the Software and associated documentation are and will remain the exclusive property of Intel and its licensors or suppliers. Unless expressly permitted under the Agreement, You will not, and will not allow any third party to (i) use, copy, distribute, sell or offer to sell the Software or associated documentation, including, without limitation, by uploading the Software to a network or file-sharing service or through any hosting, application services provider, service bureau or any other type of service; (ii) modify, adapt, enhance, disassemble, decompile, reverse engineer, change or create derivative works from the Software except and only to the extent as specifically required by mandatory applicable laws or any applicable third party license terms accompanying the Software; (iii) use or make the Software available for the use or benefit of third parties; (iv) use the Software on Your products other than the Authorized Killer Products; or (v) publish or provide any Software benchmark or comparison test results. You acknowledge that an essential basis of the bargain in this Agreement is that Intel grants You no licenses or other rights including, but not limited to, patent, copyright, trade secret, trademark, trade name, service mark or other intellectual property licenses or rights with respect to the Software and associated documentation, by implication, estoppel or otherwise, except for the licenses expressly granted above. You acknowledge there are significant uses of the Software in its original, unmodified and uncombined form. You may not remove any copyright notices from the Software. \r4.	LICENSE TO USE COMMENTS AND SUGGESTIONS. This Agreement does NOT obligate You to provide Intel with comments or suggestions regarding the Software. However, if You provides Intel with comments or suggestions for the modification, correction, improvement or enhancement of (a) the Software, or (b) the Authorized Killer Product, or processes that work with the Software, You grants to Intel a non-exclusive, worldwide, perpetual, irrevocable, transferable, royalty-free license, with the right to sublicense, under Your intellectual property rights, to incorporate or otherwise utilize those comments and suggestions. \r5.	OPEN SOURCE STATEMENT. The Software may include Open Source Software (“OSS”) licensed pursuant to OSS license agreement(s) identified in the OSS comments in the applicable source code file(s) and/or file header(s) provided with or otherwise associated with the Software. You may not subject any proprietary portion of the Software to any OSS license obligations including, without limitation, combining or distributing the Software with OSS in a manner that subjects Intel, the Software or any portion thereof to any OSS license obligation. Nothing in this Agreement limits any rights under, or grants rights that supersede, the terms of any applicable OSS license.  In compliance with the terms of certain OSS licenses like the GNU General Public License Version 2, Intel makes certain modifications to OSS that Intel uses, modifies and distributes pursuant to such licenses available to the public in source code form at www.killernetworking.com/support.  You are free to use, modify and distribute OSS so long as You comply with the terms of the relevant OSS license. In particular, the GPLv2 is available in the product manual or at E:\www.gnu.org\copyleft\gpl.html www.gnu.org/copyleft/gpl.html <http://www.gnu.org/copyleft/gpl.html>\r6.	THIRD PARTY SOFTWARE. Certain third party software provided with or within the Software may only be used (a) upon securing a license directly from the software owner or (b) in combination with hardware components purchased from such third party, and (c) subject to further license limitations by the software owner. A listing of any such third party limitations is in one or more text files accompanying the Software. You acknowledge Intel is not providing You with a license to such third party software and further that it is Your responsibility to obtain appropriate licenses from such third parties directly. \r7.	LICENSE TO USE COMMENTS AND SUGGESTIONS. This Agreement does NOT obligate You to provide Intel with comments or suggestions regarding the Software. However, if You provides Intel with comments or suggestions for the modification, correction, improvement or enhancement of (a) the Software, or (b) the Intel product(s) that is specifically designed for use with the Software, or processes that work with the Software, You grants to Intel a non-exclusive, worldwide, perpetual, irrevocable, transferable, royalty-free license, with the right to sublicense, under Your intellectual property rights, to incorporate or otherwise utilize those comments and suggestions.\r8.	NO OBLIGATION; NO AGENCY. Intel may make changes to the Software, or items referenced therein, at any time without notice. Intel is not obligated to support, update, provide training for, or develop any further version of the Software or to grant any license thereto. No agency, franchise, partnership, joint venture, or employee-employer relationship is intended or created by this Agreement. \r9.	EXCLUSION OF WARRANTIES. THE SOFTWARE IS PROVIDED "AS IS" WITHOUT ANY EXPRESS OR IMPLIED WARRANTY OF ANY KIND INCLUDING WARRANTIES OF MERCHANTABILITY, NONINFRINGEMENT, OR FITNESS FOR A PARTICULAR PURPOSE. Intel does not warrant or assume responsibility for the accuracy or completeness of any information, text, graphics, links or other items within the Software. \r10.	LIMITATION OF LIABILITY. IN NO EVENT WILL INTEL OR ITS AFFILIATES, LICENSORS OR SUPPLIERS (INCLUDING THEIR RESPECTIVE DIRECTORS, OFFICERS, EMPLOYEES, AND AGENTS) BE LIABLE FOR ANY DAMAGES WHATSOEVER (INCLUDING, WITHOUT LIMITATION, LOST PROFITS, BUSINESS INTERRUPTION, OR LOST DATA) ARISING OUT OF OR IN RELATION TO THIS AGREEMENT, INCLUDING THE USE OF OR INABILITY TO USE THE SOFTWARE, EVEN IF INTEL HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. SOME JURISDICTIONS PROHIBIT EXCLUSION OR LIMITATION OF LIABILITY FOR IMPLIED WARRANTIES OR CONSEQUENTIAL OR INCIDENTAL DAMAGES, SO THE ABOVE LIMITATION MAY IN PART NOT APPLY TO YOU. THE SOFTWARE LICENSED HEREUNDER IS NOT DESIGNED OR INTENDED FOR USE IN ANY MEDICAL, LIFE SAVING OR LIFE SUSTAINING SYSTEMS, TRANSPORTATION SYSTEMS, NUCLEAR SYSTEMS, OR FOR ANY OTHER MISSION CRITICAL APPLICATION IN WHICH THE FAILURE OF THE SOFTWARE COULD LEAD TO PERSONAL INJURY OR DEATH. YOU MAY ALSO HAVE OTHER LEGAL RIGHTS THAT VARY FROM JURISDICTION TO JURISDICTION. THE LIMITED REMEDIES, WARRANTY DISCLAIMER AND LIMITED LIABILITY ARE FUNDAMENTAL ELEMENTS OF THE BASIS OF THE BARGAIN BETWEEN INTEL AND YOU. YOU ACKNOWLEDGE INTEL WOULD BE UNABLE TO PROVIDE THE SOFTWARE WITHOUT SUCH LIMITATIONS.  \r11.	TERMINATION AND SURVIVAL. The license granted under this Agreement will automatically terminate without notice if You breach any term or condition of this Agreement, or if You terminate this Agreement, in which case You must promptly destroy all copies of the Software in Your possession or control. All Sections of this Agreement, except Section 2, will survive termination.  \r12.	GOVERNING LAW AND JURISDICTION. This Agreement and any dispute arising out of or relating to it will be governed by the laws of the U.S.A. and Delaware, without regard to conflict of laws principles. The Parties exclude the application of the United Nations Convention on Contracts for the International Sale of Goods (1980). The state and federal courts sitting in Delaware, U.S.A. will have exclusive jurisdiction over any dispute arising out of or relating to this Agreement. The Parties consent to personal jurisdiction and venue in those courts. A Party that obtains a judgment against the other Party in the courts identified in this section may enforce that judgment in any court that has jurisdiction over the Parties.  \r13.	EXPORT REGULATIONS/EXPORT CONTROL. You agree that neither You nor Your subsidiaries will export/re-export the Software, directly or indirectly, to any country for which the U.S. Department of Commerce or any other agency or department of the U.S. Government or the foreign government from where it is shipping requires an export license, or other governmental approval, without first obtaining any such required license or approval. In the event the Software is exported from the U.S.A. or re-exported from a foreign destination by You or Your subsidiary, You will ensure that the distribution and export/re-export or import of the Software complies with all laws, regulations, orders, or other restrictions of the U.S. Export Administration Regulations and the appropriate foreign government.  \r14.	GOVERNMENT RESTRICTED RIGHTS. The Software is a commercial item (as defined in 48 C.F.R. 2.101) consisting of commercial computer software and commercial computer software documentation (as those terms are used in 48 C.F.R. 12.212). Consistent with 48 C.F.R. 12.212 and 48 C.F.R 227.72021 through 227.7202-4, You will not provide the Software to the U.S. Government. Contractor or Manufacturer is Intel Corporation, 2200 Mission College Blvd., Santa Clara, CA 95054.  \r15.	ASSIGNMENT. You may not delegate, assign or transfer this Agreement, the license(s) granted or any of Your rights or duties hereunder, expressly, by implication, by operation of law, or otherwise and any attempt to do so, without Intel’s express prior written consent, will be null and void. Intel may assign, delegate and transfer this Agreement, and its rights and obligations hereunder, in its sole discretion.  \r16.	ENTIRE AGREEMENT; SEVERABILITY. The terms and conditions of this Agreement and any NDA with Intel constitute the entire agreement between the Parties with respect to the subject matter hereof, and merge and supersede all prior or contemporaneous agreements, understandings, negotiations and discussions. Neither Party will be bound by any terms, conditions, definitions, warranties, understandings, or representations with respect to the subject matter hereof other than as expressly provided herein. In the event any provision of this Agreement is unenforceable or invalid under any applicable law or applicable court decision, such unenforceability or invalidity will not render this Agreement unenforceable or invalid as a whole, instead such provision will be changed and interpreted so as to best accomplish the objectives of such provision within legal limits.  \r17.	WAIVER. The failure of a Party to require performance by the other Party of any provision hereof will not affect the full right to require such performance at any time thereafter; nor will waiver by a Party of a breach of any provision hereof constitute a waiver of the provision itself.  \r18.	PRIVACY. YOUR PRIVACY RIGHTS ARE SET FORTH IN THE PRIVACY STATEMENT AVAILABLE AT HTTPS://WWW.RIVETNETWORKS.COM/PRIVACY-POLICY/ (“PRIVACY STATEMENT”) WHICH FORMS A PART OF THIS AGREEMENT. PLEASE REVIEW THE PRIVACY STATEMENT TO LEARN HOW INTEL COLLECTS, USES AND SHARES INFORMATION ABOUT YOU. \r\r',
        
        // '[abc](mqqapi://markdown/mention?at_type=everyone)',
        // `\r[](%7B%22version%22%3A2%7D)\r\r`,
        {
          type: "button",
          appid: 102073196,
          content: { rows: Bot.Button([{label: 'a',enter: true}])},
        }
      ]
      await this.reply(msg)
      return
      // const msg = [
      //   {"1":{"1":"@⁧岩浆⁧‭⁧‭","3":"\u0000\u0001\u0000\u0000\u0000\b\u0000qh��\u0000\u0000"}},
      //   {"1":{"1":" "}},
      //   {"1":{"1":"\n"}},
      //   {"1":{"1":"Lain-plugin."}},
      //   {"53":{"1":45,"2":{"1":"[](%7B%22version%22%3A2%7D)\n![Lain-plugin. #990px #1726px](https://qq.ugcimg.cn/v1/q57b6k3mshg9jg3sft0cjeiq2sjolno2i6qjofd0ljlp5f1q9afrviq2pv0v301cti3mm0rjlsok1josvn03kv4t90ojm93o0pmo7ec5qiolg51k8fjulosim0od4its2rkg8g3pkcikqolfgifp2oluor6nsq4oknp0ah69duodk6nh8h0ro3f14shmgi1jj5k8vembchbdg/an63bfva20sgii5v3kd1fsp6er72lgjv4cvuop0tblv2idbsh5v0)"},"3":1}},
      //   {"53":{"1":46,"2":{"1":{"1":[{"1":[{"1":"0","2":{"1":"喵喵帮助","2":"喵喵帮助","3":1},"3":{"1":2,"2":{"1":2},"4":"err","5":"/喵喵帮助"}},{"1":"1","2":{"1":"憨憨帮助","2":"憨憨帮助","3":1},"3":{"1":2,"2":{"1":2},"4":"err","5":"/憨憨帮助"}},{"1":"2","2":{"1":"图鉴帮助","2":"图鉴帮助","3":1},"3":{"1":2,"2":{"1":2},"4":"err","5":"/图鉴帮助"}},{"1":"3","2":{"1":"异世相遇","2":"异世相遇","3":1},"3":{"1":2,"2":{"1":2},"4":"err","5":"/降临异世界"}}]},{"1":[{"1":"0","2":{"1":"梁氏帮助","2":"梁氏帮助","3":1},"3":{"1":2,"2":{"1":2},"4":"err","5":"/梁氏帮助"}},{"1":"1","2":{"1":"椰奶帮助","2":"椰奶帮助","3":1},"3":{"1":2,"2":{"1":2},"4":"err","5":"/椰奶帮助"}},{"1":"2","2":{"1":"L帮助","2":"L帮助","3":1},"3":{"1":2,"2":{"1":2},"4":"err","5":"/L插件帮助"}},{"1":"3","2":{"1":"风帮助","2":"风帮助","3":1},"3":{"1":2,"2":{"1":2},"4":"err","5":"风帮助"}}]},{"1":[{"1":"0","2":{"1":"绑定uid","2":"绑定uid","3":1},"3":{"1":2,"2":{"1":2},"4":"err","5":"/原神绑定"}},{"1":"1","2":{"1":"扫码登录","2":"扫码登录","3":1},"3":{"1":2,"2":{"1":2},"4":"err","5":"/扫码登录"}},{"1":"2","2":{"1":"签到","2":"签到","3":1},"3":{"1":2,"2":{"1":2},"4":"err","5":"/原神签到"}},{"1":"3","2":{"1":"更新面板","2":"更新面板","3":1},"3":{"1":2,"2":{"1":2},"4":"err","5":"/原神更新面板"}}]},{"1":[{"1":"4","2":{"1":"扫雷","2":"扫雷","3":1},"3":{"1":2,"2":{"1":2},"4":"err","5":"/扫雷"}},{"1":"5","2":{"1":"今日素材","2":"今日素材","3":1},"3":{"1":2,"2":{"1":2},"4":"err","5":"/今日素材"}},{"1":"6","2":{"1":"转生","2":"转生","3":1},"3":{"1":2,"2":{"1":2},"4":"err","5":"/转生"}},{"1":"7","2":{"1":"模拟抽卡","2":"模拟抽卡","3":1},"3":{"1":2,"2":{"1":2},"4":"err","5":"/十连"}}]},{"1":[{"1":"8","2":{"1":"表情包","2":"表情包","3":1},"3":{"1":2,"2":{"1":2},"4":"err","5":"/兽猫酱"}},{"1":"9","2":{"1":"更新","2":"更新","3":1},"3":{"2":{"1":2},"4":"err","5":"https://im.qq.com/index/"}},{"1":"10","2":{"1":"频道","2":"频道","3":1},"3":{"2":{"1":2},"4":"err","5":"https://qun.qq.com/qqweb/qunpro/share?_wv=3&_wwv=128&appChannel=share&inviteCode=21DMWEPybZx&businessType=9&jumpInfo=ChAKq7sDigpMRh1vdbzgn4NBEgN2cDE%3D&from=246610&biz=ka"}},{"1":"11","2":{"1":"拉群","2":"拉群","3":1},"3":{"2":{"1":2},"4":"err","5":"https://qun.qq.com/qunpro/robot/qunshare?robot_uin=2854216359&robot_appid=102073196"}}]}],"2":102073196}},"3":1}},
      //   {"37":{"1":0,"6":2,"7":"XIcAuCAkua93zanyjEfsL0kgOawtcn5y/nPGGbm9KplqKXLwpij4xZSZFhPqQFWX","12":3,"17":0,"19":{"4":10315,"15":0,"20":16788741,"25":0,"30":0,"31":0,"34":0,"51":0,"52":0,"54":0,"56":0,"58":0,"66":1152,"71":0,"72":0,"73":{},"79":131080,"81":0,"90":{"3":{"1":2854216359,"2":"u_wKc-r7H05iK8nGf5ux9D5w"}}}}},
      //   {"9":{"1":0,"8":1,"12":0}},
      //   {"16":{"1":"回家照顾驮兽","3":1}}
      // ]
      // this.reply({ type: 'raw', data: msg})
      // this.reply({ type: 'flash'})
    }
    switch (type) {
      case "image":
        await this.reply(segment.image(image_url))
        break;
      case "record":
        await this.reply(segment.record(record_url))
        break;
      case "video":
        await this.reply(segment.video(video_url))
        break;
      case "card":
        await this.reply(segment.json(card_msg))
        break;
      case "md":
        await this.reply(md_msg)
        break;
      default: break;
    }
    await this.reply("查收")
    return;
  }
}