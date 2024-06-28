const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const axios = require('axios')
const fs = require('fs')
const filePath = require('path')
require('dotenv').config({ path: filePath.join(__dirname, '..', '.env') })
axios.defaults.headers.common['Authorization'] = 'Bearer ' + process.env.BEARER_TOKEN
const profileId = process.argv[2];

async function runBrowser(taskData) {
  console.log('Running browser...with task ' + taskData.id)

  let profilesList = JSON.parse(taskData.profiles_list)
  let workingProfile = taskData.profile
  let lowerDelayLimit = taskData.lower_delay_limit ?? 10000
  let upperDelayLimit = taskData.upper_delay_limit ?? 30000
  let countOfScreenScroll = taskData.count_of_screen_scroll
  let lowerLimitOfFollowers = taskData.lower_limit_of_followers
  let upperLimitOfFollowers = taskData.upper_limit_of_followers
  let isPrivate = taskData.is_private
  let isBusiness = taskData.is_business
  let isProfessional = taskData.is_professional
  let hasAvatar = taskData.has_avatar
  let hasPosts = taskData.has_posts
  let hasStories = taskData.has_stories
  let hasUrl = taskData.has_url
  let hasPhone = taskData.has_phone
  let hasBusinessCategoryName = taskData.has_business_category_name
  let hasCategoryName = taskData.has_category_name
  let categoryName = taskData.category_name
  let hasBio = taskData.has_bio
  let lowerPostsLimit = taskData.lower_posts_limit
  let lowerStoriesLimit = taskData.lower_stories_limit

  const randomDelay = () =>
    lowerDelayLimit + Math.floor(Math.random() * (upperDelayLimit - lowerDelayLimit))

  const userDataDir = filePath.join(__dirname, '..', 'userDataDir', workingProfile.username)

  if (fs.existsSync(userDataDir)) {
    console.log('User data directory finded!')
    console.log(userDataDir)
  } else {
    console.log('User data directory does not finded!')
    //in this case - login process should be started whrere we create user data directory
    return
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

  // await page.setRequestInterception(true)
  // page.on('request', (interceptedRequest) => {
  //   if (interceptedRequest.resourceType() === 'xhr') {
  //     console.log('Headers==============================')
  //     const headers = interceptedRequest.headers()
  //     console.log(headers)
  //   }
  //   if (interceptedRequest.url().match(/graphql/) && interceptedRequest.method() === 'POST') {
  //     const payloads = interceptedRequest.postData()
  //     console.log('Payloads==============================')
  //     console.log(payloads)
  //   }
  //   interceptedRequest.continue()
  // })

  const sharedData = {
    countOfFollowers: 0,
    countOfFollowings: 0,
    countOfPosts: 0,
    countOfStories: 0
  }

  page.on('response', async (response) => {
    if (response.url().includes('/graphql/query')) {
      console.log('Response URL:', response.url())
      const responseData = await response.text()

      try {
        const dataObject = await JSON.parse(responseData)
        if (dataObject?.data?.xdt_api__v1__feed__user_timeline_graphql_connection) {
          console.log(dataObject.data.xdt_api__v1__feed__user_timeline_graphql_connection)
        }
        if (dataObject?.data?.user) {
          let user = dataObject.data.user
          sharedData.countOfFollowers = user.follower_count
          sharedData.countOfFollowings = user.following_count
          sharedData.countOfPosts = user.media_count
          sharedData.countOfStories = 0
          console.log(user)
        }
      } catch (error) {
        console.error('Error parsing response data:', error)
      }
    }
  })

  await page.goto(url, { waitUntil: 'domcontentloaded' })

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

    await new Promise((r) => setTimeout(r, 1000));

    const submitButton = await page.waitForSelector(
      '::-p-xpath(//*[@id="loginForm"]/div/div[3]/button)'
    )

    if (submitButton) {
      await submitButton.click()
    }
  }

  let pauseBeforeFollowingStarted = 0
  let pauseBeforeFollowingFinished = 0
  let followingButtonClickedTime = 0
  let pauseAfterFollowingStarted = 0
  let pauseAfterFollowingFinished = 0

  if (Array.isArray(profilesList) && profilesList.length > 0) {
    for (const profileLogin of profilesList) {
      console.log('Go to page ' + profileLogin)
      await page.goto(url + profileLogin, { waitUntil: 'domcontentloaded' })

      pauseBeforeFollowingStarted = new Date()
      console.log('Pause before following started ' + pauseBeforeFollowingStarted)
      await new Promise((r) => setTimeout(r, randomDelay()))
      pauseBeforeFollowingFinished = new Date()
      console.log('Pause before following finished ' + pauseBeforeFollowingFinished)

      try {
        let button = await page.locator('::-p-aria([name="Follow"][role="button"])')
        if (button) {
          console.log('Follow button founded!')
          await button.click()
          followingButtonClickedTime = new Date()
          console.log('Follow button clicked!')
        }
      } catch (error) {
        console.error('Error finding or clickint follow button:', error)
      }

      pauseAfterFollowingStarted = new Date()
      console.log('Pause after following started ' + pauseAfterFollowingStarted)
      await new Promise((r) => setTimeout(r, randomDelay()))
      pauseAfterFollowingFinished = new Date()
      console.log('Pause after following finished ' + pauseAfterFollowingFinished)

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
          element.click()
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

      await logFollowingActivity(
        taskData.id,
        workingProfile.id,
        workingProfile.username,
        profileLogin,
        sharedData.countOfFollowers,
        sharedData.countOfFollowings,
        sharedData.countOfPosts,
        sharedData.countOfStories,
        pageTitle,
        pauseAfterScrollingStarted,
        pauseAfterScrollingFinished,
        pauseBeforeFollowingStarted,
        pauseBeforeFollowingFinished,
        followingButtonClickedTime,
        pauseAfterFollowingStarted,
        pauseAfterFollowingFinished,
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

async function logFollowingActivity(
  taskDataId,
  workingProfileId,
  worknigProfileUserName,
  profileLogin,
  countOfFollowers,
  countOfFollowings,
  countOfPosts,
  countOfStories,
  pageTitle,
  pauseAfterScrollingStarted,
  pauseAfterScrollingFinished,
  pauseBeforeFollowingStarted,
  pauseBeforeFollowingFinished,
  followingButtonClickedTime,
  pauseAfterFollowingStarted,
  pauseAfterFollowingFinished,
  pauseAfterWorkWithProfileStarted,
  pauseAfterWorkWithProfileFinished
) {
  try {
    const response = await axios.post(process.env.HOST + process.env.FOLLOWING_HISTORY_URL_PATH, {
      following_task_id: taskDataId,
      working_profile_id: workingProfileId,
      working_profile_username: worknigProfileUserName,
      handled_profile_login: profileLogin,
      count_of_followers: countOfFollowers,
      count_of_followings: countOfFollowings,
      count_of_posts: countOfPosts,
      count_of_stories: countOfStories,
      page_title: pageTitle,
      pause_after_scrolling_started: pauseAfterScrollingStarted,
      pause_after_scrolling_finished: pauseAfterScrollingFinished,
      pause_before_following_started: pauseBeforeFollowingStarted,
      pause_before_following_finished: pauseBeforeFollowingFinished,
      following_button_click_time: followingButtonClickedTime,
      pause_after_following_started: pauseAfterFollowingStarted,
      pause_after_following_finished: pauseAfterFollowingFinished,
      pause_after_work_with_profile_started: pauseAfterWorkWithProfileStarted,
      pause_after_work_with_profile_finished: pauseAfterWorkWithProfileFinished
    })
    return response.data
  } catch (error) {
    console.error('Error pass activity data:', error)
    throw error
  }
}

fetchDataAndExecuteTask(process.env.HOST + process.env.FOLLOWING_URL_PATH)
  .then((response) => {
    console.log('Task data is fetched!')
    handleResponse(response).then((r) => console.log(r))
  })
  .catch(console.error)
