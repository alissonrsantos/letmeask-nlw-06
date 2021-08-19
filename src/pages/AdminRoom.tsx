import Modal from 'react-modal';
import { useHistory, useParams } from "react-router-dom";
import logoImg from "../assets/images/logo.svg";
import deleteImg from "../assets/images/delete.svg";
import checkImg from "../assets/images/check.svg";
import answerImg from "../assets/images/answer.svg";
import { Button } from "../components/Button";
import { RoomCode } from "../components/RoomCode";
import "../styles/room.scss";
import "../styles/modal.scss";
import { Question } from "../components/Question";
import { useRoom } from "../hooks/useRoom";
import { useState } from 'react';
import { database } from '../services/firebase';

type RoomParams = {
    id: string,
}

export function AdminRoom() {
    const params = useParams<RoomParams>();
    const roomId = params.id;
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const { questions, title } = useRoom(roomId);
    const history = useHistory();

    async function handleEndRoom() {
        await database.ref(`rooms/${roomId}`).update({ 
            endedAt: new Date(),
        });

        history.push("/");
    }

    async function handleDeleteQuestion(questionId: string) {
        await database.ref(`rooms/${roomId}/questions/${questionId}`).remove();

        setModalIsOpen(false);
    }

   function handleOpenModal() {
       setModalIsOpen(true);
   }

   function closeModal() {
       setModalIsOpen(false);
   }

   async function handleCheckQuestionAsAnswered(questionId: string) {
        await database.ref(`rooms/${roomId}/questions/${questionId}`).update({ 
            isAnswered: true,
        });
   }

   async function handleHighlightQuestion(questionId: string) {
        await database.ref(`rooms/${roomId}/questions/${questionId}`).update({ 
            isHighlighted: true,
        });
   }

    return (
        <div id="page-room">
            <header>
                <div className="content">
                    <img src={logoImg} alt="Logo do letmeask" />
                    <div>
                        <RoomCode code={roomId} />
                        <Button isOutlined onClick={handleOpenModal}>Encerrar sala</Button>
                    </div>
                </div>
            </header>
            <main>
                <div className="room-title">
                    <h1>Sala {title}</h1>
                    { questions.length > 0 && <span>{ questions.length } pergunta(s)</span> }
                </div>
               <div className="question-list">
                    {questions.map((question) => {
                        return (
                           <>
                                <Question 
                                    key={question.id}
                                    content={question.content}
                                    author={question.author}
                                    isAnswered={question.isAnswered}
                                    isHighlighted={question.isHighlighted}
                                >
                                   {!question.isAnswered && (
                                       <>
                                            <button
                                                type="button"
                                                onClick={() => handleHighlightQuestion(question.id)}
                                            >
                                                <img src={checkImg} alt="Marcar pergunta como respondida" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleCheckQuestionAsAnswered(question.id)}
                                            >
                                                <img src={answerImg} alt="Dar destaque a pergunta" />
                                            </button>
                                       </>
                                   )}
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteQuestion(question.id)}
                                    >
                                        <img src={deleteImg} alt="Remover pergunta" />
                                    </button>
                                </Question>
                                <Modal 
                                    className="modal"
                                    isOpen={modalIsOpen}
                                    onRequestClose={closeModal}
                                >
                                    <div className="background-modal">
                                        <div className="close-modal" onClick={handleEndRoom}>
                                            <img src={deleteImg} className="trash" alt="Remover pergunta" />
                                        </div>
                                        <h3>Encerrar sala</h3>
                                        <p>Tem certeza que deseja encerrar esta sala?</p>
                                        <div className="container-button">
                                            <button className="cancel" onClick={closeModal}>Cancelar</button>
                                            <button className="confirm" onClick={handleEndRoom}>Sim, encerrar</button>
                                        </div>
                                    </div>
                                </Modal>
                           </>
                        );
                    })}
               </div>
            </main>
        </div>
    );
}