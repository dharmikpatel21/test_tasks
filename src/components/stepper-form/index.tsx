"use client";

import { useState } from "react";
import { FieldValues, FormProvider, useForm } from "react-hook-form";
import Step1 from "./step1";
import Step3 from "./step3";
import Step2 from "./step2";
import { Button } from "@/components/ui/button";

const steps = ["Personal Info", "Contact Details", "Additional Info"];

const StepperForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const methods = useForm({
    mode: "onBlur", // triggers validation on blur
  });

  const { trigger, handleSubmit } = methods;

  const handleNext = async () => {
    // Determine which fields belong to current step
    let fieldsToValidate: string[] = [];
    if (activeStep === 0) fieldsToValidate = ["firstName", "lastName"];
    if (activeStep === 1) fieldsToValidate = ["email", "phone"];

    // Trigger validation for current step fields
    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const onSubmit = (data: FieldValues) => {
    console.log("====================================");
    console.log("data", data);
    console.log("====================================");
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return <Step1 />;
      case 1:
        return <Step2 />;
      case 2:
        return <Step3 />;
      default:
        return <Step1 />;
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {steps.map((label, index) => (
            <div key={label} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${
                    activeStep === index
                      ? "bg-blue-600 text-white"
                      : activeStep > index
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                  }`}
              >
                {activeStep > index ? "✓" : index + 1}
              </div>
              <span
                className={`text-xs mt-2 ${activeStep === index ? "text-blue-600 font-medium" : "text-gray-500"}`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
        {/* Progress bar line between steps */}
        <div className="relative flex justify-center -mt-8 mb-8 -z-10 px-8">
          <div className="w-full h-1 bg-gray-200 rounded">
            <div
              className="h-full bg-blue-600 rounded transition-all duration-300"
              style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="min-h-[200px] mb-8">{renderStep()}</div>

          <div className="flex justify-between mt-8 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button type="submit">Submit Validation</Button>
            ) : (
              <Button type="button" onClick={handleNext}>
                Next
              </Button>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default StepperForm;
