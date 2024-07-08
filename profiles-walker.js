const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const axios = require('axios')
const fs = require('fs')
const filePath = require('path')
const { isMobileIpAddress } = require('./helper')
require('dotenv').config({ path: filePath.join(__dirname, '..', '.env') })
axios.defaults.headers.common['Authorization'] = 'Bearer ' + process.env.BEARER_TOKEN
const profileId = process.argv[2]

async function runBrowser(taskData) {
  if (!(await isMobileIpAddress())) {
    return
  }
  console.log('Running browser...with task ' + taskData.id)

  let profilesList = JSON.parse(taskData.profiles_list)
  let workingProfile = taskData.profile
  let lowerDelayLimit = taskData.lower_delay_limit ?? 10000
  let upperDelayLimit = taskData.upper_delay_limit ?? 30000
  const randomDelay = () =>
    lowerDelayLimit + Math.floor(Math.random() * (upperDelayLimit - lowerDelayLimit))

  const userDataDir = filePath.join(__dirname, '..', 'userDataDir', workingProfile.username)

  if (fs.existsSync(userDataDir)) {
    console.log('User data directory finded!')
    console.log(userDataDir)
  }

  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: userDataDir,
    protocolTimeout: 60000,
    args: [
      // '--proxy-server=' + profile.proxy + ':' + profile.proxyPort,
      '--disable-features=IsolateOrigins,site-per-process,SitePerProcess',
      '--flag-switches-begin --disable-site-isolation-trials --flag-switches-end'
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

  console.log('Opening browser for', workingProfile.username)

  const page = await browser.newPage()
  await page.setViewport(viewPort)
  await page.setUserAgent(workingProfile.userAgent)

  // await page.authenticate({
  //   username: profile.proxyLogin,
  //   password: profile.proxyPassword
  // })

  const url = process.env.TARGET_URL
  await page.goto(url, { waitUntil: 'domcontentloaded' })

  console.log('Page loaded')

  console.log('Pause before work started ' + Date.now())
  await new Promise((r) => setTimeout(r, randomDelay()))
  console.log('Pause before work finished' + Date.now())

  const loginBlock = await page.$('input[name="username"]')

  if (loginBlock) {
    console.log('Pause before name input started ' + Date.now())
    await new Promise((r) => setTimeout(r, randomDelay()))
    console.log('Pause before name input finished' + Date.now())

    await page.type('input[name="username"]', workingProfile.username, { delay: 100 })

    console.log('Pause before password input started ' + Date.now())
    await new Promise((r) => setTimeout(r, randomDelay()))
    console.log('Pause before password input finished' + Date.now())

    await page.type('input[name="password"]', workingProfile.password, { delay: 100 })

    console.log('Pause after fill login form started ' + Date.now())
    await new Promise((r) => setTimeout(r, randomDelay()))
    console.log('Pause after fill login finished' + Date.now())

    await new Promise((r) => setTimeout(r, 1000))

    const submitButton = await page.waitForSelector(
      '::-p-xpath(//*[@id="loginForm"]/div/div[3]/button)'
    )

    if (submitButton) {
      await submitButton.click()
    }
    await new Promise((r) => setTimeout(r, randomDelay()))
  }

  console.log(profilesList)

  if (Array.isArray(profilesList) && profilesList.length > 0) {
    await new Promise((r) => setTimeout(r, randomDelay()))
    for (const profileLogin of profilesList) {
      await new Promise((r) => setTimeout(r, randomDelay()))
      console.log('Go to page of # ' + profileLogin)
      await page.goto(url + profileLogin, { waitUntil: 'domcontentloaded' })

      console.log('Scrolling...')
      await page.evaluate(() => {
        window.scrollBy(0, Math.random() * 1000)
      })
      console.log('Scrolling finished')

      let pauseAfterScrollingStarted = new Date()
      console.log('Pause after scrolling started ' + pauseAfterScrollingStarted)
      await new Promise((r) => setTimeout(r, randomDelay()))
      let pauseAfterScrollingFinished = new Date()
      console.log('Pause after scrolling finished ' + pauseAfterScrollingFinished)

      // TODO if page.title - not found, do not clkicking, and randorm make click, do not make click, make two click
      // TODO check count of posts if  profilie is not private, check if profile is private, check avatar
      console.log('Clicking on the page...')
      await page.evaluate(() => {
        const x = Math.floor(Math.random() * window.innerWidth)
        const y = Math.floor(Math.random() * window.innerHeight)
        const element = document.elementFromPoint(x, y)
        if (element) {
          element.click({
            button: 'left',
            clickCount: 1,
            delay: 100
          })
          console.log(`Clicked element at (${x}, ${y}):`, element)
        } else {
          console.log(`No element found at (${x}, ${y})`)
        }
      })
      console.log('Clicking finished')

      const pageTitle = await page.title()
      console.log(`Page title is: ${pageTitle}`)

      let pauseAfterWorkWithProfileStarted = new Date()
      console.log('Pause after work with profile started ' + pauseAfterWorkWithProfileStarted)
      await new Promise((r) => setTimeout(r, randomDelay()))
      let pauseAfterWorkWithProfileFinished = new Date()

      console.log('Pause after work with profile finished ' + pauseAfterWorkWithProfileFinished)
      await logWalkerActivity(
        taskData.id,
        workingProfile.id,
        workingProfile.username,
        profileLogin,
        pageTitle,
        pauseAfterScrollingStarted,
        pauseAfterScrollingFinished,
        pauseAfterWorkWithProfileStarted,
        pauseAfterWorkWithProfileFinished
      ).then((r) => console.log(r))
    }
  } else {
    console.log('Profile list is not an array')
  }

  const title = await page.title()
  console.log(`Page title is: ${title}`)
  await browser.close()
}

async function fetchDataAndExecuteTask(url) {
  try {
    const response = await axios.get(url, {
      params: {
        profile_id: profileId
      }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
}

async function handleResponse(response) {
  console.log('Handling response...')
  if (Array.isArray(response) && response.length > 0) {
    for (const taskData of response) {
      console.log('Handling task data...task # ' + taskData.id)
      await runBrowser(taskData)
    }
  } else {
    console.log('Response is not an array')
  }
  return 'Handling response finished!'
}

async function logWalkerActivity(
  taskDataId,
  workingProfileId,
  worknigProfileUserName,
  profileLogin,
  pageTitle,
  pauseAfterScrollingStarted,
  pauseAfterScrollingFinished,
  pauseAfterWorkWithProfileStarted,
  pauseAfterWorkWithProfileFinished
) {
  try {
    const response = await axios.post(process.env.HOST + process.env.WALKER_HISTORY_URL_PATH, {
      walking_task_id: taskDataId,
      working_profile_id: workingProfileId,
      working_profile_username: worknigProfileUserName,
      handled_profile_login: profileLogin,
      page_title: pageTitle,
      pause_after_scrolling_started: pauseAfterScrollingStarted,
      pause_after_scrolling_finished: pauseAfterScrollingFinished,
      pause_after_work_with_profile_started: pauseAfterWorkWithProfileStarted,
      pause_after_work_with_profile_finished: pauseAfterWorkWithProfileFinished
    })
    return response.data
  } catch (error) {
    console.error('Error pass activity data:', error)
    throw error
  }
}

fetchDataAndExecuteTask(process.env.HOST + process.env.WALKER_URL_PATH)
  .then((response) => {
    console.log('Task data is fetched!')
    handleResponse(response).then((r) => console.log(r))
  })
  .catch(console.error)
