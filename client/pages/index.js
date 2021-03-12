import useRequest from '../hooks/use-request';
import Link from 'next/link';



const LandingPage = ({currentUser, tickets}) => {
  //console.log('current user is: ', currentUser)
  //console.log(tickets)

  const ticketList = tickets.map(ticket => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`} className="nav-item">
            <a className="nav-link">Go</a>
          </Link>
        </td>
      </tr>
    )
  })


  if (!currentUser) return (<h1>You are NOT signed in</h1>);

  return (
    <div>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <td>Title</td>
            <td>Price</td>
            <td>Link</td>
          </tr>
        </thead>
        <tbody>
          {ticketList}
        </tbody>
      </table>
    </div>
  )

};



LandingPage.getInitialProps = async ( context, client, currentUser ) => {
  const { data } = await client.get('/api/tickets');
  console.log(data)
  return { tickets: data };

  /*if (typeof window === 'undefined') {
    //we are on the server
    //we need to get the cookie from the client and pass it on this request being sent by nextjs.  
    //Easy way is to just pass all the headers from the incoming request.
    const response = await axios.get(
        'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser', { 
          headers:  req.headers 
        }
      );
    return response.data;
  } else {
    //we are on the browser
    //can use a base url of ''
    const { data } = await axios.get('/api/users/currentuser');
    return data;
  }*/

  
  
  /*
  try {
    //ingress-nginx-controller.ingress-nginx.svc.cluster.local

    const response = await axios.get('http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser');
    return response.data;

  } catch(err) {
    console.log('Error on calling url in getInitialProps')
    return {}
  }
  */
};

export default LandingPage;