// import { TimePicker } from "@mui/x-date-pickers/TimePicker";
// import { Control, Controller, FieldValues, Path } from "react-hook-form";

// type AppTimeFieldProps<TFieldValues extends FieldValues = FieldValues> = {
//   label?: string;
//   control: Control<TFieldValues> | undefined;
//   defaultValue?: any;
//   name: Path<TFieldValues>;
// };
// const AppTimeField = <T extends FieldValues = FieldValues>({
//   control,
//   name,
//   defaultValue = "",
//   ...props
// }: AppTimeFieldProps<T>) => {
//   return (
//     <Controller
//       render={({ field }) => <TimePicker {...field} {...props} />}
//       name={name as any}
//       control={control}
//       defaultValue={defaultValue}
//     />
//   );
// };
// export default AppTimeField;
