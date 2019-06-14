const enterPoints = {
  API_HOST: 'localhost:http://localhost:8080', // api base url
  AUTH_HOST: 'localhost:http://localhost:8080/oauth', // login url
  CLIENT_ID: 'localhost:clientId', // unused
  LOCAL: 'localhost:local',
  HEADER_TITLE_NAME: 'localhost:headertitlename', // unused
  COOKIE_SERVER: 'localhost:cookieServer',
  VERSION: 'localhost:version',
  TITLE_NAME: 'localhost:titlename', // html title
  FILE_SERVER: 'localhost:fileserver', // unused
  WEBSOCKET_SERVER: 'localhost:wsserver', // websocket server
  APIM_GATEWAY: 'localhost:apimgateway',
  EMAIL_BLACK_LIST: 'localhost:emailblacklist',
};

export default function getEnterPointsConfig() {
  return enterPoints;
}
