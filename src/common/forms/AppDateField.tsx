// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import { parseISO } from "date-fns";
// import dayjs from "dayjs";
// import { Control, Controller, FieldValues } from "react-hook-form";

// type AppTimeFieldProps<TFieldValues extends FieldValues = FieldValues> = {
//   label?: string;
//   control: Control<TFieldValues> | undefined;
//   defaultValue?: any;
//   name: string;
// };
// const AppDateField = <T extends FieldValues = FieldValues>({
//   control,
//   name,
//   defaultValue = "",
//   ...props
// }: AppTimeFieldProps<T>) => {
//   return (
//     <Controller
//       render={({ field }) => (
//         <DatePicker
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
//         />
//       )}
//       name={name as any}
//       control={control}
//       defaultValue={defaultValue}
//     />
//   );
// };
// export default AppDateField;
