const enterPoints = {
  API_HOST: 'localhost:http://localhost:8080',
  AUTH_HOST: 'localhost:http://localhost:8080/oauth',
  CLIENT_ID: 'localhost:clientId',
  LOCAL: 'localhost:local',
  HEADER_TITLE_NAME: 'localhost:headertitlename',
  COOKIE_SERVER: 'localhost:cookieServer',
  VERSION: 'localhost:version',
  TITLE_NAME: 'localhost:titlename',
  FILE_SERVER: 'localhost:fileserver',
  WEBSOCKET_SERVER: 'localhost:wsserver',
};

export default function getEnterPointsConfig() {
  return enterPoints;
}
