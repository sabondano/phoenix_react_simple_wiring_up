import React, { Component } from 'react';
import './App.css';
import { Socket, Presence } from 'phoenix';
import MyTextInput from './components/MyTextInput';
import Messages from './components/Messages';

let socket = new Socket("ws://0.0.0.0:4000/socket", {params: {userToken: "123"}});
socket.connect();

// Now that you are connected, you can join channels with a topic:
let channel = socket.channel("room:lobby", {})
channel.join()
  .receive("ok", resp => { console.log("Joined successfully", resp) })
  .receive("error", resp => { console.log("Unable to join", resp) })

channel.push("new_msg", {body: "hello"}, 10000)
  .receive("ok", (msg) => console.log("created message", msg) )
  .receive("error", (reasons) => console.log("create failed", reasons) )
  .receive("timeout", () => console.log("Networking issue...") )

let messages = []
channel.on("new_msg", msg => {
  console.log("Got message", msg)
  messages = [...messages, msg]
})

channel.on("something", msg => console.log("Got something", msg) )

// detect if user has joined for the 1st time or from another tab/device
let onJoin = (id, current, newPres) => {
  if(!current){
    console.log("user has entered for the first time", newPres)
  } else {
    console.log("user additional presence", newPres)
  }
}
// detect if user has left from all tabs/devices, or is still present
let onLeave = (id, current, leftPres) => {
  if(current.metas.length === 0){
    console.log("user has left from all devices", leftPres)
  } else {
    console.log("user left from a device", leftPres)
  }
}

let presences = {} // client's initial empty presence state
// receive initial presence data from server, sent after join
channel.on("presence_state", state => {
  presences = Presence.syncState(presences, state, onJoin, onLeave);
  console.log(Presence.list(presences));
})

 // receive "presence_diff" from server, containing join/leave events
 channel.on("presence_diff", diff => {
   presences = Presence.syncDiff(presences, diff, onJoin, onLeave)
   console.log({users: Presence.list(presences)})
 })

class App extends Component {
  constructor () {
    super()
    this.state = {
      messages: []
    }

   this.onMessageReceived = this.onMessageReceived.bind(this)
   channel.on("new_msg", this.onMessageReceived)
  }

  onMessageReceived (msg) {
    const newState = [...this.state.messages, msg]
    this.setState(newState)
  }

  render() {
    return (
      <div className="App">
        <MyTextInput
          onEnter={ message =>
            channel.push("new_msg", {body: message}, 10000)
          }
        />
        <Messages messages={messages}/>
      </div>
    );
  }
}

export default App;
