import Vars from '../vars';

import {toast} from 'react-toastify';

const server = {
  url: Vars.serverAddress,

  options: (method: string, body?: {}) => {
    // console.log(body);
    const options: RequestInit = {
      method,
      mode: 'cors',
      headers: {
        Accept: 'application.json',
        'Content-Type': 'application/json',
        accessToken: localStorage.getItem('accessToken') as string,
      },
      cache: 'default',
      credentials: 'include',
    };

    if (body) options.body = JSON.stringify(body);

    return options;
  },
};

const methods = {
  post: (route: string, body?: {}) =>{
    return fetch(`${server.url}/${route}`, server.options('post', body))
      .then(async (res) => {
        return {
          ...(await res.json().then((res) => res)),
          status: res.status,
        };
      })
      .catch(() => false)
  },

  read: (route: string) =>
    fetch(`${server.url}/${route}`, server.options('get'))
      .then(async (res) => {
        return {
          ...(await res
            .json()
            .then((res) => res)
            .catch(() => false)),
          status: res.status,
        };
      })
      .catch((err) => err),

  updateFile: (route: string, body?: {}) =>
    fetch(`${server.url}/${route}`, {
      method: 'put',
      credentials: 'include',
      body: JSON.stringify(body),
    })
      .then(async (res) => {
        return {
          ...(await res
            .json()
            .then((res) => res)
            .catch(() => false)),
          status: res.status,
        };
      })
      .catch((err) => false),

  update: (route: string, body?: {}) =>{
      // console.log('update route', route)
    return fetch(`${server.url}/${route}`, server.options('put', body))
      .then(async (res) => {
        return {
          ...(await res
            .json()
            .then((res) => res)
            .catch(() => false)),
          status: res.status,
        };
      })
      .catch((err) => false)
  },

  remove: (route: string, body?: {}) =>
    fetch(`${server.url}/${route}`, server.options('delete', body))
      .then(async (res) => {
        return {
          ...(await res
            .json()
            .then((res) => res)
            .catch(() => false)),
          status: res.status,
        };
      })
      .catch((err) => false),
};

const redirect = (path: string)=>{
  let newLocation = `${location.href.split(':')[0]}://${location.hostname}:${location.port}${path}`;
  // console.log({newLocation});
  window.location.href = newLocation;
}
const sleep = (t:number)=> new Promise(resolve => setTimeout(resolve, t));

// I could've used a proxy but this is so much easier
const handleRequest = async (
  method: 'post' | 'read' | 'update' | 'updateFile' | 'remove',
  route: string,
  body?: {}
) => {

  // this makes it "unpure" function. but still a clean solution
  if(route[0] == '/'){route = route.slice(1);}


  let accessTokenRenewal = false;
  let response = null;
  do {
    try{
      response = await methods[method](route, body);
    }catch(err){
      toast.error(`client error while trying to make a request. route:${route}`)
      return { err: 'connectionError', route };
    }
    // console.log({redirect: response.redirect, data: response.data});

    // TODO: probably send the falsy response to react-query
    if (response.status != 200) {
      // toast.error(`${response}. route: ${route}`)
      return { err: 'serverError' };
    }

    accessTokenRenewal = false;
    if (response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken);

      // if there is a redirection, then the access token was not refreshed, it's the first one
      if(response.redirect){
        redirect(response.redirect);
        break;// don't remove this, JS is... ;)
      }

      // the server sent a new accessToken
      // the user either doesn't have an Access Token or it's invalid
      accessTokenRenewal = true;
    }

    if (response?.redirect) {
      // I need a way to change layout without using react-router
      redirect(response.redirect);
    }

  }while (accessTokenRenewal)

  return response;
};

export default handleRequest;
