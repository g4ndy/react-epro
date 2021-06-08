import { useField, Field } from "formik";

export const MyTextInput = ({ label, ...props }) => {
  // useField() returns [formik.getFieldProps(), formik.getFieldMeta()]
  // which we can spread on <input>. We can use field meta to show an error
  // message if the field is invalid and it has been touched (i.e. visited)
  const [field, meta] = useField(props);
  return (
    <>
      <label htmlFor={props.id || props.name} className={props.labelclass}>
        {label}
      </label>
      <input className="text-input" {...field} {...props} />
      {meta.touched && meta.error ? (
        <div className="errorplaceholder error">
          {props.placeholder}: {meta.error}
        </div>
      ) : (
        <div className="errorplaceholder">&nbsp;</div>
      )}
    </>
  );
};

export const MyCheckbox = ({ children, ...props }) => {
  // React treats radios and checkbox inputs differently other input types, select, and textarea.
  // Formik does this too! When you specify `type` to useField(), it will
  // return the correct bag of props for you -- a `checked` prop will be included
  // in `field` alongside `name`, `value`, `onChange`, and `onBlur`
  const [field, meta] = useField({ ...props, type: "checkbox" });
  return (
    <>
      <label className="checkbox-input">
        <input type="checkbox" {...field} {...props} />
        {children}
      </label>
      {meta.touched && meta.error ? (
        <div className="errorplaceholder error">{meta.error}</div>
      ) : (
        <div className="errorplaceholder">&nbsp;</div>
      )}
    </>
  );
};

export const MySelect = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  return (
    <>
      <label htmlFor={props.id || props.name} className={props.labelclass}>
        {label}
      </label>
      <select {...field} {...props} />
      {meta.touched && meta.error ? (
        <div className="errorplaceholder error">{meta.error}</div>
      ) : (
        <div className="errorplaceholder">&nbsp;</div>
      )}
    </>
  );
};

// should accept this object
// {I_V0DOT_D_CPSI: {questonText: "text 1 otazky", answers: {1: "prvni odpoved", 2: "druha odpoved", 3: "treti"}
/* and return
        <div id="my-radio-group">Picked</div>
        <div role="group" aria-labelledby="my-radio-group">
            <label>
                <Field type="radio" name="picked" value="1" />
                One
                </label>
            <label>
                <Field type="radio" name="picked" value="2" />
                Two
                </label> 
                {errors.picked && touched.picked ? (
                    <div>{errors.picked}</div>
                ) : null}
        </div>
*/

/* logic moved directly to eproQuestionnareForm.js since the errors object came here initially undefined
and also the iteration was force to run again on each change of any radio constructed here
export const MyRadioConstructor = (radioQuestionObject, errors) => {
    // pokud sem poslu error tak poprve je jesete neinicializovany console.log(errors);
    var vratka = [];
    for (var key in radioQuestionObject) {
        if (radioQuestionObject.hasOwnProperty(key)) {
            // console.log(radioQuestionObject[key])
            // console.log(radioQuestionObject[key].answers)
            var questionOid = key;
            // var tempRadio = Object.entries(radioQuestionObject[key].answers).map(([questionNr, questionAnswer]) => (
            // const doubledArr = arr.map( function(num){return num * 2})
            var tempRadio = Object.entries(radioQuestionObject[key].answers).map(function([questionNr, questionAnswer]) {
                return (    
                <label key={questionAnswer}>
                    <Field type="radio" name={questionOid} value={questionNr} />
                    {questionAnswer}
                </label>
            )});
            // console.log(tempRadio);
            var tempRadioGroup = <><div key={"heading"+key}>{radioQuestionObject[key].questonText}</div><div key={"group"+key} role="group" aria-labelledby="my-radio-group"></div>{tempRadio}</>;
        }
        vratka.push(tempRadioGroup);
      }
    // console.log(vratka);
    return vratka;
};
*/

/*
// partial construction of radio button is doable here but without the error handling since the error message should be applied on group
export const MyPartialRadioConstructor = (
    questionOid,
    questionText,
    oneRadioQuestionObject
  ) => {
    var tempRadio = Object.entries(oneRadioQuestionObject).map(function ([
      questionNr,
      questionAnswer,
    ]) {
      return (
        <label key={questionAnswer}>
          <Field type="radio" name={questionOid} value={questionNr} />
          {questionAnswer}
        </label>
      );
    });
    // console.log(tempRadio);
    return (
      <>
        <div key={"heading" + questionOid}>{questionText}</div>
        <div
          key={"group" + questionOid}
          role="group"
          aria-labelledby="my-radio-group"
        ></div>
        {tempRadio}
      </>
    );
  };

*/
