import { withStyles, makeStyles } from "@material-ui/core/styles";
import MuiSlider, {
  SliderProps as MuiSliderProps,
} from "@material-ui/core/Slider";
// this is for typescript to Exclude property from type, typescript also removed from functions below, original solution https://codesandbox.io/s/floral-voice-5rsg3?file=/src/index.tsx:2423-2511
/*  type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
  export interface SliderProps
    extends FieldProps,
      Omit<MuiSliderProps, 'name' | 'onChange' | 'value' | 'defaultValue'> {}
*/

export function fieldToSlider({
  field,
  form: { isSubmitting },
  disabled = false,
  ...props
}) {
  return {
    disabled: isSubmitting || disabled,
    ...props,
    ...field,
    name: field.name,
    value: field.value,
  };
}

export const Slider = (props) => (
  <MuiSlider
    {...fieldToSlider(props)}
    onChange={(e, value) => {
      // console.log("onchange fired", value);
      props.form.setFieldValue(props.field.name, value);
    }}
  />
);

Slider.displayName = "FormikMaterialUISlider";

export const PrettoSlider = withStyles({
  root: {
    color: "#bdbdbd" /* "#52af77", */,
    height: 8,
  },
  thumb: {
    height: 24,
    width: 24,
    backgroundColor: "#6bc423" /* "#fff",  #cc1a1a */,
    border: "2px solid currentColor",
    marginTop: -8,
    marginLeft: -12,
    "&:focus, &:hover, &$active": {
      boxShadow: "inherit",
    },
  },
  active: {},
  valueLabel: {
    left: "calc(-50% + 4px)",
  },
  track: {
    height: 8,
    borderRadius: 4,
  },
  rail: {
    height: 8,
    borderRadius: 4,
  },
})(Slider);
