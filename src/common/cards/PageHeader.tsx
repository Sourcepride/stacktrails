import { Typography, useTheme } from "@mui/material";

type props = {
  headerText: string;
  shortText?: string;
  id?: string;
};

const PageHeaderText: React.FC<props> = ({ headerText, shortText, id }) => {
  const theme = useTheme();
  return (
    <div>
      <Typography
        sx={{
          fontWeight: "600",
          lineHeight: "30px",
          fontSize: "22px",
          textTransform: "capitalize",
        }}
        variant="h1"
        {...(id && { id })}
      >
        {headerText}
      </Typography>
      <Typography
        sx={{
          fontSize: "14px",
          fontWeight: "600",
          lineHeight: "24px",
          textTransform: "capitalize",
        }}
        color={theme.palette.primary.main}
        className={`hidden font-bold ${shortText ? "" : "!hidden"} lg:block`}
        variant="body1"
      >
        {shortText}
      </Typography>
    </div>
  );
};

export default PageHeaderText;
