import "./App.css";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
// Outside the App component, create a function to extract unique titles
function getUniqueTitles(chatData) {
  const uniqueTitles = new Set();
  chatData.forEach((chat) => {
    uniqueTitles.add(chat.title);
  });
  return Array.from(uniqueTitles);
}

function App() {
  const [value, setValue] = useState(null);
  const [message, setMessage] = useState(null);
  const [previousChat, setPreviousChat] = useState([]);
  const [currentTitle, setCurrentTitle] = useState(null);

  const createNewChat = () => {
    setMessage(null);
    setValue("");
    setCurrentTitle(null);
  };

  const handleClick = (clickedTitle) => {
    setCurrentTitle(clickedTitle);
    setMessage(null);
    setValue("");
  };

  const getMessage = async () => {
    const options = {
      method: "POST",
      body: JSON.stringify({
        message: value,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };
    try {
      const response = await fetch(
        "http://localhost:8000/completions",
        options
      );
      console.log("Response status:", response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setMessage(data.choices[0].message);
      console.log(data);
      // setPreviousChat([]);
    } catch (error) {
      console.log(error);
    }
    //setValue("");
  };

  useEffect(() => {
    if (!currentTitle && value && message) {
      setCurrentTitle(value);
    }
    if (currentTitle && value && message) {
      setPreviousChat((prevChat) => [
        ...prevChat,
        {
          title: currentTitle,
          role: "You",
          content: value,
        },
        {
          title: currentTitle,
          role: message.role,
          content: message.content,
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, currentTitle]);

  // Calculate unique titles outside the component
  const uniqueTitles = getUniqueTitles(previousChat);

  const currentChat = previousChat.filter(
    (prevChat) => prevChat.title === currentTitle
  );

  return (
    <div className="app">
      <section className="side-bar">
        <button onClick={createNewChat}>New Chat</button>
        <ul className="history">
          {uniqueTitles.map((uniqueTitle, index) => (
            <li key={index} onClick={() => handleClick(uniqueTitle)}>
              {uniqueTitle}
            </li>
          ))}
        </ul>
        <nav>
          <p>Frontend Mastery</p>
        </nav>
      </section>
      <section className="main">
        <h1>Masters</h1>
        <ul className="feed">
          {currentChat?.map((chatMessage, index) => (
            <li key={index}>
              <p className="role">{chatMessage.role}</p>
              <ReactMarkdown className="markdown-body">
                {chatMessage.content}
              </ReactMarkdown>
            </li>
          ))}
        </ul>
        <div className="bottom-section">
          <div className="input-container">
            <input value={value} onChange={(e) => setValue(e.target.value)} />
            <button id="submit" onClick={getMessage}>
              submit
            </button>
          </div>
          <p className="info">this is some random text</p>
        </div>
      </section>
    </div>
  );
}

export default App;
