// import { Checkbox } from "@mui/material";
// import {
//   ColumnDef,
//   getCoreRowModel,
//   Row,
//   useReactTable,
// } from "@tanstack/react-table";
// import { useMemo } from "react";
// import TableUI from "./TableUI";
// import TableSmUI from "./TableSmUI";

// type CheckBoxTableProps<T> = {
//   setSelected: (value: any) => void;
//   selected: any;
//   data: T[];
//   columns: ColumnDef<T, any>[];
//   className?: string;
//   mergeColumn?: boolean;
//   enableFunc?: (row: Row<T>) => boolean;
// };

// export default function SelectTable<T>({
//   data,
//   columns,
//   className,
//   setSelected,
//   mergeColumn = true,
//   selected = {},
//   enableFunc = (_) => true,
// }: CheckBoxTableProps<T>) {
//   const checkCol: ColumnDef<T>[] = useMemo(
//     () => [
//       {
//         id: "select",
//         header: ({ table }) => (
//           <>
//             <Checkbox
//               sx={{
//                 padding: "0 0 0 4px",
//               }}
//               {...{
//                 checked: table.getIsAllRowsSelected(),
//                 indeterminate: table.getIsSomeRowsSelected(),
//                 onChange: table.getToggleAllRowsSelectedHandler(),
//                 color: "success",
//               }}
//             />
//           </>
//         ),
//         cell: ({ row }) => (
//           <div className="px-1">
//             <Checkbox
//               sx={{
//                 padding: "0",
//               }}
//               {...{
//                 checked: row.getIsSelected(),
//                 disabled: !row.getCanSelect(),
//                 indeterminate: row.getIsSomeSelected(),
//                 onChange: row.getToggleSelectedHandler(),
//                 color: "success",
//               }}
//             />
//           </div>
//         ),
//       },
//     ],
//     [],
//   );

//   const table = useReactTable({
//     columns: mergeColumn
//       ? ([...checkCol, ...columns] as ColumnDef<T, any>[]) // Cast the merged array
//       : columns,
//     data,
//     state: {
//       rowSelection: selected,
//     },
//     enableRowSelection: enableFunc,
//     getCoreRowModel: getCoreRowModel(),
//     onRowSelectionChange: setSelected,
//   });

//   return (
//     <>
//       <div className={`hidden xl:block w-full overflow-x-scroll ${className}`}>
//         <TableUI<T> table={table} />
//       </div>
//       <div className={`xl:hidden ${className}`}>
//         <TableSmUI<T> table={table} />
//       </div>
//     </>
//   );
// }
