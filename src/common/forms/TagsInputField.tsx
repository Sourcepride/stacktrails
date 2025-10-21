"use client";

import { Box, Chip, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

interface TagsInputFieldProps {
  name: string;
  label?: string;
  maxTags?: number;
  recommended?: string[];
}

// Tell TypeScript that the field array items have a `value` string property
type TagItem = { value: string };

export default function TagsInputField({
  name,
  label = "Tags",
  maxTags = 20,
  recommended = [],
}: TagsInputFieldProps) {
  const { control } = useFormContext<{ [key: string]: TagItem[] }>();
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const [inputValue, setInputValue] = useState("");

  const handleAddTag = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (fields.some((t) => (t as TagItem).value === trimmed)) return;
    if (fields.length >= maxTags) return;
    append({ value: trimmed });
    setInputValue("");
  };

  const handleDelete = (index: number) => remove(index);

  const handleRecommendedClick = (tag: string) => {
    if (!fields.some((t) => (t as TagItem).value === tag))
      append({ value: tag });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
        {label} (maximum {maxTags})
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Tags help people find your content.
      </Typography>

      <TextField
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add tags..."
        fullWidth
        variant="outlined"
        size="small"
      />

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
        {fields.map((tag, index) => (
          <Chip
            key={tag.id}
            label={(tag as TagItem).value}
            onDelete={() => handleDelete(index)}
            color="primary"
            variant="outlined"
          />
        ))}
      </Box>

      {recommended.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Recommended Tags
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {recommended.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onClick={() => handleRecommendedClick(tag)}
                color="secondary"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
