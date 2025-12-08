import { useField, Field } from "formik";
import React, { useState } from "react";

interface CustomInputProps {
    inputType: "number-input" | "password" | "text-input" | string;
    type?: string;
    placeholder?: string;
    id?: string;
    name: string;
    label?: string;
    className?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value?: string;
    required?: boolean;
    disabled?: boolean;
    autoComplete?: string;
    autoFocus?: boolean;
    style?: React.CSSProperties;
    icon?: string;
    icon2?: string;
    maxInput?: number
}

const ReusableInputs: React.FC<CustomInputProps> = ({
    inputType,
    id,
    name,
    label,
    placeholder,
    type,
    icon,
    maxInput,
    disabled,
    icon2
}) => {
    const [field, meta] = useField(name);
    const [secured, setSecured] = useState(true);

    const renderIcon = (iconClass?: string, onClick?: () => void) =>
        iconClass && (
            <div className="p-2 border bg-gray rounded-end-0 rounded">
                <i className={iconClass} role={onClick ? "button" : undefined} onClick={onClick}></i>
            </div>
        );

    const renderEndIcon = (iconClass?: string, onClick?: () => void) =>
        iconClass && (
            <div className="p-2 border bg-gray rounded-start-0 rounded">
                <i className={iconClass} role={onClick ? "button" : undefined} onClick={onClick}></i>
            </div>
        );

    const renderInputField = () => {
        switch (inputType) {
            case "number-input":
                return (
                    <Field
                        {...field}
                        type="number"
                        name={name}
                        disabled={disabled}
                        className="form-control p-2"
                        id={id}
                        max={maxInput}
                        placeholder={placeholder}
                        style={{
                            outline: 'none',
                            boxShadow: 'none'
                        }}
                    />
                );

            case "password":
                return (
                    <Field
                        {...field}
                        type={secured ? "password" : "text"}
                        name={name}
                        className="form-control rounded-end-0 p-2"
                        id={id}
                        placeholder={placeholder}
                    />
                );

            case "text-input":
                return (
                    <Field
                        {...field}
                        type={type}
                        name={name}
                        className="form-control p-2"
                        disabled={disabled}
                        id={id}
                        placeholder={placeholder}
                    />
                );

            case "text-area":
                return (
                    <Field
                        {...field}
                        as="textarea"
                        name={name}
                        className="form-control p-2"
                        id={id}
                        placeholder={placeholder}
                        disabled={disabled}
                    />
                );

            default:
                return (
                    <Field
                        {...field}
                        name={name}
                        className="form-control p-2 rounded-0 outline-0"
                        id={id}
                        placeholder={placeholder}
                        disabled={disabled}
                    />
                );
        }
    };

    return (
        <div className="form-group w-100 mt-2">
            {label && (
                <label htmlFor={id} className="fw-medium m-1 text-dark">
                    {label}
                </label>
            )}
            <div className="d-flex align-items-center">
                {renderIcon(icon)}
                {renderInputField()}
                {inputType === "password" && renderEndIcon(icon2, () => setSecured(!secured))}
            </div>
        </div>
    );
};

export default ReusableInputs;
