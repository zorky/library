import requests

url_authent = 'http://api.dev.univ-paris8.fr/api-token-auth/'
url_feed = 'http://api.dev.univ-paris8.fr/helpdesk/newsfeed'
user = 'oduval02'
pwd = 'oduval02'
headers = {'Accept': 'application/json', 'Content-Type': 'application/json'}
# headers = {'Authorization': 'Token 9054f7aa9305e012b3c2300408c3dfdf390fcddf'}
r = requests.post(url_authent, json={'password': pwd, 'username': user}, headers=headers)
# print(r.status_code, r.reason)
# print(r.json())
json = r.json()
token = json["token"]

jwt = 'JWT {}'.format(token)
headers = {'Accept': 'application/json',
           'Content-Type': 'application/json',
           'Authorization': jwt}
r = requests.get(url_feed, headers=headers)
print(r.json())