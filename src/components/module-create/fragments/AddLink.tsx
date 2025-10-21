import ErrorMessage from "@/common/forms/ErrorMessage";
import { TextField } from "@mui/material";
import { useTranslations } from "next-intl";

type externalLinkProps = {
  value?: string;
  setContent: (d: string) => void;
  setError: (d: string) => void;
  error?: string;
};
const ExternalLink: React.FC<externalLinkProps> = ({
  value,
  setContent,
  error,
  setError,
}) => {
  // const
  const t = useTranslations();
  const changeHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    try {
      new URL(e.target.value);
      setError(""); // Clear error if valid
    } catch {
      setError(t("VALID_URL"));
    }
  };
  return (
    <div className="">
      <TextField
        value={value || ""}
        fullWidth
        onChange={changeHandler}
        className=""
        placeholder={t("MODULE.GOOGLE_WEBSITE")}
      />

      <ErrorMessage message={error} />
    </div>
  );
};

export default ExternalLink;
