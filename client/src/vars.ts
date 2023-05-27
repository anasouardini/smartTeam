// const serverAddress = 'https://127.0.0.1:2000';
let serverAddress = 'https://smartteams.anasouardini.online:2001';
const location = document.location;
if(location.host.includes('localhost:') || location.host.includes('127.0.0.1:')){
  serverAddress = `${location.protocol}//${location.host.split(':')[0]}:2000`;
}

export default {serverAddress}
