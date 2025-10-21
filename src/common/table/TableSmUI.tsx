// import { Cell, flexRender, Row, Table } from "@tanstack/react-table";
// import { Fragment } from "react/jsx-runtime";
// import OptionsIcon from "../icons/pack/OptionsIcon";
// import AppMenuWrapper from "../utilities/AppMenuWrapper";

// type props<T> = {
//   table: Table<T>;
// };

// export default function TableSmUI<T>({ table }: props<T>) {
//   return (
//     <div className="w-full">
//       {table.getRowModel().rows.map((row) => {
//         return (
//           <Fragment key={`${crypto.randomUUID()}`}>
//             {displayRow(
//               row.getVisibleCells().filter((item) => {
//                 const columnId = item.column.columnDef?.id ?? "";
//                 return columnId.startsWith("mob");
//               }),
//               row,
//             )}
//           </Fragment>
//         );
//       })}
//     </div>
//   );
// }

// function displayRow<T>(cells: Cell<T, unknown>[], row: Row<T>) {
//   if (cells.length < 1) {
//     return <></>;
//   }

//   const actions = cells.find((cell) => {
//     return /[Aa]ction/.test(cell.column.columnDef?.id ?? "");
//   });

//   return (
//     <div
//       className={`mb-4 flex h-[90px] w-full rounded-xl border border-b-[#EBF2FA] px-6 py-4 ${row.getIsSelected() && "!border-b-4 !border-white bg-primaryColorLight"}`}
//     >
//       <div
//         key={row.id + `_${crypto.randomUUID()}`}
//         className={`flex h-full w-full flex-col flex-wrap justify-center gap-x-4 gap-y-2`}
//       >
//         {cells.map((cell, index) => {
//           if (/[Aa]ction/.test(cell.column.columnDef?.id ?? "")) {
//             return <Fragment key={cell.id}></Fragment>;
//           }

//           return (
//             //TODO text-wrap
//             <span
//               className={`w-[22ch] overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-[#3A3A3A] ${index > 1 && "ml-auto hidden xs:inline-block"}`}
//               key={cell.id}
//             >
//               {flexRender(cell.column.columnDef.cell, cell.getContext())}
//             </span>
//           );
//         })}
//       </div>
//       {actions && (
//         <div className="flex !w-[15px] items-center justify-center">
//           <AppMenuWrapper
//             header={
//               <div className="rotate-90">
//                 <OptionsIcon />
//               </div>
//             }
//             border={false}
//           >
//             {flexRender(actions.column.columnDef.cell, actions.getContext())}
//           </AppMenuWrapper>
//         </div>
//       )}
//     </div>
//   );
// }
