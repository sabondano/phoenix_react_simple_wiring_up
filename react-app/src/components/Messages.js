import React from 'react';

export const Messages = ({messages}) => {
  console.log(messages)
  return (
    <div>
      {
        messages.map( (message, index) => {
          return (
            <div key={index}>{message.body}</div>
          )
        })
      }
    </div>
  )
}

export default Messages;
