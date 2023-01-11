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

  updateFile: (route: string, body: {}) =>
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

const handleError = async (
  method: 'post' | 'get' | 'update' | 'updateFile' | 'remove',
  route: string,
  body: {}
) => {
  const response = await methods[method](route, body);
  if (!response) {
    return { err: 'noResponse', route};
  }

  if (response.status != 200) {
    console.log({ err: response, route });
    return { err: 'serverError' };
  }

  return response;
};

export default handleError;
