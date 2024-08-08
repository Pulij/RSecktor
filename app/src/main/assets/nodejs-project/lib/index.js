const { sck } = require(__dirname + '/database/group')
const { sck1 } = require(__dirname + '/database/user')
const { sck0 } = require(__dirname + '/database/private')
const { misc } = require(__dirname + '/database/misc')
const { marrynaxoi } = require(__dirname + '/database/marry')
const { warndb } = require(__dirname + '/database/warn')
const { stat } = require(__dirname + '/database/statistick')

module.exports = {
    sck,
    sck1,
    sck0,
    stat,
    misc,
    warndb,
    marrynaxoi
}