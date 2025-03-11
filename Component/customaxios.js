import axios from "axios";

const customaxios = axios.create({
  baseURL: "http://192.168.0.105:3000"
})

export default customaxios;