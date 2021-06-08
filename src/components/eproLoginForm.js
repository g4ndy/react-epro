import { Formik, Form } from "formik";
import * as Yup from "yup";
import { MyTextInput, MySelect } from "../lib/formikelements";
import React, { useState, useEffect } from "react";

// pass the function to set login name and password to formik and call it in on submit,
// then the parent component can display something else based on the login being set

export default function EproLoginForm({ processLoginCredentials }) {
  const [visitsPlaceholders, setVisitsPlaceholders] = useState({});
  const [visitsTemplates, setVisitsTemplates] = useState({});
  const [subjectPrefix, setSubjectPrefix] = useState({});
  const [loginPrefix, setLoginPrefix] = useState({});
  const [ocWsBaseUrl, setOcWsBaseUrl] = useState({});
  const getData = () => {
    fetch("visits.json", {
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
        // console.log(myJson.visitsOids);

        setVisitsPlaceholders(myJson.visitsOids);
        setVisitsTemplates(myJson.visitsTemplates);
        setSubjectPrefix(myJson.subjectPrefix);
        setLoginPrefix(myJson.loginPrefix);
        setOcWsBaseUrl(myJson.ocWsBaseUrl);
      });
  };
  useEffect(() => {
    getData();
  }, []);

  return Object.keys(visitsPlaceholders).length !== 0 ? (
    <Formik
      /* initial values must be set, othervise the elements wont be controlled - error in browser*/
      initialValues={{
        /* loginName: "", */
        password: "",
        subjectNumber: "",
        /* email: '', */
        // acceptedTerms: false, // added for our checkbox
        visit: "", // added for our select
      }}
      validationSchema={Yup.object({
        /* loginName: Yup.string()
          .max(15, "Must be 15 characters or less")
          .required("Required"),*/
        password: Yup.number().required("Required"),
        subjectNumber: Yup.number()
          .typeError("Must be a number!")
          .max(1000, "Must be 1000 or less")
          .required("Required"),
        /* email: Yup.string().email('Invalid email address').required('Required'), 
                    acceptedTerms: Yup.boolean()
                        .required('Required')
                        .oneOf([true], 'You must accept the terms and conditions.'),*/
        visit: Yup.string()
          /* .oneOf(["SE_QUESTIONAIRES", "OID_V2", "OID_V3"], "Invalid visit") */
          .required("Required"),
      })}
      onSubmit={(values, { setSubmitting }) => {
        processLoginCredentials(
          values.password,
          values.visit,
          visitsPlaceholders[values.visit],
          visitsTemplates[values.visit],
          values.subjectNumber,
          subjectPrefix,
          loginPrefix,
          ocWsBaseUrl,
          setSubmitting
        );
        // setSubmitting(false); // probably better to set it when all is finished
        // console.log(values.password);
        /* setTimeout(() => {
                        alert(JSON.stringify(values, null, 2));
                        setSubmitting(false);
                    }, 400); */
      }}
    >
      {({ isSubmitting }) => (
        <Form className="loginForm">
          <table className="loginTable">
            <tbody>
              <tr>
                {/* 
                <td>
                  <MyTextInput
                    autoComplete="off"
                    labelclass="loginLabel"
                    label="Login name: "
                    name="loginName"
                    type="text"
                    placeholder="Your Login Name"
                  />
              </td>*/}
                <td colSpan="2">
                  <MyTextInput
                    autoComplete="off"
                    labelclass="loginLabel"
                    className="loginLabel"
                    label="PIN:"
                    name="password"
                    type="number"
                    placeholder="Your PIN"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <MyTextInput
                    autoComplete="off"
                    labelclass="loginLabel"
                    className="loginLabel"
                    label="Subject number:"
                    name="subjectNumber"
                    type="number"
                    placeholder="subject number"
                  />
                </td>
                <td>
                  <MySelect
                    labelclass="loginLabel"
                    className="loginLabel"
                    label="Visit"
                    name="visit"
                  >
                    <option value="">Select a visit</option>
                    {/* show options based on loaded json with questionnaires */}
                    {Object.entries(visitsPlaceholders).map(function ([
                      oid,
                      text,
                    ]) {
                      return (
                        <option key={oid} value={oid}>
                          {text}
                        </option>
                      );
                    })}
                  </MySelect>
                </td>
              </tr>
            </tbody>
          </table>
          <div id="loginplaceholder">
            <img alt="logoneox" src="logo.png" />
            <button type="submit" disabled={isSubmitting}>
              {/* disabled when isSubmitting should prevent repeted submits.. */}
              Přihlásit se
            </button>
          </div>
        </Form>
      )}
    </Formik>
  ) : (
    <div>Loading</div>
  );
}
