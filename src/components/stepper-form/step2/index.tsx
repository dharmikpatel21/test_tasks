import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";

const Step2 = () => {
  const { control } = useFormContext();
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Contact Details</h2>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <Controller
          name="email"
          control={control}
          rules={{
            required: "Email is required",
            pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" },
          }}
          render={({ field, fieldState: { error } }) => (
            <>
              <Input
                {...field}
                type="email"
                placeholder="Email Address"
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
        <label className="block text-sm font-medium mb-1">Phone Number</label>
        <Controller
          name="phone"
          control={control}
          rules={{ required: "Phone number is required" }}
          render={({ field, fieldState: { error } }) => (
            <>
              <Input
                {...field}
                placeholder="Phone Number"
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

export default Step2;
