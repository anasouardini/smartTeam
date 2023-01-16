const server = {
  url: 'http://127.0.0.1:2000/',

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
  post: (route: string, body?: {}) =>
    fetch(server.url + route, server.options('post', body))
      .then(async (res) => {
        return {
          ...(await res.json().then((res) => res)),
          status: res.status,
        };
      })
      .catch(() => false),

  get: (route: string) =>
    fetch(server.url + route, server.options('get'))
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
    fetch(server.url + route, {
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

  update: (route: string, body?: {}) =>
    fetch(server.url + route, server.options('put', body))
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

  remove: (route: string, body?: {}) =>
    fetch(server.url + route, server.options('delete', body))
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

const handleRequest = async (
  method: 'post' | 'get' | 'update' | 'updateFile' | 'remove',
  route: string,
  body?: {}
) => {
  let accessTokenRenewal = false;
  let response = null;
  do {
    try{
      response = await methods[method](route, body);
    }catch(err){
      console.log('client error while trying to make a request: ', { err: 'connectionError', route });
      return { err: 'connectionError', route };
    }

    if (response.err) {
      console.log('ERROR: ', { data: response, route });
      return response;
    }

    accessTokenRenewal = false;
    if (response?.accessToken) {
      // the user either just logged in or the accessToken is invalid
      localStorage.setItem('accessToken', response?.accessToken);
      accessTokenRenewal = true;
    }

    if (response?.redirect) {
      // I need a way to change layout without using react-router
      console.log('redirecting..', response?.redirect);
      location.replace(response?.redirect);
    }
  }while (accessTokenRenewal)

  return response;
};

export default handleRequest;
