import ujson
import time
from selenium import webdriver
from urllib.parse import urlparse, parse_qs
from selenium.webdriver.chrome.options import Options

webdriver_path = "/Users/korolevsky/Documents/chromedriver"  # путь до webdriver
url = "https://oauth.vk.com/authorize?client_id=6831669&scope=228573151&redirect_uri=close.html&display=page&response_type=token&revoke=1"  # ссылка на получение токена

lgn = ""  # логин пользователя
pswd = ""  # пароль пользователя

# ДАЛЬШЕ КОД ПОЛУЧЕНИЯ

chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument('--no-sandbox')

driver = webdriver.Chrome(webdriver_path, options=chrome_options)  # Подключаем движок Chrome
driver.get(url)  # Получаем страницу oauth.vk.com

username = '//*[@id="login_submit"]/div/div/input[7]'  # xpath поля ввода логина
password = '//*[@id="login_submit"]/div/div/input[8]'  # xpath поля ввода пароля
login = '//*[@id="install_allow"]'  # кнопка авторизации
button = '//*[@class="flat_button fl_r button_indent"]'  # кнопка получения токена

driver.find_element_by_xpath(username).send_keys(lgn)  # вводим логин
driver.find_element_by_xpath(password).send_keys(pswd)  # вводим пароль
driver.find_element_by_xpath(login).click()  # нажимаем кнопку для авторизации
driver.find_element_by_xpath(button).click()  # после редиректа нажимаем кнопку для получения токена

data = parse_qs(urlparse(driver.current_url).fragment)  # получаем хэш из ссылки на страницу
response = {
    "token": data.get('access_token')[0],  # парсим токен
    "expires_in": int(data.get('expires_in')[0]) + int(time.time())  # парсим время до которого будет действовать токен
}

print(ujson.encode(response))  # выводим результат
