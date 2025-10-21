// import {
//   ColumnDef,
//   getCoreRowModel,
//   useReactTable,
// } from "@tanstack/react-table";
// import TableSmUI from "./TableSmUI";
// import TableUI from "./TableUI";

// type props<T> = {
//   data: T[];
//   columns: ColumnDef<T, any>[];
//   className?: string;
// };

// export default function DefaultTable<T>({
//   data,
//   columns,
//   className,
// }: props<T>) {
//   const table = useReactTable({
//     columns,
//     data,
//     getCoreRowModel: getCoreRowModel(),
//   });
//   return (
//     <>
//       <div className={`hidden xl:block ${className}`}>
//         <TableUI<T> table={table} />
//       </div>
//       <div className={`xl:hidden ${className}`}>
//         <TableSmUI<T> table={table} />
//       </div>
//     </>
//   );
// }
