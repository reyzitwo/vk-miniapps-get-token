require("chromedriver");
const { Builder, By } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const account = { login: "", password: "" };

const chromeOptions = new chrome.Options();
chromeOptions.addArguments("--remote-debugging-port=9222");
chromeOptions.addArguments("--headless");
chromeOptions.addArguments("--no-sandbox");

const driver = new Builder()
  .forBrowser("chrome")
  .setChromeOptions(chromeOptions)
  .build();

let isLogin = false;
login();

async function login() {
  await driver.get("https://vk.com/"); // открываем vk.com

  (await lazyDriver())
    .findElement(
      By.xpath(
        '//button[@class="FlatButton FlatButton--primary FlatButton--size-l FlatButton--wide VkIdForm__button VkIdForm__signInButton"]',
      ),
    )
    .click();

  (await lazyDriver())
    .findElement(By.xpath('//input[@name="login"]'))
    .sendKeys(account.login);

  (await lazyDriver())
    .findElement(By.xpath('//button[@type="submit"]'))
    .click();

  (await lazyDriver())
    .findElement(
      By.xpath('//button[@data-test-id="other-verification-methods"]'),
    )
    .click();

  (await lazyDriver())
    .findElement(By.xpath('//div[@data-test-id="verificationMethod_password"]'))
    .click();

  (await lazyDriver())
    .findElement(By.xpath('//input[@name="password"]'))
    .sendKeys(account.password);

  (await lazyDriver())
    .findElement(By.xpath('//button[@type="submit"]'))
    .click();

  isLogin = true;
}

async function getToken(client_id) {
  if (!isLogin) {
    console.log(
      `[${getTimestamp()}] The process of logging into an account via selenuim...`,
    );

    return setTimeout(() => getToken(client_id), 5 * 1000);
  }

  (await lazyDriver()).get(
    `https://oauth.vk.com/authorize?client_id=${client_id}&scope=228573151&redirect_uri=close.html&display=page&response_type=token&revoke=1`,
  );
  await driver
    .findElement(By.xpath('//button[@class="flat_button fl_r button_indent"]'))
    .click();

  const response = parseOauthVK(await driver.getCurrentUrl());
  console.log(response);
}

function lazyDriver() {
  return new Promise((res) => setTimeout(() => res(driver), 4000));
}

getToken(6831669);

function getTimestamp() {
  return Math.floor(new Date().getTime() / 1000);
}

function parseOauthVK(url) {
  const paramsString = url.split("#")[1];
  const paramsArray = paramsString.split("&");

  const params = {};

  paramsArray.forEach((param) => {
    const [key, value] = param.split("=");
    params[key] = value;
  });

  return {
    ...params,
    expires_in: getTimestamp() + Number(params.expires_in),
    user_id: Number(params.user_id),
  };
}
