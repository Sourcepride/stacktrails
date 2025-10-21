// import { Skeleton } from "@mui/material";
// import {
//   ColumnDef,
//   getCoreRowModel,
//   useReactTable,
// } from "@tanstack/react-table";
// import TableUI from "./TableUI";

// type tableProps<T> = {
//   columns: ColumnDef<T, any>[];
// };

// export default function TableLoading<T>({ columns }: tableProps<T>) {
//   const table = useReactTable({
//     columns,
//     data: [],
//     getCoreRowModel: getCoreRowModel(),
//   });
//   return (
//     <>
//       <TableUI<T> table={table} />
//       <div>
//         {new Array(5).fill(undefined).map((_, index) => {
//           return (
//             <Skeleton
//               key={`_table-skeleton_ ${index}`}
//               sx={{ width: "100%", height: "70px", borderRadius: "0px" }}
//             />
//           );
//         })}
//       </div>
//     </>
//   );
// }
