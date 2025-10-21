"use client";
import { IconButton } from "@mui/material";
import { FiCheck } from "@react-icons/all-files/fi/FiCheck";
import { FiEdit } from "@react-icons/all-files/fi/FiEdit";
import { FiPlus } from "@react-icons/all-files/fi/FiPlus";
import { FiX } from "@react-icons/all-files/fi/FiX";
import React, { useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import AppTextField from "./AppTextField";

type StringArrayInputProps = {
  name: string;
  label?: string;
};

const StringArrayInput: React.FC<StringArrayInputProps> = ({ name, label }) => {
  const { control, getValues, trigger } = useFormContext();
  const { fields, append, remove, update } = useFieldArray({
    control,
    name,
  });

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleAdd = () => {
    append(""); // add empty string
    // Use setTimeout or useEffect to ensure fields array is updated
    setTimeout(() => {
      setEditIndex(fields.length); // This will now be the correct index
      setEditValue("");
    }, 0);
  };

  // Alternative approach using useEffect to handle the timing issue
  useEffect(() => {
    if (editIndex === fields.length - 1 && fields.length > 0) {
      // This ensures we're editing the newly added item
      const lastField = fields[fields.length - 1];
      if (!getValues(`${name}.${fields.length - 1}`)) {
        setEditIndex(fields.length - 1);
        setEditValue("");
      }
    }
  }, [fields.length, name, getValues, editIndex]);

  const handleUpdate = async (index: number) => {
    if (editValue.trim() !== "") {
      update(index, editValue.trim());
    } else {
      // If empty value, remove the item
      remove(index);
    }
    setEditIndex(null);
    setEditValue("");
    await trigger(name);
  };

  const handleEdit = (index: number) => {
    setEditIndex(index);
    // Get the current value from the form state
    const currentValues = getValues(name);
    setEditValue(currentValues[index] || "");
  };

  const handleCancelEdit = () => {
    // If we're editing a newly added empty item, remove it
    if (editIndex !== null) {
      const currentValues = getValues(name);
      if (!currentValues[editIndex] || currentValues[editIndex].trim() === "") {
        remove(editIndex);
      }
    }
    setEditIndex(null);
    setEditValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && editIndex !== null) {
      handleUpdate(editIndex);
    }
    if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <div className="w-full">
      <div className="my-4 flex justify-end">
        {/* Link-style button with plus icon */}
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1 text-primary hover:text-primary-dark transition-colors duration-200 text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 rounded px-1"
        >
          <FiPlus size={16} />
          {label || "Add Item"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:gap-8 gap-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex items-center gap-2 p-3 bg-base rounded-lg border border-gray-200"
          >
            <IconButton
              color="error"
              size="small"
              onClick={() => remove(index)}
              title="Remove item"
            >
              <FiX />
            </IconButton>

            {editIndex === index ? (
              <>
                <input
                  className="flex-1 rounded border border-primary px-2 py-1 text-sm h-full min-h-[40px] bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={`Item ${index + 1}`}
                  autoFocus
                />
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() => handleUpdate(index)}
                  title="Save changes"
                >
                  <FiCheck />
                </IconButton>
                <IconButton
                  color="default"
                  size="small"
                  onClick={handleCancelEdit}
                  title="Cancel editing"
                >
                  <FiX />
                </IconButton>
              </>
            ) : (
              <>
                <AppTextField
                  control={control}
                  name={`${name}.${index}`}
                  className="bg-white w-full "
                  disabled
                />
                <IconButton
                  color="secondary"
                  size="small"
                  onClick={() => handleEdit(index)}
                  title="Edit item"
                >
                  <FiEdit />
                </IconButton>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StringArrayInput;
