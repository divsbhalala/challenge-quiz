import React, { useEffect, useState } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Progress } from 'reactstrap'
import { FaStar } from 'react-icons/fa';

import './App.scss'

import * as questionAction from './Actions/questionAction'

function App ({ actions, currentQuestion, allQuestion, correctAnswer, wrongAnswer, currentIndex }) {
  const [options, setOptions] = useState([])
  const [displayQuestion, setDisplayQuestion] = useState({})
  const [ansStatus, setAnsStatus] = useState({ given: false, right: false })
  const [givenAnswer, setGivenAns] = useState({})
  const [progressBarWidth, setWidth] = useState({ topBar: 0 })

  useEffect(() => {
    if (allQuestion.length === 0) {
      actions.getQuestions()
    }

    if (currentQuestion && Object.keys(currentQuestion).length) {
      let difficulty = currentQuestion.difficulty.toLowerCase()
      setDisplayQuestion({
        ...currentQuestion,
        defaultRate: [3, 3, 3, 3, 3],
        rate: difficulty === 'medium' ? 2 : (difficulty === 'hard' ? 3 : 1)
      })
      let findCorrect = correctAnswer.findIndex((value) => value.correct_answer === currentQuestion.correct_answer)
      let findWrong = findCorrect === -1 ? wrongAnswer.findIndex((value) => value.correct_answer === currentQuestion.correct_answer) : -1
      if (findCorrect !== -1) {
        setAnsStatus({ given: true, right: true })
      } else if (findWrong !== -1) {
        setAnsStatus({ given: true, right: false })
      } else {
        setAnsStatus({ given: false, right: false })
      }

      if (findCorrect === -1 && findWrong === -1) {
        let Options = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer]
        Options = questionAction.shuffle(Options)
        let newOptions = []
        let i = 0

        Options.forEach((value, index) => {
          if (index % 2 === 0) {
            newOptions[i] = [value]
            i++
          } else {
            newOptions[i - 1].push(value)
          }
        })
        setOptions([...newOptions])
      }

      if (currentIndex <= allQuestion.length && findCorrect === -1 && findWrong === -1) {
        let topBar = (currentIndex * 100) / allQuestion.length
        let bottomMiddleBar = (correctAnswer.length * 100) / (currentIndex - 1)
        let bottomInitialBar = (correctAnswer.length * 100) / allQuestion.length
        let bottomLastBar = ((correctAnswer.length + (allQuestion.length - (currentIndex - 1))) * 100) / allQuestion.length
        setWidth({ topBar: topBar, bottomMiddleBar, bottomInitialBar, bottomLastBar })
      }
    }
  }, [currentQuestion, correctAnswer, wrongAnswer, currentIndex, actions, allQuestion])

  const giveAnswer = (answer) => {
    actions.giveAnswer(answer, currentQuestion)
    setGivenAns({ answer: answer, question: currentQuestion.question })
  }

  const nextQuestion = () => {
    actions.nextQuestion()
  }

  const restart = () => {
    actions.getQuestions()
    setDisplayQuestion({})
    setAnsStatus({ given: false, right: false })
    setGivenAns({})
    setWidth({ topBar: 0 })
  }

  return (
    <div className='App'>
      <div className='container position-relative'>
        <div className='progress top-bar'>
          <Progress bar className='top-bar-progress' value={progressBarWidth.topBar} />
        </div>
        <div className='App-header'>
          {
            allQuestion.length < currentIndex
              ? <div className='w-100'>
                <div>Thank You you taking participation on quiz challenge!</div>
                <div><button className='button' onClick={() => restart()}>Restart</button></div>
              </div>
              : <div className='w-100'>
                <div className='text-left w-100 pt-4'>
                  <p className='m-0 cat-type'>Question {currentIndex} of {allQuestion.length}</p>
                  <p className='m-0 category-wrapper'>{displayQuestion.category}</p>
                  <div>
                    {displayQuestion.defaultRate && displayQuestion.defaultRate.map((value, index) => <FaStar key={index} className={`fa fa-star ${index + 1 <= displayQuestion.rate ? "checked": "unchecked"}`} />)}
                  </div>
                </div>
                <p className='question-text pt-4'> {displayQuestion.question}</p>
                <div>{options.map((item, index) => {
                  return <div key={'btn-wrapper' + index} className='btn-wrapper'>
                    {item.map(value =>
                      <button
                        key={'btn' + value}
                        className={`m-3 button ${ansStatus.given ? (givenAnswer.answer === value ? 'selected-option' : (value !== displayQuestion.correct_answer) ? 'disable-option' : '') : ''}`}
                        disabled={ansStatus.given}
                        onClick={() => giveAnswer(value)}>{value}</button>)}
                  </div>
                })}</div>
                <h4 className="pt-4">{ansStatus.given ? (ansStatus.right ? 'Correct!' : 'Sorry!') : ''}</h4>
                <div>{ansStatus.given && <button className='button btn' onClick={() => nextQuestion()}>Next Question</button>}</div>
              </div>
          }
          <div className='bottom-bar1 progress-bar-bottom'>
            <p className='d-flex w-100 justify-content-between'>
              <span>Score: {progressBarWidth.bottomInitialBar}%</span>
              <span>Max Score: {progressBarWidth.bottomLastBar}%</span>
            </p>
            <Progress multi>
              <Progress bar className='progress-bar-initial' value={progressBarWidth.bottomInitialBar} />
              <Progress bar className='progress-bar-middle' value={progressBarWidth.bottomMiddleBar} />
              <Progress bar className='progress-bar-last' value={progressBarWidth.bottomLastBar} />
            </Progress>
          </div>
        </div>

      </div>
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    currentQuestion: state.Questions.currentQuestion,
    allQuestion: state.Questions.allQuestions,
    correctAnswer: state.Questions.correctAnswer,
    wrongAnswer: state.Questions.wrongAnswer,
    givenAnswer: state.Questions.givenAnswer,
    currentIndex: state.Questions.currentIndex
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    actions: {
      getQuestions: bindActionCreators(questionAction.getAllQuestions, dispatch),
      giveAnswer: bindActionCreators(questionAction.giveAnswer, dispatch),
      nextQuestion: bindActionCreators(questionAction.nextQuestion, dispatch)
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
