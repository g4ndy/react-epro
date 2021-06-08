import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { MyTextInput, MySelect } from "../lib/formikelements";
import React, { useState, useEffect } from "react";

function validateHere(value) {
  let error;
  if (value === "") {
    error = "Required";
  }
  return error;
}

// pass the function to set login name and password to formik and call it in on submit,
// then the parent component can display something else based on the login being set
export default function TestingForm({ processLoginCredentials }) {
  const [visitsPlaceholders, setVisitsPlaceholders] = useState({});

  const getData = () => {
    fetch("questionPlaceholders.json", {
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
      });
  };

  useEffect(() => {
    getData();
  }, []);

  return Object.keys(visitsPlaceholders).length !== 0 ? (
    <Formik
      /* initial values must be set, othervise the elements wont be controlled - error in browser*/
      initialValues={{
        picked: "No",
        loginName: "",
        password: "",
        subjectNumber: "",
        visit: "", // added for our select
        /* email: '', */
        // acceptedTerms: false, // added for our checkbox
      }}
      validationSchema={Yup.object({
        loginName: Yup.string()
          .max(15, "Must be 15 characters or less")
          .required("Required"),
        password: Yup.string()
          .max(15, "Must be 15 characters or less")
          .required("Required"),
      })}
      onSubmit={(values, { setSubmitting }) => {
        processLoginCredentials(values, setSubmitting);
        // setSubmitting(false); // probably better to set it when all is finished
        // console.log(values.password);
        /* setTimeout(() => {
                        alert(JSON.stringify(values, null, 2));
                        setSubmitting(false);
                    }, 400); */
      }}
      enableReinitialize={true}
    >
      {({ values, isSubmitting }) => (
        <Form className="loginForm">
          <div id="my-radio-group">Show the question below:</div>
          <div role="group" aria-labelledby="my-radio-group">
            <label>
              <Field type="radio" name="picked" value="Yes" />
              Yes
            </label>
            <label>
              <Field type="radio" name="picked" value="No" />
              No
            </label>
            <div>Picked: {values.picked}</div>
          </div>

          <table className="loginTable">
            <tbody>
              <tr>
                <td>
                  <MyTextInput
                    autoComplete="off"
                    labelclass="loginLabel"
                    label="Login name: "
                    name="loginName"
                    type="text"
                    placeholder="Your Login Name"
                  />
                </td>
                <td>
                  <MyTextInput
                    autoComplete="off"
                    labelclass="loginLabel"
                    label="Password:"
                    name="password"
                    type="password"
                    placeholder="Your Password"
                  />
                </td>
              </tr>
              {1 + 1 === 2 && values.picked === "Yes" ? (
                <tr>
                  <td>
                    {/* 2 validation validate={validateHere} must be hooked on element in case i want to hide it
                        1) even if hidden, the value is still being sent.. possible problem - need some additionall processing after submit */}
                    <MyTextInput
                      validate={validateHere}
                      autoComplete="off"
                      labelclass="loginLabel"
                      label="Subject number"
                      name="subjectNumber"
                      type="text"
                      placeholder="subject number"
                    />
                  </td>
                  <td>
                    <MySelect
                      validate={validateHere}
                      labelclass="loginLabel"
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
              ) : (
                <tr>
                  <td>hidden</td>
                </tr>
              )}
            </tbody>
          </table>
          <button type="submit" disabled={isSubmitting}>
            {/* disabled when isSubmitting should prevent repeted submits.. */}
            Submit
          </button>
          <button type="reset" className="btn btn-secondary">
            Reset
          </button>
        </Form>
      )}
    </Formik>
  ) : (
    <div>Loading</div>
  );
}
