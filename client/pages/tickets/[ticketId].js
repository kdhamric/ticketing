import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const TicketShow = ({ticket}) => {
  const { doRequest, errors} = useRequest({
    url: '/api/orders',
    method: 'post',
    body: {
      ticketId: ticket.id
    },
    onSuccess: (order) => {
      console.log('order', order);
      Router.push('/orders/$[order.id]', `/orders/${order.id}`);

    }
  })
  //console.log(ticket.title)


  return(
    <div>
      <h1>{ticket.title}</h1>
      <h4>Price: {ticket.price}</h4>
      {errors}
      <button onClick={() => doRequest()} className="btn btn-primary">Purchase</button>
    </div>
  )
}

TicketShow.getInitialProps = async (context, client) => {
  const { ticketId } = context.query;
  console.log ('ticketId is ', ticketId)
  const { data } = await client.get(`/api/tickets/${ticketId}`);

  return { ticket: data };
}

export default TicketShow;