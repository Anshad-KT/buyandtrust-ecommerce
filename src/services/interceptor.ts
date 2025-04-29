 
import axios from "axios";

axios.interceptors.request.use((request) => {
    request.withCredentials = true;
    
    return request;
});
