import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import * as React from "react";

type props = {
  total: number;
  callback: (limit: number) => void;
  current?: number;
};

const TableLimit: React.FC<props> = ({ total, callback, current = 10 }) => {
  const [age, setAge] = React.useState(current.toString());

  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value);
    callback(+event.target.value);
  };
  return (
    <div className="flex items-center font-medium text-[#595959]">
      <div>Showing</div>
      <FormControl
        sx={{ m: 1, marginTop: 0, marginBottom: 0, minWidth: 70 }}
        size="small"
      >
        <Select
          id="demo-limit"
          value={age}
          label="Limit"
          onChange={handleChange}
        >
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={30}>30</MenuItem>
          <MenuItem value={40}>40</MenuItem>
          <MenuItem value={50}>50</MenuItem>
        </Select>
      </FormControl>
      <div className="flex items-center gap-2">
        <span>of</span>
        <span>{total}</span>
      </div>
    </div>
  );
};

export default TableLimit;
