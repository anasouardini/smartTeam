// const serverAddress = 'https://127.0.0.1:2000';
let serverAddress = 'https://smartteams.anasouardini.online:2001';
if(document.location.host.includes('localhost:') && document.location.host.includes('127.0.0.1:')){
  serverAddress = `${document.location.host.split(':')[0]}:2000`;
}

export default {serverAddress}
