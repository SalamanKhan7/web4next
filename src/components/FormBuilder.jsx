import { useState } from "react";
import {
  useForm,
  Controller,
  useFormContext,
  FormProvider,
} from "react-hook-form";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import styles from "./FormBuilder.module.css";
// Available form elements
const formElements = [
  { id: "number", label: "Number Input" },
  { id: "text", label: "Text Input" },
  { id: "email", label: "Email Input" },
  { id: "checkbox", label: "Checkbox" },
  { id: "radio", label: "Radio Button" },
  { id: "textarea", label: "Textarea" },
  { id: "select", label: "Dropdown" },
  { id: "date", label: "Date Picker" },
  { id: "file", label: "File Upload" },
];

// Draggable element component
const DraggableElement = (prop) => {
  const { element } = prop;
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "FORM_ELEMENT",
    item: { element },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`${styles.draggable} ${isDragging ? styles.dragging : ""}`}
    >
      {element.label}
    </div>
  );
};

// Drop area where elements are added
const DropArea = (prop) => {
  const { onDrop, formElements, onRemove } = prop; // Add onRemove prop
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "FORM_ELEMENT",
    drop: (item) => onDrop(item.element),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`${styles.dropArea} ${isOver ? styles.dropAreaActive : ""}`}
    >
      {formElements.length === 0 ? (
        <p className={styles.placeholder}>Drag elements here</p>
      ) : (
        formElements.map((element, index) => (
          <div key={index} className={styles.formElementWrapper}>
            <FormInput element={element} name={`field${index}`} />
            {/* Remove button */}
            <button
              type="button"
              className={styles.removeButton}
              onClick={() => onRemove(index)}
            >
              ❌
            </button>
          </div>
        ))
      )}
    </div>
  );
};

// Input components rendered dynamically
const FormInput = (prop) => {
  const { element, name } = prop;
  const { control } = useFormContext();

  switch (element.id) {
    case "number":
      return (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <input
              type="number"
              {...field}
              placeholder="Enter number"
              className={styles.input}
            />
          )}
        />
      );
    case "text":
      return (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder="Enter text"
              className={styles.input}
            />
          )}
        />
      );
    case "email":
      return (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <input
              type="email"
              {...field}
              placeholder="Enter email"
              className={styles.input}
            />
          )}
        />
      );
    case "checkbox":
      return (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <label className={styles.checkboxLabel}>
              <input type="checkbox" {...field} className={styles.checkbox} />
              Checkbox
            </label>
          )}
        />
      );
    case "radio":
      return (
        <Controller
          name={name}
          control={control}
          defaultValue=""
          render={({ field }) => (
            <div className={styles.radioGroup}>
              <label>
                <input
                  type="radio"
                  value="option1"
                  checked={field.value === "option1"}
                  onChange={() => field.onChange("option1")}
                />
                Option 1
              </label>
              <label>
                <input
                  type="radio"
                  value="option2"
                  checked={field.value === "option2"}
                  onChange={() => field.onChange("option2")}
                />
                Option 2
              </label>
            </div>
          )}
        />
      );
    case "textarea":
      return (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              placeholder="Enter your text"
              className={styles.textarea}
            />
          )}
        />
      );
    case "select":
      return (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <select {...field} className={styles.select}>
              <option value="">Select an option</option>
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
              <option value="option3">Option 3</option>
            </select>
          )}
        />
      );
    case "date":
      return (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <input type="date" {...field} className={styles.input} />
          )}
        />
      );
    case "file":
      return (
        <Controller
          name={name}
          control={control}
          defaultValue={null}
          render={({ field }) => (
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                field.onChange(file); // Update form state with the selected file
              }}
              className={styles.inputFile}
            />
          )}
        />
      );
    default:
      return null;
  }
};

// Main form builder component
const FormBuilder = () => {
  const [selectedElements, setSelectedElements] = useState([]);
  const methods = useForm(); // Initialize react-hook-form methods
  const { handleSubmit, reset } = methods;
  const onRemoveElement = (index) => {
    setSelectedElements((prev) => prev.filter((_, i) => i !== index));
  };
  const onDrop = (element) => {
    setSelectedElements((prev) => [...prev, element]);
  };

  const onSubmit = (data) => {
    const processedData = { ...data };
    // Convert file objects to their name for display purposes
    Object.keys(processedData).forEach((key) => {
      if (processedData[key] instanceof File) {
        processedData[key] = processedData[key].name;
      }
    });

    alert(JSON.stringify(processedData, null, 2));
    reset();
    setSelectedElements([]);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.container}>
        <div>
          <h2 className={styles.title}>Available Form Elements</h2>
          {formElements.map((element) => (
            <DraggableElement key={element.id} element={element} />
          ))}
        </div>
        <div>
          <h2 className={styles.title}>Build Your Form</h2>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DropArea
                onDrop={onDrop}
                formElements={selectedElements}
                onRemove={onRemoveElement}
              />
              {selectedElements.length > 0 && (
                <button type="submit" className={styles.submitButton}>
                  Submit Form
                </button>
              )}
            </form>
          </FormProvider>
        </div>
      </div>
    </DndProvider>
  );
};

export default FormBuilder;
