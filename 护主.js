import plugin from '../../lib/plugins/plugin.js'
export class ProtectOwner extends plugin {
  constructor () {
    super({
      name: '护主',
      dsc: '撤销对主人的禁言',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'notice.group.ban',
      priority: 3000
    })
  };
  async accept (e){
    if(this.e.isMaster)
    await e.group.muteMember(
        e.user_id, 0
      )
  }
}