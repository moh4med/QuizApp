/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Fragment, Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  ActivityIndicator,
  FlatList,
  TouchableOpacity, Dimensions
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';



export const Height = Dimensions.get('screen').height
export const Width = Dimensions.get('screen').width

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      Questions: [],
      QuizWorking: false,
      currentQuestionIndex: 0,
      Score: 0,
      QuestionAnswered: false,
      prevAns: "",
      totalTime: 0,
    }
  }
  componentDidMount() {
    // this.getQuestions();

  }
  startTime = () => {
    this.Timer = setInterval(() => {
      this.setState((PrevState) => {
        return {
          totalTime: PrevState.totalTime + 1
        }
      })
    }, 1000);
  }
  StopTime = () => {
    clearInterval(this.Timer);
  }
  FormatTime = () => {
    let { totalTime } = this.state
    let Hours = parseInt(totalTime / 3600);
    totalTime = totalTime % 3600;
    let Minutes = parseInt(totalTime / 60);
    let Seconds = totalTime % 60;
    if (Hours > 0) {
      return Hours + " : " + Minutes + " : " + Seconds
    } else {
      return Minutes + " : " + Seconds
    }
  }
  shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  getQuestions = () => {
    this.setState({ isLoading: true }, () => {

      fetch("https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple")
        .then((response) => response.json())
        .then((responseJson) => {
          console.log("TAG", "responseJson", responseJson)
          let Questions = responseJson.results;
          for (let index = 0; index < Questions.length; index++) {
            const element = Questions[index];
            let Answers = element.incorrect_answers.concat(element.correct_answer);
            Answers = this.shuffle(Answers);
            Questions[index].All_Answers = Answers
          }
          this.setState({
            Questions: Questions, isLoading: false, QuizWorking: true, currentQuestionIndex: 0, Score: 0,
            QuestionAnswered: false,
            prevAns: "",
            totalTime: 0,
          })
          this.startTime();
        })
        .catch((error) => {
          console.error("TAG", "error", error);
        });
    })
  }
  finishQuiz = () => {
    this.setState({
      QuizWorking: false,
    })
    this.StopTime();
  }
  answerQuestion = (answer) => {
    let { Questions, currentQuestionIndex } = this.state;
    let currentQuestion = Questions[currentQuestionIndex];
    let inc = 0;
    if (answer == currentQuestion.correct_answer) {
      inc++;
    }
    this.setState({
      QuestionAnswered: true,
      prevAns: answer
    }, () => {
      if (this.state.currentQuestionIndex == 9) {
        this.finishQuiz()
      }
      setTimeout(() => {
        this.setState((prevState) => {
          return {
            currentQuestionIndex: prevState.currentQuestionIndex + 1 % 10,
            Score: prevState.Score + inc,
            QuestionAnswered: false
          }
        })
      }, 500);
    })
  }
  renderQuestion = () => {
    let { Questions, currentQuestionIndex, QuestionAnswered, prevAns } = this.state;
    let currentQuestion = Questions[currentQuestionIndex];
    let Answers = currentQuestion.All_Answers;

    return (

      <View style={{ width: "90%", height: "80%", marginTop: Height * .1, alignItems: "flex-start", backgroundColor: "#fff" }}>
        <Text>
          {(currentQuestionIndex+1)+" - "+(currentQuestion.question)}
        </Text>
        <FlatList
          data={Answers}
          extraData={this.state}
          showsVerticalScrollIndicator={false}
          style={{ marginTop: "3%" }}
          keyExtractor={(item, index) => "" + index}
          renderItem={
            ({ item }) => {
              let color = "white";
              if (QuestionAnswered) {
                if (item == prevAns) {
                  color = "red"
                }
                if (item == currentQuestion.correct_answer) {
                  color = "green";
                }
              }

              return (
                <TouchableOpacity
                  disabled={QuestionAnswered}
                  onPress={() => { this.answerQuestion(item) }}
                  style={{
                    borderRadius: 8,
                    elevation: 4,
                    backgroundColor: "#fff",
                    justifyContent: "center",
                    alignItems: "center",
                    margin: Height * .01,
                    width: Width * .75,
                    height: Height * .07,
                    backgroundColor: color
                  }}>
                  <Text>{(item)}</Text>
                </TouchableOpacity>
              )
            }
          }
        />
      </View>


    )
  }
  render() {
    let { isLoading, QuizWorking, Questions } = this.state;
    return (
      <View style={{ backgroundColor: "white", flex: 1 }}>
        
        {QuizWorking && Questions.length > 0 && <View style={[styles.Container, { justifyContent: "flex-start" }]}>
          <View style={{ height: Height * .07, width: "100%", elevation: 5, backgroundColor: "#fff", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 10, flexDirection: "row" }}>
            <Text>Quiz App</Text>
            <Text>Time: {this.FormatTime()}</Text>
          </View>
          {this.renderQuestion()}
        </View>
        }
        {!QuizWorking &&Questions.length > 0 && <View style={[styles.Container, { justifyContent: "center", }]}>
          <View style={{
            height: Height * .4, width: "90%", elevation: 5, backgroundColor: "#fff",
            alignItems: "center", justifyContent: "space-evenly", paddingHorizontal: 10
          }}>
            <Text>Quiz Finished</Text>
            <Text>Time: {this.FormatTime()}</Text>
            <Text>Score: {this.state.Score}</Text>
            <TouchableOpacity
              style={{ elevation: 4, borderRadius: 4, backgroundColor: "#fff",padding:6 }}
              onPress={() => {
                this.getQuestions()
              }}
            >
              <Text>
                play again !
              </Text>
            </TouchableOpacity>
          </View>

        </View>
        }
         {!QuizWorking &&Questions.length == 0 && <View style={[styles.Container, { justifyContent: "center", }]}>
          <View style={{
            height: Height * .4, width: "90%", elevation: 5, backgroundColor: "#fff",
            alignItems: "center", justifyContent: "space-evenly", paddingHorizontal: 10
          }}>
           
            <TouchableOpacity
              style={{ elevation: 4, borderRadius: 4, backgroundColor: "#fff",padding:6 }}
              onPress={() => {
                this.getQuestions()
              }}
            >
              <Text>
                Start Quiz!
              </Text>
            </TouchableOpacity>
          </View>

        </View>
        }
        {isLoading && <View style={[styles.Container,{position:"absolute",zIndex:5}]}>
          <ActivityIndicator color="red" size="large" />
        </View>
        }
      </View>
    );
  }

};

const styles = StyleSheet.create({
  Container: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    zIndex:1
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
