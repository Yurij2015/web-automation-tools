const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const axios = require('axios')
const fs = require('fs')
const filePath = require('path')
const { isMobileIpAddress } = require('./helper')
require('dotenv').config({ path: filePath.join(__dirname, '..', '.env') })
axios.defaults.headers.common['Authorization'] = 'Bearer ' + process.env.BEARER_TOKEN
const chalk = require('chalk')
const {
  getIsoCodeFromCountryName,
  receiveSms,
  getPhoneNumber
} = require('./helper')

const viewPort = {
  width: 1920 + Math.floor(Math.random() * 100),
  height: 1080 + Math.floor(Math.random() * 100),
  deviceScaleFactor: 1 + Math.random() * 0.2,
  hasTouch: false,
  isLandscape: true,
  isMobile: false
}
//
// const viewPort = {
//   width: 375, // iPhone width
//   height: 812, // iPhone height
//   deviceScaleFactor: 3,
//   hasTouch: true,
//   isLandscape: false,
//   isMobile: true
// };

const randomTimeOut = () => Math.random() * (8200 - 2340) + 2340
const randomDelay = () => Math.random() * (300 - 230) + 230


// runRegistration().then((profiles) => {
//   profiles.forEach((profile) => {
//     (async () => {
//       puppeteer.use(StealthPlugin());
//       const browser = await puppeteer.launch({
//         executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
//         headless: false, // Run in full mode
//         args: [
//           '--proxy-server=' + profile.proxy + ':' + profile.port,
//           '--disable-features=IsolateOrigins,site-per-process,SitePerProcess',
//           '--flag-switches-begin --disable-site-isolation-trials --flag-switches-end'
//         ],
//         userDataDir: 'userDataDir/' + profile.username,
//       });
//
//       const page = await browser.newPage();
//
//       await page.setViewport(viewPort);
//
//       // Proxy auth
//       await page.authenticate({
//         username: profile.proxy_login,
//         password: profile.proxy_password
//       });
//
//       const userAgent = await getUserAgentFromDB();
//       await page.setUserAgent(userAgent);
//
//       await page.setRequestInterception(true);
//       page.on('request', async request => {
//         if (request.resourceType() === 'xhr') {
//           const headers = request.headers();
//           console.log(headers);
//           if (headers.cookie && headers['user-agent'] && headers['x-ig-app-id']) {
//             const pool = mysql.createPool(db_config);
//             try {
//               const connection = await pool.getConnection();
//               try {
//                 const [result] = await connection.execute('UPDATE profiles SET cookie = ?, user_agent = ? WHERE username = ?', [headers.cookie, headers['user-agent'], profile.username]);
//                 console.log('Rows cookie affected:', result.affectedRows);
//               } finally {
//                 connection.release();
//               }
//             } catch (error) {
//               console.error('Error during database operation:', error);
//             } finally {
//               await pool.end();
//             }
//           }
//         }
//         if (request.url().match(/graphql/) && request.method() === 'POST') {
//           const payloads = request.postData();
//           console.log("dtst param value:");
//           const dtsg = getFbDtsgValueFrom(payloads);
//           if (dtsg) {
//             const decoded_dtsg = decodeURIComponent(dtsg);
//             const pool = mysql.createPool(db_config);
//             try {
//               const connection = await pool.getConnection();
//               try {
//                 const [result] = await connection.execute('UPDATE profiles SET fb_dtsg = ? WHERE username = ?', [decoded_dtsg, profile.username]);
//                 console.log('Rows dtsg affected:', result.affectedRows);
//               } finally {
//                 connection.release();
//               }
//             } catch (error) {
//               console.error('Error during database operation:', error);
//             } finally {
//               await pool.end();
//             }
//           }
//           console.log(dtsg);
//         }
//         await request.continue();
//       });
//
//       await page.setUserAgent(profile.user_agent);
//
//       await page.goto('https://www.instagram.com');
//       await new Promise(r => setTimeout(r, goToSignInPageTimeOut()));
//
//       page.on('load', async () => {
//         await page.setUserAgent(profile.user_agent);
//       });
//
//       await new Promise(r => setTimeout(r, randomTimeOutForRegister()));
//
//       const link = await page.$('a[href="/accounts/emailsignup/"]');
//
//       await new Promise(r => setTimeout(r, randomTimeOutForRegister()));
//
//       if (link) {
//         await new Promise(r => setTimeout(r, randomTimeOutForRegister()));
//         await link.click();
//       } else {
//         console.error('Link not found');
//       }
//
//       await new Promise(r => setTimeout(r, goToSignInPageTimeOut()));
//
//       const emailOrPhone = await page.$('input[name="emailOrPhone"]');
//       const fullName = await page.$('input[name="fullName"]');
//       const username = await page.$('input[name="username"]');
//       const password = await page.$('input[name="password"]');
//
//
//       if (emailOrPhone) {
//         console.log('start filling form');
//         await emailOrPhone.click();
//         await new Promise(r => setTimeout(r, randomTimeOutForRegister()));
//         await page.type('input[name="emailOrPhone"]', profile.email, {delay: randomDelay()});
//
//         await new Promise(r => setTimeout(r, randomTimeOutForRegister()));
//
//         await fullName.click();
//         await new Promise(r => setTimeout(r, randomTimeOutForRegister()));
//         await page.type('input[name="fullName"]', profile.fullName, {delay: randomDelay()});
//         await new Promise(r => setTimeout(r, randomTimeOutForRegister()));
//
//         await username.click();
//         await new Promise(r => setTimeout(r, randomTimeOutForRegister()));
//         await page.type('input[name="username"]', profile.username, {delay: randomDelay()});
//         await new Promise(r => setTimeout(r, randomTimeOutForRegister()));
//
//         await password.click();
//         await new Promise(r => setTimeout(r, randomTimeOutForRegister()));
//         await page.type('input[name="password"]', profile.password, {delay: randomDelay()});
//         await new Promise(r => setTimeout(r, randomTimeOutForRegister()));
//
//         //
//         //     // Submit the form using XPath
//         //     await page.evaluate(() => {
//         //         const submitButton = document.evaluate('//*[@id="loginForm"]/div/div[3]/button', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
//         //         if (submitButton) {
//         //             submitButton.click();
//         //         }
//         //     });
//         //     //
//       }
//       await new Promise(r => setTimeout(r, 5000));
//     })();
//   });
// });

async function runRegistration() {
  console.log('Registration process strarted!!!')

  await fetchProfiles()
    .then(async (profiles) => {
      if (profiles.length) {
        if (!(await isMobileIpAddress())) {
          return
        }


        for (const profile of profiles) {

          puppeteer.use(StealthPlugin())

          const userDataDir = filePath.join(__dirname, '..', 'userDataDir', profile.username)

          console.log('Running browser...')

          console.log('Install extensions')
          const xPathFinder = './extensions/xPath-Finder'
          const xPathHelper = './extensions/XPath-Helper'

          const browser = await puppeteer.launch({
            // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            headless: false, // Run in full mode
            args: [
              // '--proxy-server=' + profile.proxy + ':' + profile.port,
              // '--disable-features=IsolateOrigins,site-per-process,SitePerProcess',
              // '--flag-switches-begin --disable-site-isolation-trials --flag-switches-end',
              // `--disable-extensions-except=${xPathFinder},${xPathHelper}`,
              // `--load-extension=${xPathFinder},${xPathHelper}`
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-accelerated-2d-canvas',
              '--no-zygote',
              '--disable-gpu'
            ],
            userDataDir: userDataDir
          })

          puppeteer.use(StealthPlugin())

          const page = await browser.newPage()

          await page.setViewport(viewPort)

          // // Proxy auth
          //  page.authenticate({
          //   username: profile.proxy_login,
          //   password: profile.proxy_password
          // });
          //
          // const userAgent =  getUserAgentFromDB();
          //  page.setUserAgent(userAgent);

          // await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36');
          // await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1');

          await page.goto('https://www.instagram.com', { waitUntil: 'networkidle2' })

          await page.setUserAgent(profile.user_agent)

          await new Promise((r) => setTimeout(r, randomTimeOut()))

          // console.log(chalk.red.bold('Selected user agent: ' + profile.user_agent))

          // page.on('load', async () => {
          //   // await page.setUserAgent(profile.user_agent)
          //   await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36');
          // })

          await new Promise((r) => setTimeout(r, randomTimeOut()))


          try {
            let button = await page.$('::-p-xpath(//div[2]/div/button[1])')
            if (button) {
              console.log('Allow cookie button founded!')

              const isClickable = await button.evaluate((element) => {
                const rect = element.getBoundingClientRect()
                const x = rect.left + rect.width / 2
                const y = rect.top + rect.height / 2
                const elAtPoint = document.elementFromPoint(x, y)
                return elAtPoint === element
              })

              if (isClickable) {
                await button.click({ button: 'left', delay: 100 })
                console.log(chalk.cyan.bold('Allow cookie button clicked!'))
              } else {
                console.log('Allow cookie button not clicked!')
              }

              await new Promise((r) => setTimeout(r, 1000))
            }
          } catch (error) {
            console.error('Error finding or clickint follow button:', error)
          }

          await new Promise((r) => setTimeout(r, randomTimeOut()))

          const link = await page.$('a[href="/accounts/emailsignup/"]')
          const linkHtml = await page.evaluate(
            (link) => (link ? link.innerHTML : 'Link not found'),
            link
          )

          await new Promise((r) => setTimeout(r, randomTimeOut()))

          if (link) {
            console.log(chalk.red.bold('Link page is fonded: ' + linkHtml))
            await new Promise((r) => setTimeout(r, randomTimeOut()))
            await link.click()
            console.log(chalk.blue.bold('Link clicked'))
          } else {
            console.error('Link not found')
          }

          await new Promise((r) => setTimeout(r, randomTimeOut()))

          const title = await page.title()
          const targetUrl = new URL(page.url())
          console.log(chalk.green(`Page title is: ${title}`))
          console.log(chalk.blue.bold(`Target URL is: ${targetUrl}`))
          console.log(chalk.bgYellow.black(`Target PATHNAME is: ${targetUrl.pathname}`))

          if (targetUrl.pathname === '/accounts/emailsignup/') {
            console.log(chalk.bgYellow.black.bold('Sign up page. Registration process started'))
          }

          await new Promise((r) => setTimeout(r, randomTimeOut()))


          const emailOrPhone = await page.$('input[name="emailOrPhone"]')
          const fullName = await page.$('input[name="fullName"]')
          const username = await page.$('input[name="username"]')
          const password = await page.$('input[name="password"]')

          const countryName = 'Poland'

          if (emailOrPhone) {
            console.log('start filling form')
            await emailOrPhone.click()

            let phoneFromService

            try {
              phoneFromService = await getPhoneNumber(
                getIsoCodeFromCountryName(countryName),
                'opt16'
              )
            } catch (error) {
              console.error('Error fetching phone number:', error)
            }

            console.log(chalk.bgYellow.black('Phone number from service:'))
            console.log(chalk.bgYellow.black.bold(phoneFromService.phoneNumber))
            console.log(chalk.bgYellow.black.bold(phoneFromService.orderId))

            await new Promise(r => setTimeout(r, randomTimeOut()))
            // await page.type('input[name="emailOrPhone"]', profile.email, { delay: randomDelay() })
            await page.type(
              'input[name="emailOrPhone"]',
              "+48"+phoneFromService.phoneNumber,
              { delay: randomDelay() }
            )

            await new Promise((r) => setTimeout(r, randomTimeOut()))

            await fullName.click()
            await new Promise((r) => setTimeout(r, randomTimeOut()))
            await page.type('input[name="fullName"]', profile.fullName, { delay: randomDelay() })
            await new Promise((r) => setTimeout(r, randomTimeOut()))

            await username.click()
            await new Promise((r) => setTimeout(r, randomTimeOut()))
            await page.type('input[name="username"]', profile.username, { delay: randomDelay() })
            await new Promise((r) => setTimeout(r, randomTimeOut()))

            await password.click()
            await new Promise((r) => setTimeout(r, randomTimeOut()))
            await page.type('input[name="password"]', profile.password, { delay: randomDelay() })
            await new Promise((r) => setTimeout(r, randomTimeOut()))

            // Submit the form using XPath
            await page.evaluate(() => {
              const submitButton = document.evaluate(
                '/html/body/div[2]/div/div/div[2]/div/div/div[1]/section/main/div/div/div[1]/div[2]/form/div[9]/div/button',
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
              ).singleNodeValue
              if (submitButton) {
                console.log('Submit button founded')
                // submitButton.click()
                submitButton.addEventListener('click', async (event) => {
                  console.log('Submit button clicked!', event)
                  try {
                    const response = await waitForApiResponse(
                      () => phoneFromService.orderId,
                      (response) => response.success, // Condition to check in the API response
                      30000, // Timeout in milliseconds
                      1000 // Interval in milliseconds
                    );

                    console.log('Condition met, received response:', response);
                  } catch (error) {
                    console.error('Error waiting for API response:', error.message);
                  }

                })

              }
            })




          }
        }
      }
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}

async function fetchProfiles() {
  try {
    const response = await axios.get(process.env.HOST + process.env.NOT_REG_PROFILES)
    console.log('Profiles:', response.data.data)
    return response.data.data
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
}

async function waitForApiResponse(
  orderId,
  getApiResponse,
  condition,
  timeout = 30000,
  interval = 1000
) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const response = await receiveSms(orderId)
    if (condition(response)) {
      return response;
    }
    await new Promise((resolve) => setTimeout(resolve, interval)) // Wait for the specified interval before checking again
  }

  throw new Error('Condition not met within timeout');
}

runRegistration().then(() => console.log('Registration process finished!!!'))
