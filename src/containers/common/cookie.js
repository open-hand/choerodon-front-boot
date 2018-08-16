import Cookies from 'universal-cookie';

const cookies = new Cookies();

const setCookie = (name, value, option) => cookies.set(name, value, option);

const getCookie = (name, option) => cookies.get(name, option);

const removeCookie = (name, option) => cookies.remove(name, option);

export {
  setCookie,
  getCookie,
  removeCookie,
};
