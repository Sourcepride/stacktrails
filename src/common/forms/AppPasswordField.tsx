// import { TextFieldProps } from "@mui/material";
// import { useState } from "react";
// import { Control, FieldValues, Path } from "react-hook-form";
// import EyeClose from "../icons/pack/EyeClose";
// import EyeOpen from "../icons/pack/EyeOpenIcon";
// import AppTextField from "./AppTextField";

// type AppPasswordFieldProps<TFieldValues extends FieldValues = FieldValues> =
//   Omit<TextFieldProps, "variant"> & {
//     control: Control<TFieldValues, any> | undefined;
//     helperText?: string;
//     defaultValue?: any;
//     name: Path<TFieldValues>;

//     message?: any;
//   };

// const AppPasswordField = <T extends FieldValues = FieldValues>({
//   ...props
// }: AppPasswordFieldProps<T>) => {
//   const [showPlain, setShowPlain] = useState(false);

//   return (
//     <div className="relative h-full w-full">
//       <AppTextField
//         fullWidth
//         type={showPlain ? "text" : "password"}
//         {...props}
//       />
//       <button
//         type="button"
//         onClick={setShowPlain.bind(undefined, !showPlain)}
//         className="absolute right-4 top-1/2 -translate-y-1/2 [appearance:none]"
//       >
//         {showPlain ? <EyeClose /> : <EyeOpen />}
//       </button>
//     </div>
//   );
// };

// export default AppPasswordField;
