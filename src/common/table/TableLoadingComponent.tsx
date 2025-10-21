// import { ColumnDef } from "@tanstack/react-table";
// import { ReactNode } from "react";
// import ErrorScreen from "../errorComponents/ErrorScreen";
// import CenterOnLgScreen from "../utilities/CenterLgScreen";
// import EmptyDataDisplay from "../utilities/EmptyData";
// import TableLoading from "./TableLoading";

// type callback<T> = (data: T) => ReactNode;

// type TableLoadingComponentProps<T> = {
//   loading: boolean;
//   loadingComponent?: ReactNode;
//   empty: boolean;
//   emptyComponent?: ReactNode;
//   error: boolean;
//   errorComponent?: ReactNode;
//   data: T;
//   reload: () => void;
//   isFetching: boolean;
//   columns: ColumnDef<any, any>[];
//   children?: callback<T> | ReactNode;
// };
// const TableLoadingComponent = <Y,>({
//   loading,
//   loadingComponent: lCmp,
//   empty,
//   error,
//   emptyComponent,
//   errorComponent,
//   children,
//   reload,
//   columns,
//   isFetching,
//   data,
// }: TableLoadingComponentProps<Y>) => {
//   if (loading) {
//     return (
//       lCmp || (
//         <CenterOnLgScreen>
//           <TableLoading columns={columns} />
//         </CenterOnLgScreen>
//       )
//     );
//   }

//   if (error && !loading) {
//     return errorComponent || <ErrorScreen reload={reload} />;
//   }

//   if (empty && !loading && !isFetching) {
//     return emptyComponent || <EmptyDataDisplay />;
//   }

//   return (
//     <div className={`${isFetching && "opacity-50"}`}>
//       {typeof children === "function" ? children(data) : children}
//     </div>
//   );
// };

// export default TableLoadingComponent;
