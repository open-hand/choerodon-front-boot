const entryPoints = {
  API_HOST: 'localhost:http://localhost:8080',
  AUTH_HOST: 'localhost:http://localhost:8080/oauth',
  CLIENT_ID: 'localhost:clientId',
  LOCAL: 'localhost:local',
  HEADER_TITLE_NAME: 'localhost:headertitlename',
  COOKIE_SERVER: 'localhost:cookieServer',
  VERSION: 'localhost:version',
  TITLE_NAME: 'localhost:titlename',
};

export default function getEntryPointsConfig(key) {
  return JSON.stringify(process.env[key] || entryPoints[key]);
};
