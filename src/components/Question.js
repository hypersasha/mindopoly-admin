import React, { useState, useEffect } from "react";
import axios from "axios";

import PushStatus from './StatusPush';

import "../styles.css";

function Form() {
  const [text, setText] = useState("");
  const [correct, setCorrect] = useState("");
  const [bad1, setBad1] = useState("");
  const [bad2, setBad2] = useState("");
  const [bad3, setBad3] = useState("");
  const [type, setType] = useState("Math");
  const [explan, setExplan] = useState("");
  const [ngrok, setNgrok] = useState("https://96405825.ngrok.io");
  const [sendAvailable, setSendAvailable] = useState(true);
  const [catState, setCatState] = useState([]);
  const [questCount, setQuestCount] = useState(0);
  const [pushes, setPushes] = useState([]);

  let naming = {
    Math: "Математика",
    Russian: "Русский язык",
    Literature: "Литература",
    Physics: "Физика",
    Chemistry: "Химия",
    Astronomy: "Астрономия",
    Geography: "География",
    Biology: "Биология",
    History: "История",
    Art: "Искусство",
    Sport: "Спорт",
    Other: "Другое"
  };

  const fetchData = async () => {
    const result = await axios(ngrok + "/api/getCategoriesState");
    console.log(result);
    if (result.data) {
      setCatState(result.data);
      let totalCount = 0;
      result.data.forEach(cat => {
        totalCount += cat.count;
      });
      setQuestCount(totalCount);
    }
  };

  function clearText(text) {
    return text.replace("- [x] ", "").replace("- [ ] ", "");
  }

  function processTrello(text) {

    let strings = text.split("\n");
    let question = strings[0];
    strings.splice(0, 1);

    // process answers
    let badId = 1;
    strings.forEach(answ => {
      if (answ.indexOf("- [x] ") === 0) {
        setCorrect(answ.slice(6));
      } else {
        badId++;
        switch (badId) {
          case 1:
            setBad1(answ.slice(6));
            break;
          case 2:
            setBad2(answ.slice(6));
            break;
          case 3:
            setBad3(answ.slice(6));
            break;
          default:
            setBad1(answ.slice(6));
        }
      }
    });

    return question;
  }

  function clearPushes() {
    setPushes(pushes => {
      if (pushes.length > 1) {
        return pushes.slice(1);
      } else {
        return [];
      }
    });
  }

  useEffect(() => {
    if (ngrok.trim().length > 0) {
      fetchData();
    }
  }, []);

  function addPush() {
    let newPush = <PushStatus key={Math.random() * 100} />;
    setPushes(pushes => [...pushes, newPush]);
    setTimeout(clearPushes, 3000);
  }

  function sendRequest() {
    if (ngrok.trim().length === 0) {
      return false;
    }

    if (sendAvailable === false) {
      return false;
    }

    let data = {
      text: text,
      answers: [correct, bad1, bad2, bad3],
      category: type
    };

    if (explan.trim().length > 0) {
      data["explanation"] = explan;
    }

    console.log(data);

    if (
      text.trim().length > 0 &&
      correct.trim().length > 0 &&
      bad1.trim().length > 0 &&
      bad2.trim().length > 0 &&
      bad3.trim().length > 0
    ) {
      setSendAvailable(false);
      axios
        .post(ngrok + "/api/customQuestion", data)
        .then(response => {
          setSendAvailable(true);
          if (response.data && response.data.code === 200) {
            addPush();
            setBad1("");
            setBad2("");
            setBad3("");
            setCorrect("");
            setText("");
            setExplan("");
            fetchData();
          } else {
            alert("Не удалось добавить вопрос!");
          }
        })
        .catch(err => {
          setSendAvailable(true);
          console.log(err);
          alert("Не удалось добавить вопрос. См. консоль.");
        });
    } else {
      //alert("Нужно ввести вопрос и все 4 ответа.");
    }
  }

  return (
    <div className="form">
      <div className="pushes">{pushes}</div>
      <h2>Добавление вопроса</h2>
      <div className="answers">
        <p className="label">URL Сервера</p>
        <input
          type="text"
          onChange={e => {setNgrok(e.target.value);}}
          value={ngrok}
          placeholder="Например, https://d2a9jf.ngrok.io"
        />
      </div>
      <div className="quest">
        <p className="label">Вопрос</p>
        <textarea
          value={text}
          placeholder="Текст вопроса"
          onChange={e => setText(processTrello(e.target.value))}
        />
      </div>
      <div className="answers">
        <p className="label"> Верный ответ</p>
        <input
          type="text"
          onChange={e => setCorrect(clearText(e.target.value))}
          value={correct}
          placeholder="Ответ"
        />
      </div>
      <div className="answers">
        <p className="label">Неправильные ответы</p>
        <input
          type="text"
          onChange={e => setBad1(clearText(e.target.value))}
          value={bad1}
          placeholder="Ответ"
        />
        <input
          type="text"
          value={bad2}
          onChange={e => setBad2(clearText(e.target.value))}
          placeholder="Ответ"
        />
        <input
          type="text"
          value={bad3}
          onChange={e => setBad3(clearText(e.target.value))}
          placeholder="Ответ"
        />
      </div>
      <div className="quest">
        <p className="label">Пояснение (не обязательно)</p>
        <textarea
          value={explan}
          placeholder="Краткое дополнение к правильному ответу"
          onChange={e => setExplan(e.target.value)}
        />
      </div>
      <div className="type">
        <p className="label">Категория вопроса</p>
        <select value={type} onChange={e => setType(e.target.value)}>
          {catState.map(cat => {
            return (
              <option key={cat.name} value={cat.name}>
                {naming[cat.name]} - {cat.count}
              </option>
            );
          })}
        </select>
      </div>
      <div className="answers">
        <p className="label small">Всего вопросов - {questCount}</p>
      </div>
      <div
        className={"send" + (sendAvailable ? "" : " disabled")}
        onClick={() => sendRequest()}
      >
        Добавить вопрос
      </div>
    </div>
  );
}

export default Form;
