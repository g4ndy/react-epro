import React from "react";
import EproQuestionnaireForm from "./components/eproQuestionnaireForm";

// this component is for testing the rendering of questionnaire

export default class Epro2 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ocResponse: "",
      loginCredentials: {
        login: "",
        password: "",
        visit: "",
        subject: "",
      },
    };

    this.processQuestionnaireSubmit =
      this.processQuestionnaireSubmit.bind(this);
  }

  async processQuestionnaireSubmit(
    answers,
    formVersionOid,
    groupOid,
    questions
  ) {
    const knicemu = questions.map(function (currentValue, index) {
      if (
        currentValue.show === "false" &&
        currentValue.trigger !== answers[currentValue.parent]
      ) {
        // unset the value for field which was hiden, so the value will not be transfered to openclinica
        answers[currentValue.oid] = "";
      }
      // console.log(currentValue.oid);
    });

    // console.log("loguji" + answers.I_V0DOT_N_KNSMC);
    console.log(formVersionOid);
    for (var key in answers) {
      if (answers.hasOwnProperty(key)) {
        console.log(key);
        console.log(answers[key]);
      }
    }
  }

  render() {
    return (
      <div className="MainDiv">
        <EproQuestionnaireForm
          processQuestionnaireSubmit={this.processQuestionnaireSubmit}
          questionsJson="v3_sk.json"
        ></EproQuestionnaireForm>
      </div>
    );
  }
}
