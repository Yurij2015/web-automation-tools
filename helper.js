const axios = require('axios')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const mobileOperators = [
  'mobile',
  'orange',
  'verizon',
  'vodafone',
  't-mobile',
  'at&t',
  'sprint',
  'telecom',
  'telstra',
  'play'
  // Add more known mobile operators as needed
]

async function isMobileIpAddress() {
  if (!process.env.IPINFO_TOKEN || !process.env.API_IPIFY_URL || !process.env.IPINFO_URL) {
    throw new Error('One or more environment variables are not defined');
  }
  try {
    const currentIp = await axios.get(process.env.API_IPIFY_URL)
    const ipData = currentIp.data

    console.log('IP Address:', ipData.ip)

    const ipDataFull = await axios.get(
      `${process.env.IPINFO_URL}/${ipData.ip}?token=${process.env.IPINFO_TOKEN}`
    )
    const ipInfo = ipDataFull.data

    console.log('IP Information:', ipInfo)

    const org = ipInfo.org ? ipInfo.org.toLowerCase() : ''
    const isMobile = mobileOperators.some((operator) => org.includes(operator))

    if (isMobile) {
      console.log('The IP address is a mobile IP.')
      return true
    } else {
      console.log(
        'The IP is not mobile. To work use mobile IP (connect via mobile network, e.g., mobile hotspot).'
      )
      return false
    }
  } catch (error) {
    console.error('Error fetching IP information:', error)
    return false
  }
}

module.exports = { isMobileIpAddress }
