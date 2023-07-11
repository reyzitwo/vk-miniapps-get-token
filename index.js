const webdriver = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const path = require("path");

const client_id = 6831669;
const login = ""; // логин аккаунта
const password = ""; // пароль

const url = `https://oauth.vk.com/authorize?client_id=${client_id}&scope=228573151&redirect_uri=close.html&display=page&response_type=token&revoke=1`; // ссылка на получение токена

const chromeOptions = new chrome.Options();
chromeOptions.addArguments("--headless");
chromeOptions.addArguments("--no-sandbox");

const service = new chrome.ServiceBuilder(
  path.join(__dirname, "./chromedriver")
);

const driver = new webdriver.Builder()
  .forBrowser("chrome")
  .setChromeService(service)
  .setChromeOptions(chromeOptions)
  .build(); // создаем вебдрайвер

(async function () {
  try {
    await driver.get("https://vk.com/"); // открываем vk.com

    await driver
      .findElement(
        webdriver.By.xpath(
          '//button[@class="FlatButton FlatButton--primary FlatButton--size-l FlatButton--wide VkIdForm__button VkIdForm__signInButton"]'
        )
      )
      .click(); // переходим на страницу авторизации
    await sleep(4000); // ждем пока вк прогрузит страницу

    await driver
      .findElement(webdriver.By.xpath('//input[@name="login"]'))
      .sendKeys(login); // вводим логин
    await driver
      .findElement(webdriver.By.xpath('//button[@type="submit"]'))
      .click(); // переходим далее
    await sleep(4000);

    await driver
      .findElement(webdriver.By.xpath('//input[@name="password"]'))
      .sendKeys(password); // вводим пароль
    await driver
      .findElement(webdriver.By.xpath('//button[@type="submit"]'))
      .click(); // авторизуемся
    await sleep(2000);

    await driver.get(url); // получаем страницу для получения токена
    await driver
      .findElement(
        webdriver.By.xpath('//button[@class="flat_button fl_r button_indent"]')
      )
      .click(); // соглашаемся на получение токена

    const response = parseOauthVK(await driver.getCurrentUrl());

    console.log(response);
  } finally {
    await driver.quit(); // закрываем вебдрайвер
  }
})();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseOauthVK(url) {
  const paramsString = url.split("#")[1]; // Получаем строку параметров после символа '#'
  const paramsArray = paramsString.split("&"); // Разбиваем строку на массив параметров

  // Создаем пустой объект, в который будем добавлять параметры
  const params = {};

  // Проходимся по каждому параметру и добавляем его в объект params
  paramsArray.forEach((param) => {
    const [key, value] = param.split("="); // Разбиваем параметр на ключ и значение
    params[key] = value; // Добавляем параметр в объект params
  });

  return {
    ...params,
    expires_in: Number(params.expires_in),
    user_id: Number(params.user_id),
  };
}
