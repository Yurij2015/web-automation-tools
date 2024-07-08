const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const filePath = require('path')
const chalk = require('chalk')
const { getIsoCodeFromCountryName, checkBalance, receiveSms, getPhoneNumber } = require('./../helper')

const emailServices = [
  'aol.com',
  'zoho.com',
  'mail.com',
  'gmx.com',
  'tutanota.com',
  'hushmail.com',
  'rediffmail.com',
  'lycos.com',
  'inbox.com',
  'mailfence.com',
  'lavabit.com',
  'runbox.com',
  'mailinator.com',
  'trashmail.com',
  'getnada.com',
  'kolabnow.com',
  'thexyz.com',
  'vfemail.net',
  'mail2world.com',
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'protonmail.com'
]

const userName = 'johnnysnowlake2024'

const randomDelay = () => 1000 + Math.floor(Math.random() * (3000 - 1000))

async function runBrowser() {
  console.log('Running browser...')

  console.log('Install extensions')
  const xPathFinder = './../extensions/xPath-Finder'
  const xPathHelper = './../extensions/XPath-Helper'

  const userDataDir = filePath.join(__dirname, '..', 'userDataDir', userName)

  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: userDataDir,
    protocolTimeout: 60000,
    args: [
      // '--proxy-server=' + profile.proxy + ':' + profile.proxyPort,
      '--disable-features=IsolateOrigins,site-per-process,SitePerProcess',
      '--flag-switches-begin --disable-site-isolation-trials --flag-switches-end',
      `--disable-extensions-except=${xPathFinder},${xPathHelper}`,
      `--load-extension=${xPathFinder},${xPathHelper}`
    ]
  })

  puppeteer.use(StealthPlugin())

  const viewPort = {
    width: 1280 + Math.floor(Math.random() * 100),
    height: 900 + Math.floor(Math.random() * 100),
    deviceScaleFactor: 1,
    hasTouch: false,
    isLandscape: false,
    isMobile: false
  }

  const page = await browser.newPage()
  await page.setViewport(viewPort)
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
  )

  // const url = 'https://google.com'
  const url = 'https://mail2world.com'

  await page.goto(url, { waitUntil: 'domcontentloaded' })

  await new Promise((r) => setTimeout(r, 10000))

  try {
    let button = await page.waitForSelector('::-p-xpath(//body/div[1]/div/a)')
    if (button) {
      console.log('Got it button founded!')

      const isClickable = await button.evaluate((element) => {
        const rect = element.getBoundingClientRect()
        const x = rect.left + rect.width / 2
        const y = rect.top + rect.height / 2
        const elAtPoint = document.elementFromPoint(x, y)
        return elAtPoint === element
      })

      if (isClickable) {
        await button.click({ button: 'left', delay: 100 })
        console.log('Got it button clicked!')
      } else {
        console.log('Got it button not clicked!')
      }

      await new Promise((r) => setTimeout(r, 1000))
    }
  } catch (error) {
    console.error('Error finding or clickint follow button:', error)
  }

  await new Promise((r) => setTimeout(r, 1000))

  try {
    // const getFreeAccount = await page.waitForSelector(
    //   '::-p-xpath(/html/body/div[2]/section[1]/div/div/div/ul/li[1]/a)'
    // )
    const getFreeAccount = await page.waitForSelector(
      '#mainwrapperID > section.hero > div > div > div > ul > li:nth-child(1) > a'
    )
    if (getFreeAccount) {
      console.log(chalk.cyan('Get free account founded!'))
      await getFreeAccount.click()
      await new Promise((r) => setTimeout(r, 1000))
      console.log(chalk.greenBright('Get free account button clicked!'))
    }
  } catch (error) {
    console.error(chalk.red('Error finding or clickint Get free account button:', error))
  }

  console.log(chalk.yellow('Page loaded'))

  const title = await page.title()
  const targetUrl = new URL(page.url())
  console.log(chalk.bgCyan(`Page title is: ${title}`))
  console.log(chalk.bgGreen(`Target URL is: ${targetUrl}`))
  console.log(chalk.bgYellow.black(`Target PATHNAME is: ${targetUrl.pathname}`))

  if (targetUrl.pathname === '/v1/sig/') {
    console.log(chalk.bgYellow.black.bold('Sign up page. Registration process started'))

    await new Promise((r) => setTimeout(r, randomDelay()))

    const firstName = await page.$('input[name="first-name"]')
    const lastName = await page.$('input[name="last-name"]')
    const userLogin = await page.$('input[name="user-name"]')
    const domain = await page.$('#menudomains')
    const password = await page.$('#password')
    const confirmPassword = await page.$('#confirm-password')

    await firstName.type('Johnas', { delay: 100 })
    await new Promise((r) => setTimeout(r, randomDelay()))
    await lastName.type('Snowwy', { delay: 100 })
    await new Promise((r) => setTimeout(r, randomDelay()))
    await userLogin.type(userName, { delay: 100 })
    await new Promise((r) => setTimeout(r, randomDelay()))
    await domain.type('mail2world.com')
    await new Promise((r) => setTimeout(r, randomDelay()))
    await password.type('jkjhhjjjhhhjU55', { delay: 100 })
    await new Promise((r) => setTimeout(r, randomDelay()))
    await confirmPassword.type('jkjhhjjjhhhjU55', { delay: 100 })

    await new Promise((r) => setTimeout(r, randomDelay()))
    const submit = await page.$('#signup_s1btn')
    // await submit.click({ button: 'left', delay: 100 })
    // await new Promise((r) => setTimeout(r, randomDelay()))
    // await new Promise((r) => setTimeout(r, randomDelay()))
    //
    // const phone = await page.$('input[name="phone"]')
    //
    // const selectFlag = await page.$('.iti__selected-flag')
    //
    // await selectFlag.click({ button: 'left', delay: 100 })
    //
    // const searchCoutry = await page.$('.iti__search-input')
    // await new Promise((r) => setTimeout(r, randomDelay()))
    //
    // const countryName = 'Lithuania'
    //
    // await searchCoutry.type(countryName, { delay: 100 })
    // console.log(chalk.bgYellow.black(`Entered Country name. Country name is: ${countryName}`))
    // await new Promise((r) => setTimeout(r, randomDelay()))
    //
    // const selectedCoutry = await page.$(
    //   '#iti-0__item-' + getIsoCodeFromCountryName(countryName).toLowerCase()
    // )
    // await new Promise((r) => setTimeout(r, randomDelay()))
    //
    // try {
    //   await selectedCoutry.click({ button: 'left', delay: 100 })
    //   console.log(chalk.cyan('Country for get sms selected!'))
    // } catch (error) {
    //   console.error(chalk.red('Error selecting country:', error))
    // }






    // let phoneFromService = await getPhoneNumber(getIsoCodeFromCountryName(countryName), 'opt19')
    //
    // await phone.type(phoneFromService.phoneNumber, { delay: 100 })
    //
    // await new Promise((r) => setTimeout(r, randomDelay()))
    //
    // const requestCode = await page.$('#signup_s2btn')
    // await new Promise((r) => setTimeout(r, randomDelay()))
    // await requestCode.click({ button: 'left', delay: 100 })
    //
    // console.log(chalk.bgGreen('Request code button clicked!'))
    //
    // await new Promise((r) => setTimeout(r, randomDelay()))
    //
    // const code = await receiveSms(phoneFromService.orderId)
    //
    // console.log(chalk.bgYellow.black(`Received code is: ${code}`))
  }
  // await browser.close()
}

async function handleResponse() {
  await runBrowser()
  return 'Browser runned'
}

handleResponse().then((r) => console.log('Done - ', r))
