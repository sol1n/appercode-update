const axios = require('axios');
const nunjucks = require('nunjucks');
const readline = require('readline-sync');

var apiBase,
    apiDomain,
    projectName,
    login,
    password;

apiBase = readline.question("Appercode url [https://api.appercode.com]: ");
apiBase = apiBase || 'https://api.appercode.com';

projectName = readline.question("Project name [yarmarkaleroymerlin]: ");
projectName = projectName || 'yarmarkaleroymerlin';

apiUrl = apiBase + '/' + projectName;

username = readline.question("Username [admin]: ");
username = login || 'admin';

password = readline.question("Password [123456]: ");
password = password || '123456';

axios.post(apiBase + '/v1/' + projectName + '/login', {
  username: username,
  password: password,
  installId: '',
  generateRefreshToken: false
}).then(function (response) {
  //Указываем токен сессии для всех запросов
  axios.defaults.headers.common['X-Appercode-Session-Token'] = response.data.sessionId;

  var schemaId = 'Suppliers';

  // Получаем список элементов с импортированными полями
  axios.post(apiBase + '/v1/' + projectName + '/objects/' + schemaId + '/query', {
    take: -1,
    include: [
      'id', 'imageFileId', 'company', 'directions', 'place', 'site', 'catalog'
    ]
  }).then(function (response) {
    response.data.forEach(function(element) {
      // Генерируем html-описание из шаблона
      var html = nunjucks.render('templates/description.html', element);

      // Сохраняем в поле элемента description
      axios.put(apiBase + '/v1/' + projectName + '/objects/' + schemaId + '/' + element.id, {
        description: html
      }).then(function (response) {
        console.log('Обновлен элемент https://web.appercode.com/yarmarkaleroymerlin/Suppliers/' + element.id + '/edit');
      }).catch(function (error) {
        console.log(error);
      });
    })
  }).catch(function (error) {
    console.log(error);
  });
}).catch(function (error) {
  console.log(error);
});