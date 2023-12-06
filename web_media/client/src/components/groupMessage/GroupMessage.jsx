import React from "react";
import Message from "../../components/messsagev2/Message";
import { useEffect, useRef } from "react";
const GroupByMessages = ({ messages, currentUser, handleEmotionSelect, socket }) => {
    const scrollRef = useRef();
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    let groupedMessages = []
    let senderMessages = []
    let receiverMessages = []
    let i = 0
    while (i < messages.length) {
      console.dir(messages[i])
      const currMessage = messages[i];
      // const nextMessage = messages[i + 1];
      if (currMessage.senderId === currentUser.id) {
          senderMessages.push(
            <div className="message-sent" ref={scrollRef}>
                  <Message message={currMessage} own={true} testManual={false} index={i} handleEmotionSelect={handleEmotionSelect} socket={socket} />
            </div>
        )
        let j = i + 1
        while (j < messages.length && messages[j].senderId === currentUser.id) { 
            senderMessages.push(
            <div className="message-sent" ref={scrollRef}>
                    <Message message={messages[j]} own={true} testManual={false} index={j} handleEmotionSelect={handleEmotionSelect} socket={socket} />
            </div>
          )
          j = j + 1
        }
        const groupedSenderMessages = (
          <div className="message-group-sent">
            {senderMessages.map((m, index) => (
              m
            ))}
          </div>)
        groupedMessages.push(groupedSenderMessages)
        i = j
        senderMessages = []
      } else {
          receiverMessages.push(
        <div className="message-received" ref={scrollRef}>
                  <Message message={currMessage} own={false} testManual={false} index={i} handleEmotionSelect={handleEmotionSelect} socket={socket} />
                  </div>
        )
        let j = i + 1
        
        while (j < messages.length && messages[j].senderId !== currentUser.id) { 
            receiverMessages.push(
                <div className="message-received" ref={scrollRef}>
                    <Message message={messages[j]} own={false} testManual={false} index={j} handleEmotionSelect={handleEmotionSelect} socket={socket} />
                    </div>
          )
          j = j + 1
        }
        const groupedReceiverMessages = (
          <div className="message-group-received">
            <div>
              <img src="https://adorable.io/wp-content/uploads/2021/03/196655.jpeg" />
            </div>
            <div>
              {receiverMessages.map((m, index) => (
                m
              ))}
            </div>
          </div>)
        groupedMessages.push(groupedReceiverMessages)
        i = j
        receiverMessages = []
      }
      // if (currMessage.senderId === currentUser.id && 
      //   nextMessage.senderId === currentUser.id) {
      //   groupedSenderMessages.push(
      //     <Message message={m} own={m.senderId === currentUser.id} testManual={false}/>
      //   )
      // }
    }   
    return groupedMessages;
}
export default GroupByMessages