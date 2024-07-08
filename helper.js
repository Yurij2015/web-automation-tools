const axios = require('axios')
const path = require('path')
const chalk = require('chalk')
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
    throw new Error('One or more environment variables are not defined')
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

const countryToIsoCode = {
  'United States': 'US',
  Canada: 'CA',
  'United Kingdom': 'GB',
  Australia: 'AU',
  Germany: 'DE',
  Lithuania: 'LT',
  'Czech Republic': 'CZ',
  Ukraine: 'UA',
  Poland: 'PL'
}

function getIsoCodeFromCountryName(countryName) {
  return countryToIsoCode[countryName] || 'Not Found'
}

async function getPhoneNumber(isoCode, service) {
  if (!process.env.SMS_PVA_TOKEN || !process.env.SMS_PVA_URL) {
    throw new Error('SMS_PVA_TOKEN or SMS_PVA_URL  environment variable is not defined')
  }

  const url = process.env.SMS_PVA_URL + '/activation/number/' + isoCode + '/' + service

  try {
    const response = await axios.get(url, {
      headers: {
        apikey: process.env.SMS_PVA_TOKEN
      }
    })
    const phoneNumberData = response.data.data
    console.log(`Phone number for ${isoCode} is: ${phoneNumberData.phoneNumber}`)
    return phoneNumberData
  } catch (error) {
    console.error('Error fetching phone number:', error)
    return 'Error fetching phone number'
  }
}

async function receiveSms(orderId) {
  if (!process.env.SMS_PVA_TOKEN) {
    throw new Error('SMS_PVA_TOKEN environment variable is not defined')
  }

  const url = process.env.SMS_PVA_URL + '/activation/sms/' + orderId

  try {
    const response = await axios.get(url, {
      headers: {
        apikey: process.env.SMS_PVA_TOKEN
      }
    })
    const smsData = response.data.data
    console.log('SMS:', smsData.sms.code)
    return smsData.sms.code
  } catch (error) {
    console.error('Error fetching SMS:', error)
    return 'Error fetching SMS'
  }
}

async function checkBalance(){
  try {
    const response = await axios.get(process.env.SMS_PVA_URL + '/activation/balance', {
      headers: {
        apikey: process.env.SMS_PVA_TOKEN
      }
    })
    const balanceData = response.data.data.balance
    console.log(balanceData)
    console.log(chalk.bgYellowBright.blue.bold('Balance:', balanceData))
    return balanceData
  } catch (error) {
    console.error(chalk.red('Error fetching balance:', error))
    throw new Error('Error fetching balance')
  }
}

module.exports = { isMobileIpAddress, getIsoCodeFromCountryName, getPhoneNumber, receiveSms, checkBalance }
