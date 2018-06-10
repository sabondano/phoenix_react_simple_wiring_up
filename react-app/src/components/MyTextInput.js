import React from 'react';

export const MyTextInput = ({onEnter}) => {
  return (
    <input
      onKeyPress={
        e => {
          if (e.key === "Enter") {
            onEnter(e.target.value);
          }
        }
      }
    />
  )
}

export default MyTextInput;
