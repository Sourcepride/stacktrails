// import { TextFieldProps } from "@mui/material";
// import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
// import { parseISO } from "date-fns";
// import dayjs from "dayjs";
// import { Control, Controller, FieldValues, Path } from "react-hook-form";

// type AppDateTimeFieldProps<TFieldValues extends FieldValues = FieldValues> = {
//   label?: string;
//   control: Control<TFieldValues> | undefined;
//   defaultValue?: any;
//   name: Path<TFieldValues>;
//   placeholder?: string; // Add a placeholder prop
// };

// const AppDateTimeField = <T extends FieldValues = FieldValues>({
//   control,
//   name,
//   defaultValue = null,
//   placeholder = "", // Default empty placeholder
//   ...props
// }: AppDateTimeFieldProps<T>) => {
//   return (
//     <Controller
//       render={({ field }) => (
//         <DateTimePicker
//           {...field}
//           {...props}
//           value={dayjs(
//             typeof field.value === "string"
//               ? parseISO(field.value || new Date().toISOString())
//               : field.value,
//           )}
//           onChange={(value) => {
//             field.onChange({ target: { value: value?.toISOString() } });
//           }}
//           slotProps={{
//             textField: {
//               placeholder, // Pass the placeholder to the underlying TextField
//             } as TextFieldProps,
//           }}
//         />
//       )}
//       name={name as any}
//       control={control}
//       defaultValue={defaultValue}
//     />
//   );
// };

// export default AppDateTimeField;
