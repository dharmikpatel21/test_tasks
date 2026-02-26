import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { error } from "console";

const Step1 = () => {
  const { control } = useFormContext();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Personal Information</h2>
      <div>
        <label className="block text-sm font-medium mb-1">First Name</label>
        <Controller
          name="firstName"
          control={control}
          rules={{ required: "First name is required" }}
          render={({ field, fieldState: { error } }) => (
            <>
              <Input
                {...field}
                placeholder="First Name"
                className={error ? "border-red-500" : ""}
              />
              {error && (
                <p className="text-red-500 text-xs mt-1">{error.message}</p>
              )}
            </>
          )}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Last Name</label>
        <Controller
          name="lastName"
          control={control}
          rules={{ required: "Last name is required" }}
          render={({ field, fieldState: { error } }) => (
            <>
              <Input
                {...field}
                placeholder="Last Name"
                className={error ? "border-red-500" : ""}
              />
              {error && (
                <p className="text-red-500 text-xs mt-1">{error.message}</p>
              )}
            </>
          )}
        />
      </div>
    </div>
  );
};

export default Step1;
