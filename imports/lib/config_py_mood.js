const crypto = require("crypto")

const token = "74cebe8a8ceefff4e89635fdd8a92777bb4fd0c541d25a1a10c12f7a126b5b3f243aea19d48c40c0f5b5a8898142a28a69094567c70a2f5e371cc6ac0af90eae"
const digested = function(ts){
  return crypto.createHmac('sha256', token).update(ts).digest('hex').toUpperCase()
}

module.exports = {
  digested: digested,
}
