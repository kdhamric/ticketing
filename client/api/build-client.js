import axios from 'axios';

const BuildClient = ({ req }) => {


  if (typeof window === 'undefined') {
    //we are on the server
    //we need to get the cookie from the client and pass it on this request being sent by nextjs.  
    //Easy way is to just pass all the headers from the incoming request.
    return axios.create ({
        baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local', 
        headers:  req.headers    
    });

  } else {
    //we are on the browser
    //can use a base url of ''
    return axios.create({
      baseURL: '/'
    });

  }
};

export default BuildClient;