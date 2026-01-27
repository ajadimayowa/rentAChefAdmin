import React, { useState } from "react";

interface MultiSelectDropdownProps {
  options: { id: string; name: string }[];
  label?: string;
  value: string[]; // Formik value
  onChange: (selectedIds: string[]) => void;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  label,
  value,
  onChange,
}) => {
  const [open, setOpen] = useState(false);

  const handleToggle = (id: string) => {
    const updated = value.includes(id)
      ? value.filter((v) => v !== id)
      : [...value, id];

    onChange(updated); // ✅ always array
  };

  const selectedNames = options
    .filter((o) => value.includes(o.id))
    .map((o) => o.name)
    .join(", ");

  return (
    <div style={{ marginBottom: 16, position: "relative" }}>
      {label && <label>{label}</label>}

      <div
        style={{
          border: "1px solid #ccc",
          padding: "8px 12px",
          borderRadius: 4,
          cursor: "pointer",
        }}
        onClick={() => setOpen(!open)}
      >
        {selectedNames || "Select..."}
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            zIndex: 10,
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: 4,
            marginTop: 4,
            width: "100%",
            maxHeight: 200,
            overflowY: "auto",
          }}
        >
          {options.map((option) => (
            <label
              key={option.id}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 12px",
              }}
            >
              <input
                type="checkbox"
                checked={value.includes(option.id)}
                onChange={() => handleToggle(option.id)}
              />
              <span style={{ marginLeft: 8 }}>{option.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;