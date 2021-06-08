import { Formik, Form, Field } from "formik";
import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { Box } from "@material-ui/core";
import { PrettoSlider } from "../lib/silder";

// basic almost dummy validation for dynamically hidden fields (needs to be attached directly to the element)
function validateHere(value) {
  let error;
  if (value === "" || value === "null" || value === null) {
    error = "Required";
  }
  return error;
}

//mui slider constants and functions
const marks = [
  { value: 0, label: "0" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
  { value: 6, label: "6" },
  { value: 7, label: "7" },
  { value: 8, label: "8" },
  { value: 9, label: "9" },
  { value: 10, label: "10" },
];

/* no need to implement aria value text
function valuetext(value) {
  return `${value} ponits`;
}
*/
function valueLabelFormat(value) {
  return marks.findIndex((mark) => mark.value === value) + 1;
}

// import { MyTextInput } from "../lib/formikelements";

function getInitialValues(jsonFile) {
  var additionalInitialValues = {};
  for (var key in jsonFile) {
    if (jsonFile.hasOwnProperty(key)) {
      var hodnota = jsonFile[key].type === "radio" ? "" : 5; // 5 as a default starting point for VAS represents the middle value, should be good, radio should be unchecked thus "" since null causes problems
      additionalInitialValues = {
        ...additionalInitialValues,
        [jsonFile[key].oid]: hodnota,
      }; // necessary default empty controlled formik values: will look like {I_V0DOT_D_CPSI: '', I_V0DOT_D_CPSS: ''}
    }
  }
  return additionalInitialValues;
}

function setupYup(jsonFile) {
  var yupik = {};
  for (var key in jsonFile) {
    if (jsonFile.hasOwnProperty(key)) {
      if (jsonFile[key].show === "true") {
        yupik = {
          ...yupik,
          [jsonFile[key].oid]: Yup.string()
            .max(15, "Must be 15 characters or less")
            .typeError(
              "Povinná odpověď"
            ) /* type error reaguje v tomto kontextu i na null, čili ohlídá nevyplněnou VAS, kteréžto vyplnění nelze detekovat přes touched */
            .required("Povinná odpověď"),
        };
      }
    }
  }
  /* will return obeject for yup answer validation with these records:
  I_V0DOT_D_CPSI: Yup.string()
  .max(15, "Must be 15 characters or less")
  .required("Required")
  */
  return Yup.object(yupik);
}
// var setOtazek = MyRadioConstructor(jsonek)
// console.log(additionalInitialValues);

export default function EproQuestionnaireForm({
  processQuestionnaireSubmit,
  questionsJson,
}) {
  const [questionsPlaceholders, setQuestionsPlaceholders] = useState({});
  // questionsJson holds name of the json file dynamicaly selected during login based on the chosen visit
  const getData = () => {
    fetch(questionsJson, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then(function (response) {
        // console.log(response);
        return response.json();
      })
      .then(function (myJson) {
        // console.log(myJson.questions);
        setQuestionsPlaceholders(myJson);
      });
  };
  useEffect(() => {
    getData();
  }, []);

  // only when external json with questionairePlaceholders is loaded the form will be rendered, since the envelope is json object it cannot be tested like array questionsPlaceholders.length
  return Object.keys(questionsPlaceholders).length !== 0 ? (
    <>
      <h2>Dotazník pre pacientku na tablete</h2>
      <Formik
        /* initial values must be set, othervise the elements wont be controlled and errors wont be applied - error in browser*/
        // must also include the questions (represented by oids)
        initialValues={{
          ...getInitialValues(questionsPlaceholders.questions),
        }}
        // must also include oc questions
        validationSchema={setupYup(questionsPlaceholders.questions)}
        onSubmit={(values, { setSubmitting }) => {
          // also send the form oid and group oid which is neccessary for OC xml save
          processQuestionnaireSubmit(
            values,
            questionsPlaceholders.formVersionOid,
            questionsPlaceholders.groupOid,
            questionsPlaceholders.questions
          );
          setSubmitting(false);
        }}
        enableReinitialize={true}
      >
        {({ values, errors, touched, isSubmitting, setFieldValue }) => (
          <Form>
            {questionsPlaceholders.questions.map((object) =>
              /* if classic "radio question is selected" */
              object.type === "radio" ? (
                /* intercept whether hide logic should be applied here */
                object.show === "true" ||
                parseInt(values[object.parent]) === parseInt(object.trigger) ? (
                  <div
                    className="questionHolder"
                    key={"group" + object.oid}
                    role="group"
                    aria-labelledby="my-radio-group"
                  >
                    {object.hasOwnProperty("header") ? (
                      <div className="hederik">
                        <h3>{object.header}</h3>
                      </div>
                    ) : (
                      ""
                    )}
                    <div className="questionText">
                      {object.questionText}
                      {object.hasOwnProperty("explanation") ? (
                        <p className="explanation">{object.explanation}</p>
                      ) : (
                        ""
                      )}
                      {touched[object.oid] && errors[object.oid] ? (
                        <span className="errorplaceholder error">
                          &nbsp;
                          {errors[object.oid]}
                        </span>
                      ) : (
                        <span className="errorplaceholder">&nbsp;</span>
                      )}
                    </div>
                    {Object.entries(object.answers).map(function ([
                      questionNr,
                      questionAnswer,
                    ]) {
                      return (
                        <label
                          className="radioLabel"
                          key={questionNr + object.oid}
                        >
                          <Field
                            type="radio"
                            name={object.oid}
                            value={questionNr}
                            validate={validateHere}
                          />
                          {questionAnswer}
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  ""
                )
              ) : object.show === "true" ||
                parseInt(values[object.parent]) === parseInt(object.trigger) ? (
                <div className="questionHolder" key={"vas" + object.oid}>
                  {object.hasOwnProperty("header") ? (
                    <div className="hederik">
                      <h3>{object.header}</h3>
                    </div>
                  ) : (
                    ""
                  )}
                  <div className="questionText">
                    {object.questionText}
                    {object.hasOwnProperty("explanation") ? (
                      <p className="explanation">{object.explanation}</p>
                    ) : (
                      ""
                    )}
                    {touched[object.oid] && errors[object.oid] ? (
                      <span className="errorplaceholder error">
                        &nbsp;
                        {errors[object.oid]}
                      </span>
                    ) : (
                      <span className="errorplaceholder">&nbsp;</span>
                    )}
                  </div>
                  {/* this holds the left and right textually described extremes */}
                  <div className="polaritiesdiv">
                    <div className="vas-left-text">{object.answers[1]}</div>
                    <div className="vas-right-text">{object.answers[2]}</div>
                  </div>
                  <Box mx="5%">
                    {/* <Box mx="8%"> docili margin left a right 8%*/}
                    <Field
                      component={PrettoSlider}
                      name={object.oid}
                      valueLabelFormat={valueLabelFormat}
                      /* no need to implement aria value text  getAriaValueText={valuetext}*/
                      aria-labelledby="discrete-slider-restrict"
                      step={0.1}
                      min={0}
                      max={10}
                      valueLabelDisplay="off"
                      marks={marks}
                      track={false}
                      validate={validateHere}
                    />
                  </Box>
                  <img className="vasimg" src={object.image} alt="Logo" />{" "}
                  {/* to allow custom VAS images object.image is provided from json setup file in case of VAS for each question */}
                </div>
              ) : (
                ""
                /*
                <div key="gobz">
                  This is hidden because Interceptor picked:
                  {values[object.parent]}
                  <br />
                  Trigger set to: {object.trigger}
                </div>
                */
              )
            )}
            <div id="submitplaceholder">
              <button type="submit" disabled={isSubmitting}>
                Submit
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </>
  ) : (
    <>loading</>
  );
}
