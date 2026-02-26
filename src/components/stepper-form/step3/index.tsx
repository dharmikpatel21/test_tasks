import React from "react";
import { useFormContext, Controller } from "react-hook-form";

const Step3 = () => {
  const { control } = useFormContext();
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Additional Information</h2>
      <div>
        <label className="block text-sm font-medium mb-1">Address</label>
        <Controller
          name="address"
          control={control}
          rules={{ required: "Address is required" }}
          render={({ field, fieldState: { error } }) => (
            <>
              <textarea
                {...field}
                className={`w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-500 ring-red-500" : ""}`}
                placeholder="Full Address"
                rows={3}
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

export default Step3;
