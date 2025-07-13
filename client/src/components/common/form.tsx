import { Input } from "../ui/input";
import React from "react";

// Define the shape of a single form control item
type FormControlItem = {
  type: string;
  name: string;
  placeholder: string;
};

// Define the props for the CommonForm component
type CommonFormProps = {
  formControls: FormControlItem[];
};

const CommonForm: React.FC<CommonFormProps> = ({ formControls }) => {

  const renderInputsByComponentType = (getControlItem: FormControlItem): React.ReactElement | null => {
    switch (getControlItem.type) {
      case "input":
        return (
          <Input
          name={getControlItem.name}
          placeholder={getControlItem.placeholder}
          id={getControlItem.name}
          type={getControlItem.type}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {formControls.map((item) => renderInputsByComponentType(item))}
    </div>
  );
};

export default CommonForm;
