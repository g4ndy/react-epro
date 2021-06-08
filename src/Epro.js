import React from "react";
import { testXmlParse } from "./lib/xmlHelpers";
import {
  listStudiesQuery,
  scheduleEventQuery,
  importDataQuery,
} from "./lib/ocHelpers";
import crypto from "crypto-js";
import EproLoginForm from "./components/eproLoginForm";
import EproQuestionnaireForm from "./components/eproQuestionnaireForm";

// this is the main component of this app

export default class Epro extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ocConnected: false,
      wrongCredentials: false,
      returnedFromPatient: false,
      wrongEvent: false,
      alreadyScheduled: false,
      displayEproForm: false,
      insertDataError: false,
      loginCredentials: {
        login: "",
        password: "",
        eventOid: "",
        questionsJson: "",
        eventName: "",
        subject: "",
        ocWsBaseUrl: "",
      },
      study: {
        oid: "",
        name: "",
        identifier: "",
      },
      site: {
        oid: "",
        name: "",
        identifier: "",
      },
      event: {
        ordinal: "",
        studySubjectOid: "",
        oid: "",
      },
    };

    this.processLoginCredentials = this.processLoginCredentials.bind(this);
    this.processQuestionnaireSubmit =
      this.processQuestionnaireSubmit.bind(this);
    this.baseState = this.state; // so the state can be reset to original empty state
  }

  componentDidMount() {}

  resetState = () => {
    this.setState(this.baseState);
  };

  // LAST POINT: this is called after the study nurse correctly logged into the system and epro questionnaire are filled by the patient
  async processQuestionnaireSubmit(
    answers,
    formVersionOid,
    groupOid,
    questions
  ) {
    // get rid of the values of hidden fields - they should not be saved into the openclinica db:
    const knicemu = questions.map(function (currentValue, index) {
      if (
        currentValue.show === "false" &&
        currentValue.trigger !== answers[currentValue.parent]
      ) {
        // console.log("this will not be saved because it is hidden: " + currentValue.oid);
        // unset the value for field which was hiden, so the value will not be saved into openclinica
        answers[currentValue.oid] = "";
      }
      // console.log(currentValue.oid);
    });

    await fetch(
      this.state.loginCredentials.ocWsBaseUrl + "studySubject/v1/dataWsdl.wsdl",
      {
        method: "POST",
        headers: { "Content-Type": "text/xml" },
        body: importDataQuery(
          this.state.loginCredentials.login,
          this.state.loginCredentials.password,
          this.state.site.oid,
          this.state.event.oid,
          this.state.event.studySubjectOid,
          formVersionOid,
          groupOid,
          answers // object with answers, will be iterated through in importDataQuery
        ),
      }
    )
      .then((response) => {
        // here is a chance to discern what is in response - if it is error status, raise an error
        if (response.status >= 400 && response.status < 600) {
          throw new Error("Bad response from server");
        }
        // otherwise just continue to next step
        return response.text();
      })
      .then((response) => {
        // provide asynchrnously parsed xml response (cant be done in one step)
        return testXmlParse(response);
      })
      .then((response) => {
        // get values of interest out of the xml response previously parsed to javascript object
        this.processInsertOcResponse(response);
      })
      .catch((error) => {
        // in case of error dont do anything, maybe reset the state?
        if (error) {
          this.setState({
            insertDataError: true,
          });
        }
        console.log(error);
      });
  }

  processInsertOcResponse(result) {
    // console.dir(result);
    if (
      result["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0].importDataResponse[0]
        .result[0]._ === "Fail"
    ) {
      this.setState({
        insertDataError: true,
      });
    } else {
      this.setState({
        // everything went well - data are saved, no need to reset state,
        // just set-up the flag that the questionnaire has been returned,
        // the login form will not have prefilled entry since formik defaults are set to '' and not controled from here
        returnedFromPatient: true,
      });
    }
  }

  // ENTRY POINT: this is called from the basic login form
  async processLoginCredentials(
    pwd,
    visit,
    eventName,
    questionsJson,
    subject,
    subjectPrefix,
    loginPrefix,
    ocWsBaseUrl,
    setSubmitting
  ) {
    this.resetState(); // since the basic login form is being submitted it is safe to discard everything from state and start the process anew
    var sliceme = pwd.toString(); // PIN (or password) is currently used not only as a password but also as a site/user identificator (see visits_template.json)
    var lgn = loginPrefix.toString() + sliceme.substr(0, 1); // loginPrefix is 0, first number from PIN serves both as username and site identification; 02 is usern with name 02 on site SK-02
    // console.log("login name: " + lgn);
    var sitePrefix = lgn === "09" ? "TR" : lgn; // in case 9 -> 09 hase been entered as the first number of PIN, training site TR (SK-TR) will be selected.
    // console.log("site prefix: " + sitePrefix);
    var sha1hashedpw = crypto.SHA1(sliceme.substr(1)).toString(); // this is numerical password used to log into the OpenClinica (simple password must be allowed in OpenClinica password requirements)
    var subjectLabel =
      subjectPrefix + sitePrefix + "-" + subject.toString().padStart(3, "0"); // this is subject label constructed from site prefix, site number, and subject number entered in login screen; "SK-" + "01" + "-" + "001"
    // console.log("subject label: " + subjectLabel);
    // update the filled credentials into the state  Important is to also save questionsJson - the name of the json file based on the selected visit from which the questions will be loaded
    this.setState({
      loginCredentials: {
        login: lgn,
        password: sha1hashedpw,
        eventOid: visit,
        questionsJson,
        eventName,
        subject: subjectLabel,
        ocWsBaseUrl,
      },
    });
    // possible to move this to separate component or helper
    await this.fetchList().then((response) => {
      if (response !== "error") {
        this.schedule(setSubmitting);
      } else {
        setSubmitting(false);
      }
    });
  }

  async fetchList() {
    return await fetch(
      this.state.loginCredentials.ocWsBaseUrl +
        "studySubject/v1/studyWsdl.wsdl",
      {
        method: "POST",
        headers: { "Content-Type": "text/xml" },
        body: listStudiesQuery(
          this.state.loginCredentials.login,
          this.state.loginCredentials.password
        ),
      }
    )
      .then((response) => {
        // here is a chance to discern what is in response - if it is error status, raise an error
        if (response.status >= 400 && response.status < 600) {
          throw new Error("Bad response from server");
        }
        // otherwise just continue to next step
        return response.text();
      })
      .then((response) => {
        // provide asynchrnously parsed xml response (cant be done in one step)
        return testXmlParse(response);
      })
      .then((response) => {
        // get STUDY AND SITE ids out of the xml response previously parsed to javascript object
        return this.processListOcResponse(response);
      })
      .catch((error) => {
        // in case of error dont do anything, maybe reset the state?
        if (error) {
          this.setState({
            ocConnected: false,
            wrongCredentials: true,
          });
        }
        console.log(error);
        return "error";
      });
  }

  processListOcResponse(result) {
    // console.dir(result);
    var baseOcDir =
      result["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0].listAllResponse[0]
        .studies[0].study[0];
    // console.dir(baseOcDir);
    /* console.log(
      "study oid and name and id",
      // pick the proper xml address from google console
      baseOcDir.oid[0]._,
      baseOcDir.name[0]._,
      baseOcDir.identifier[0]._
    );

    console.log(
      "site oid and name",
      // pick the proper xml address from google console
      baseOcDir.sites[0].site[0].oid[0]._,
      baseOcDir.sites[0].site[0].name[0]._,
      baseOcDir.sites[0].site[0].identifier[0]._
    );
*/
    this.setState({
      ocConnected: true,
      study: {
        oid: baseOcDir.oid[0]._,
        name: baseOcDir.name[0]._,
        identifier: baseOcDir.identifier[0]._,
      },
      site: {
        oid: baseOcDir.sites[0].site[0].oid[0]._,
        name: baseOcDir.sites[0].site[0].name[0]._,
        identifier: baseOcDir.sites[0].site[0].identifier[0]._,
      },
    });
    return "done";
    // setOcResponse({ result });
  }

  async schedule(setSubmitting) {
    var dateobj = new Date();

    return await fetch(
      this.state.loginCredentials.ocWsBaseUrl +
        "studySubject/v1/eventWsdl.wsdl",
      {
        method: "POST",
        headers: { "Content-Type": "text/xml" },
        body: scheduleEventQuery(
          this.state.loginCredentials.login,
          this.state.loginCredentials.password,
          this.state.study.identifier,
          this.state.site.identifier,
          this.state.loginCredentials.eventOid,
          this.state.loginCredentials.subject,
          dateobj.toISOString()
        ),
      }
    )
      .then((response) => {
        // here is a chance to discern what is in response - if it is error status, raise an error
        if (response.status >= 400 && response.status < 600) {
          throw new Error("Bad response from server");
        }
        // otherwise just continue to the next step
        return response.text();
      })
      .then((response) => {
        // provide asynchrnously parsed xml response (cant be done in one step)
        return testXmlParse(response);
      })
      .then((response) => {
        // get values of interest out of the xml response previously parsed to javascript object
        this.processScheduleOCresponse(response, setSubmitting);
      })
      .catch((error) => {
        // in case of error dont do anything, maybe reset the state?
        if (error) {
          setSubmitting(false);
          this.setState({
            wrongEvent: true,
          });
        }
        console.log(error);
      });
  }

  processScheduleOCresponse(result, setSubmitting) {
    // console.dir(result);
    var baseOcDir =
      result["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0].scheduleResponse[0];
    var scheduleResult = baseOcDir.result[0]._;
    if (scheduleResult !== "Success") {
      this.setState({
        alreadyScheduled: true,
      });
      setSubmitting(false);
    } else {
      // event was scheduled, adjust the current state
      this.setState({
        displayEproForm: true,
        event: {
          ordinal: baseOcDir.studyEventOrdinal[0]._,
          studySubjectOid: baseOcDir.studySubjectOID[0]._,
          oid: baseOcDir.eventDefinitionOID[0]._,
        },
      });
      setSubmitting(false);
    }
  }

  render() {
    if (this.state.insertDataError) {
      return (
        <div>Internet connection error occured - please restart the device</div>
      );
    } else if (
      this.state.ocConnected &&
      !this.state.alreadyScheduled &&
      this.state.displayEproForm &&
      !this.state.returnedFromPatient
    ) {
      // successfully loged in, posibility to display things from state <p>study id: {this.state.study.identifier}, site id: {this.state.site.identifier}, selected subject {this.state.loginCredentials.subject}
      return (
        <div className="MainDiv">
          <EproQuestionnaireForm
            processQuestionnaireSubmit={this.processQuestionnaireSubmit}
            questionsJson={this.state.loginCredentials.questionsJson}
          ></EproQuestionnaireForm>
        </div>
      );
    } else {
      // show login screen with additional info base on what happened
      return (
        <div className="MainDiv">
          <div className="headerDiv">
            {this.state.returnedFromPatient && (
              <p className="thanks">
                Děkujeme za vyplnění dotazníku, nyní prosíme vraťte tablet
                zdravotní sestře.
              </p>
            )}
            {this.state.alreadyScheduled && (
              <p className="warning">
                Pacient {this.state.loginCredentials.subject} má již dotazníky
                pro zvolenou návštěvu {this.state.loginCredentials.eventName}{" "}
                vyplněné!
              </p>
            )}
            {this.state.wrongCredentials && (
              <p className="warning">Špatné přihlašovací údaje!</p>
            )}
            <h2>Prosím, přihlaste se</h2>
          </div>
          <EproLoginForm
            processLoginCredentials={this.processLoginCredentials}
          ></EproLoginForm>
        </div>
      );
    }
  }
}
