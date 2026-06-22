import { Skeleton, TableCell, TableRow } from "@mui/material";

interface TableSkeletonProps {
  rows: number;
  columns: number;
}

const TableSkeletonRows = ({ rows, columns }: TableSkeletonProps) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};

export default TableSkeletonRows;
