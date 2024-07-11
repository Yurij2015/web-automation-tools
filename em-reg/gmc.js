const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const filePath = require('path')
const chalk = require('chalk')
const {
  getIsoCodeFromCountryName,
  receiveSms,
  getPhoneNumber
} = require('./../helper')

const userName = 'mishkaarhipov22'

const randomDelay = () => 1000 + Math.floor(Math.random() * (3000 - 1000))

async function runBrowser() {
  console.log('Running browser...')

  console.log('Install extensions')
  const xPathFinder = './../extensions/xPath-Finder'
  const xPathHelper = './../extensions/XPath-Helper'

  const userDataDir = filePath.join(__dirname, '../..', 'userDataDir', userName)

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

  const url = 'https://google.com'

  await page.goto(url, { waitUntil: 'domcontentloaded' })

  await new Promise((r) => setTimeout(r, 10000))

  try {
    let button = await page.$('::-p-xpath(//button[2]/div)')
    if (button) {
      console.log(chalk.bgCyan('Accept all button founded!'))
      const isClickable = await button.evaluate((element) => {
        const rect = element.getBoundingClientRect()
        const x = rect.left + rect.width / 2
        const y = rect.top + rect.height / 2
        const elAtPoint = document.elementFromPoint(x, y)
        return elAtPoint === element
      })

      if (isClickable) {
        await button.click({ button: 'left', delay: 100 })
        console.log(chalk.cyan('Accept all button clicked!'))
      } else {
        console.log(chalk.bgRed('Accept all button not clicked!'))
      }
      await new Promise((r) => setTimeout(r, 1000))
    }
  } catch (error) {
    console.error('Error finding or clickint button:', error)
  }

  await new Promise((r) => setTimeout(r, 1000))

  await clickElementByXPath(page, '/html/body/div[1]/div[1]/div/div/div/div/div[2]/a', 'SIGN IN')

  const title = await page.title()
  const targetUrl = new URL(page.url())
  console.log(chalk.bgCyan(`Page title is: ${title}`))
  console.log(chalk.blueBright(`Target URL is: ${targetUrl}`))
  console.log(chalk.bgYellow.black(`Target PATHNAME is: ${targetUrl.pathname}`))

  if (targetUrl.pathname === '/v3/signin/identifier') {
    console.log(chalk.bgYellow.black.bold('Sign up page. Registration process started'))

    await new Promise((r) => setTimeout(r, randomDelay()))
    await clickElementByXPath(
      page,
      '/html/body/div[1]/div[1]/div[2]/c-wiz/div/div[3]/div/div[2]/div/div/div[1]/div/button/span',
      'CREATE ACCOUNT')


    await clickElementByXPath(
      page,
      '/html/body/div[1]/div[1]/div[2]/c-wiz/div/div[3]/div/div[2]/div/div/div[2]/div/ul/li[1]/span[3]',
      'FOR MY PERSONAL USE')

    await new Promise((r) => setTimeout(r, randomDelay()))
    await new Promise((r) => setTimeout(r, randomDelay()))

    const firstName = await page.$('input[name="firstName"]')
    const lastName = await page.$('input[name="lastName"]')


    // const userLogin = await page.$('input[name="user-name"]')
    // const domain = await page.$('#menudomains')
    // const password = await page.$('#password')
    // const confirmPassword = await page.$('#confirm-password')

    await firstName.type('Mikhail', { delay: 100 })
    await new Promise((r) => setTimeout(r, randomDelay()))
    await lastName.type('Arhipov', { delay: 100 })
    await new Promise((r) => setTimeout(r, randomDelay()))
    await new Promise((r) => setTimeout(r, randomDelay()))

    try {
      await page.locator('text/Next').click()
      console.log(chalk.cyan('Next button clicked!'))
    } catch (error) {
      console.error(chalk.red('Error clicking Next button:', error))
    }

    await new Promise((r) => setTimeout(r, randomDelay()))

    const month = await page.waitForSelector('#month')
    const day = await page.waitForSelector('#day')
    const year = await page.waitForSelector('#year')
    const gender = await page.waitForSelector('#gender')

    if (month) {
      await new Promise((r) => setTimeout(r, randomDelay()))
      await month.type('April', { delay: 103 })
      await new Promise((r) => setTimeout(r, randomDelay()))
      console.log(chalk.bgYellow.black(`Month is selected!`))
    }

    if (day) {
      await new Promise((r) => setTimeout(r, randomDelay()))
      await day.type('25', { delay: 99 })
      await new Promise((r) => setTimeout(r, randomDelay()))
      console.log(chalk.bgYellow.black(`Day is entered!`))
    }

    if (year) {
      await new Promise((r) => setTimeout(r, randomDelay()))
      await year.type('1999', { delay: 104 })
      await new Promise((r) => setTimeout(r, randomDelay()))
      console.log(chalk.bgYellow.black(`Year is entered!`))
    }

    if (gender) {
      await new Promise((r) => setTimeout(r, randomDelay()))
      await gender.type('Male', { delay: 102 })
      await new Promise((r) => setTimeout(r, randomDelay()))
      console.log(chalk.bgYellow.black(`Gender is selected!`))
    }

    await new Promise((r) => setTimeout(r, randomDelay()))

    try {
      await page.locator('text/Next').click()
      console.log(chalk.cyan('Next button clicked!'))
    } catch (error) {
      console.error(chalk.red('Error clicking Next button:', error))
    }

    await new Promise((r) => setTimeout(r, randomDelay()))

    const ownGmailAddressElements = await page.$$('[aria-labelledby="selectionc4"]')
    for (let ownGmailAddressElement of ownGmailAddressElements) {
      const ariaLabelledBy = await page.evaluate(
        (el) => el.getAttribute('aria-labelledby'),
        ownGmailAddressElement
      )
      if (ariaLabelledBy === 'selectionc4') {
        await ownGmailAddressElement.click()
        console.log('Radio button checked')
        break
      }
    }

    await new Promise((r) => setTimeout(r, randomDelay()))

    try {
      await page.locator('text/Next').click()
      console.log(chalk.cyan('Next button clicked!'))
    } catch (error) {
      console.error(chalk.red('Error clicking Next button:', error))
    }

    await new Promise((r) => setTimeout(r, randomDelay()))

    const userNameInput = await page.waitForSelector('input[name="Username"]')
    await userNameInput.type(userName, { delay: 100 })

    await new Promise((r) => setTimeout(r, randomDelay()))

    try {
      await page.locator('text/Next').click()
      console.log(chalk.cyan('Next button clicked!'))
    } catch (error) {
      console.error(chalk.red('Error clicking Next button:', error))
    }
    await new Promise((r) => setTimeout(r, randomDelay()))

    const passwordInput = await page.waitForSelector('input[name="Passwd"]')
    const passwordConfirmInput = await page.waitForSelector('input[name="PasswdAgain"]')


    const passwordValue = "Qwjk4eRt7yUi0p"
    await new Promise((r) => setTimeout(r, randomDelay()))
    await passwordInput.type(passwordValue, { delay: 107 })
    console.log(chalk.bgYellow.black(`Password entered. Password is: ${passwordValue}`))
    await new Promise((r) => setTimeout(r, randomDelay()))
    await passwordConfirmInput.type(passwordValue, { delay: 107 })
    console.log(chalk.bgYellow.black(`Password confirmed. Password is: ${passwordValue}`))
    await new Promise((r) => setTimeout(r, randomDelay()))

    try {
      await page.locator('text/Next').click()
      console.log(chalk.cyan('Next button clicked!'))
    } catch (error) {
      console.error(chalk.red('Error clicking Next button:', error))
    }
    await new Promise((r) => setTimeout(r, randomDelay()))

    const countryName = 'Poland'

    const phone = await page.$('#phoneNumberId')

    let phoneFromService = await getPhoneNumber(getIsoCodeFromCountryName(countryName), 'opt1')

    console.log(chalk.bgYellow.black('Phone number from service:'))
    console.log(chalk.bgYellow.black.bold(phoneFromService.phoneNumber))
    console.log(chalk.bgYellow.black.bold(phoneFromService.orderId))

    await new Promise((r) => setTimeout(r, randomDelay()))
    await new Promise((r) => setTimeout(r, randomDelay()))

    try{
      await phone.type(phoneFromService.phoneNumber, { delay: 100 })
    } catch (error) {
      console.error(chalk.red('Error entering phone number:', error))
    }

    await new Promise((r) => setTimeout(r, randomDelay()))

    try {
      await page.locator('text/Next').click()
      console.log(chalk.cyan('Next button clicked!'))
    } catch (error) {
      console.error(chalk.red('Error clicking Next button:', error))
    }

    console.log('start pause' + Date.now());
    await new Promise((r) => setTimeout(r, 20000))
    await new Promise((r) => setTimeout(r, randomDelay()))
    console.log('start pause' + Date.now());


    const code = await receiveSms(phoneFromService.orderId)

    console.log(chalk.bgYellow.black(`Received code is: ${code}`))
  }
  // await browser.close()
}

async function clickElementByXPath(page, xPath, elementName) {
  try {
    let element = await page.waitForSelector(`::-p-xpath(${xPath})`)

    if (element) {
      console.log(chalk.bgCyan(`Element ${xPath} founded!`))
      const isClickable = await element.evaluate((element) => {
        const rect = element.getBoundingClientRect()
        const x = rect.left + rect.width / 2
        const y = rect.top + rect.height / 2
        const elAtPoint = document.elementFromPoint(x, y)
        return elAtPoint === element
      })

      if (isClickable) {
        await element.click({ button: 'left', delay: 100 })
        console.log(chalk.cyan(`Element ${xPath} ${elementName} clicked!`))
      } else {
        console.log(chalk.bgRed(`Element ${xPath} ${elementName} not clicked!`))
      }
      await new Promise((r) => setTimeout(r, 1000))
    }
  } catch (error) {
    console.error('Error finding or clickint element:', error)
  }
}

async function handleResponse() {
  await runBrowser()
  return 'Browser runned'
}

handleResponse().then((r) => console.log('Done - ', r))
