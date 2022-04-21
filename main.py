from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from urllib.parse import urlparse, parse_qs
import ujson
import time

login = ""  # логин аккаунта
password = ""  # пароль

webdriver_path = "/Users/korolevsky/Documents/chromedriver"  # путь до вебдрайвера
url = "https://oauth.vk.com/authorize?client_id=6831669&scope=228573151&redirect_uri=close.html&display=page&response_type=token&revoke=1"  # ссылка на получение токена


chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument('--no-sandbox')

driver = webdriver.Chrome(webdriver_path, options=chrome_options)  # создаем вебдрайвер
driver.get("https://vk.com/")  # открываем vk.com

driver.find_element("xpath", '//button[@class="FlatButton FlatButton--primary FlatButton--size-l FlatButton--wide VkIdForm__button VkIdForm__signInButton"]').click()  # переходим на страницу авторизации
time.sleep(0.5)  # ждем пока вк прогрузит страницу

driver.find_element("xpath", '//input[@name="login"]').send_keys(login)  # вводим логин
driver.find_element("xpath", '//button[@type="submit"]').click()  # переходим далее
time.sleep(0.5)  # ждем пока вк прогрузит страницу

driver.find_element("xpath", '//input[@name="password"]').send_keys(password)  # вводим пароль
driver.find_element("xpath", '//button[@type="submit"]').click()  # авторизуемся
time.sleep(0.5)  # опять ждем пока вк прогрузит страницу....

driver.get(url)  # получаем страницу для получения токена
driver.find_element("xpath", '//button[@class="flat_button fl_r button_indent"]').click()  # соглашаемся на получение токена

data = parse_qs(urlparse(driver.current_url).fragment)  # получаем хэш из ссылки на страницу
response = {
    "token": data.get('access_token')[0],  # парсим токен
    "expires_in": int(data.get('expires_in')[0]) + int(time.time())  # парсим время до которого будет действовать токен
}

print(ujson.encode(response))  # выводим результат
driver.quit()  # закрываем вебдрайвер
