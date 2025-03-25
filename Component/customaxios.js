import axios from "axios";

const customaxios = axios.create({
  baseURL: "http://:3000"
})

export default customaxios;
